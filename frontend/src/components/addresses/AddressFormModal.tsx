// src/components/addresses/AddressFormModal.tsx
"use client";

import { Button, Input, Select } from "@/components/ui";
import { useAddresses } from "@/lib/hooks/useAddresses";
import { Address, AddressInput } from "@/lib/services/address.service";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  address?: Address | null;
}

const INITIAL_FORM_DATA: AddressInput = {
  label: "",
  recipientName: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Brasil",
  phone: "",
  isDefault: false,
};

export function AddressFormModal({
  isOpen,
  onClose,
  address,
}: AddressFormModalProps) {
  const { createAddress, updateAddress, isActionLoading } = useAddresses();
  const [formData, setFormData] = useState<AddressInput>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!address;

  // Bloquear scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      // Salvar o scroll atual
      const scrollY = window.scrollY;

      // Adicionar classes para bloquear scroll
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      // Restaurar scroll
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";

      // Restaurar posição do scroll
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    // Cleanup: garantir que o scroll seja restaurado ao desmontar
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [isOpen]);

  // Preencher form ao editar
  useEffect(() => {
    if (address) {
      setFormData({
        label: address.label || "",
        recipientName: address.recipientName,
        street: address.street,
        number: address.number,
        complement: address.complement || "",
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone || "",
        isDefault: address.isDefault,
      });
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
    setErrors({});
  }, [address, isOpen]);

  /**
   * Valida campos obrigatórios
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = "Nome do destinatário é obrigatório";
    }
    if (!formData.street.trim()) {
      newErrors.street = "Rua é obrigatória";
    }
    if (!formData.number.trim()) {
      newErrors.number = "Número é obrigatório";
    }
    if (!formData.neighborhood.trim()) {
      newErrors.neighborhood = "Bairro é obrigatório";
    }
    if (!formData.city.trim()) {
      newErrors.city = "Cidade é obrigatória";
    }
    if (!formData.state.trim()) {
      newErrors.state = "Estado é obrigatório";
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "CEP é obrigatório";
    }
    if (!formData.country.trim()) {
      newErrors.country = "País é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Manipula mudança nos inputs
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Limpar erro do campo ao digitar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Submete formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    let result;

    if (isEditing) {
      result = await updateAddress(address!.id, formData);
    } else {
      result = await createAddress(formData);
    }

    if (result.success) {
      onClose();
    } else {
      alert(result.error || "Erro ao salvar endereço");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="scrollbar-subtle relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-medium">
            {isEditing ? "Editar Endereço" : "Novo Endereço"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isActionLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Label/Apelido */}
          <Input
            type="text"
            name="label"
            value={formData.label}
            label="Apelido do endereço (opcional)"
            onChange={handleChange}
            placeholder="Ex: Casa, Trabalho, Mãe, etc"
          />

          {/* Nome do destinatário */}
          <Input
            type="text"
            name="recipientName"
            value={formData.recipientName}
            onChange={handleChange}
            label="Nome do destinatário *"
            placeholder="Nome completo"
            error={errors.recipientName as string}
          />

          {/* CEP */}
          <Input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            label="CEP *"
            placeholder="00000-000"
            error={errors.zipCode as string}
          />

          {/* Rua e Número */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                label="Rua *"
                placeholder="Nome da rua"
                error={errors.street as string}
              />
            </div>

            <div>
              <Input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleChange}
                label="Número *"
                placeholder="123"
                error={errors.number as string}
              />
            </div>
          </div>

          {/* Complemento */}
          <Input
            type="text"
            name="complement"
            value={formData.complement}
            onChange={handleChange}
            label="Complemento (opcional)"
            placeholder="Apto, sala, bloco, etc"
          />

          {/* Bairro */}
          <Input
            type="text"
            name="neighborhood"
            value={formData.neighborhood}
            onChange={handleChange}
            label="Bairro *"
            placeholder="Nome do bairro"
            error={errors.neighborhood as string}
          />

          {/* Cidade e Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              label="Cidade *"
              placeholder="Nome da cidade"
              error={errors.city as string}
            />

            <Input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              label="Estado *"
              placeholder="Ex: SP"
              maxLength={2}
              error={errors.state as string}
            />
          </div>

          {/* País */}
          <Select
            name="country"
            value={formData.country}
            onChange={handleChange}
            label="País *"
            placeholder="Selecione o país"
            error={errors.country}
          >
            <option value="Brasil">Brasil</option>
          </Select>

          {/* Telefone */}
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            label="Telefone (opcional)"
            autoComplete="off"
            inputMode="tel"
            leftElement={
              <div className="flex items-center gap-1">
                <Image
                  src="/icons/flag-br-input.svg"
                  alt="Brasil flag"
                  width={24}
                  height={24}
                />
                <span className="text-sm text-[#0E121B] tracking-[-0.006em]">
                  +55
                </span>
              </div>
            }
            className="pl-[90px]"
            //   error={errors.phone?.message}
          />

          {/* Endereço padrão */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              className="w-4 h-4 text-[#D5A60A] border-gray-300 rounded focus:ring-[#D5A60A]"
            />
            <label htmlFor="isDefault" className="text-sm">
              Definir como endereço padrão
            </label>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="stroke"
              className="flex-1"
              disabled={isActionLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="gold"
              className="flex-1"
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </div>
              ) : isEditing ? (
                "Atualizar"
              ) : (
                "Adicionar"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
