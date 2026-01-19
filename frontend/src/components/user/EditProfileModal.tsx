"use client";

import { Button, Input, Toast } from "@/components/ui";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Transition,
} from "@headlessui/react";
import { X } from "lucide-react";
import Image from "next/image";
import { Fragment, useEffect, useState } from "react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    name: string;
    email: string;
    phone?: string;
    country?: string;
    state?: string;
    city?: string;
  };
  onSave: (data: EditProfileFormData) => Promise<void>;
}

export interface EditProfileFormData {
  name: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
}

type ToastState = {
  message: string;
  type: "success" | "error";
};

const BRAZILIAN_STATES = [
  "Acre",
  "Alagoas",
  "Amapá",
  "Amazonas",
  "Bahia",
  "Ceará",
  "Distrito Federal",
  "Espírito Santo",
  "Goiás",
  "Maranhão",
  "Mato Grosso",
  "Mato Grosso do Sul",
  "Minas Gerais",
  "Pará",
  "Paraíba",
  "Paraná",
  "Pernambuco",
  "Piauí",
  "Rio de Janeiro",
  "Rio Grande do Norte",
  "Rio Grande do Sul",
  "Rondônia",
  "Roraima",
  "Santa Catarina",
  "São Paulo",
  "Sergipe",
  "Tocantins",
];

export function EditProfileModal({
  isOpen,
  onClose,
  userData,
  onSave,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState<EditProfileFormData>({
    name: userData.name,
    phone: userData.phone || "",
    country: userData.country || "Brasil",
    state: userData.state || "",
    city: userData.city || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Bloquear scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [isOpen]);

  // Resetar form quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: userData.name,
        phone: userData.phone || "",
        country: userData.country || "Brasil",
        state: userData.state || "",
        city: userData.city || "",
      });
      setErrors({});
    }
  }, [isOpen, userData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpar erro do campo ao editar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Nome deve ter no mínimo 3 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      await onSave(formData);
      setToast({
        message: "Dados atualizados com sucesso!",
        type: "success",
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setToast({
        message: error.message || "Erro ao salvar alterações. Tente novamente.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={toast.type === "success" ? 1500 : 3000}
        />
      )}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-150" onClose={handleClose}>
          <DialogBackdrop className="fixed inset-0 bg-black/30 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in" />

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <DialogPanel className="w-full max-w-[600px] transform overflow-hidden rounded-[32px] bg-white text-left align-middle shadow-xl transition-all data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white px-6 lg:px-12 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium text-pb-500">
                      Editar dados
                    </h2>
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isLoading}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                    >
                      <X className="w-6 h-6 text-pb-500" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit}>
                  <div className="px-6 lg:px-12 py-6 space-y-4">
                    {/* Email (read-only) */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-pb-500">E-mail</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <Image
                            src="/icons/envelope-outline.svg"
                            alt="Email"
                            width={20}
                            height={20}
                            className="opacity-50"
                          />
                        </div>
                        <input
                          type="email"
                          value={userData.email}
                          disabled
                          className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-gray-400">
                        O e-mail não pode ser alterado
                      </p>
                    </div>

                    {/* Nome */}
                    <div>
                      <Input
                        label="Nome *"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        icon="/icons/user-outline.svg"
                        iconAlt="User"
                        placeholder="Digite seu nome completo"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Telefone */}
                    <div>
                      <Input
                        label="Telefone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        error={errors.phone}
                        icon="/icons/phone.svg"
                        iconAlt="Phone"
                        placeholder="(00) 00000-0000"
                        disabled={isLoading}
                      />
                    </div>

                    {/* País */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-pb-500">País</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                          <Image
                            src="/icons/map-pin.svg"
                            alt="Location"
                            width={20}
                            height={20}
                          />
                        </div>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          disabled={isLoading}
                          className="w-full pl-12 pr-4 py-3 bg-[#F7F7F7] border border-[#EFEFEF] rounded-xl focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="Brasil">Brasil</option>
                        </select>
                      </div>
                    </div>

                    {/* Estado */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-pb-500">Estado</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                          <Image
                            src="/icons/map-pin.svg"
                            alt="Location"
                            width={20}
                            height={20}
                          />
                        </div>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          disabled={isLoading}
                          className="w-full pl-12 pr-4 py-3 bg-[#F7F7F7] border border-[#EFEFEF] rounded-xl focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="">Selecione um estado</option>
                          {BRAZILIAN_STATES.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Cidade */}
                    <div>
                      <Input
                        label="Cidade"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleChange}
                        error={errors.city}
                        icon="/icons/map-pin.svg"
                        iconAlt="Location"
                        placeholder="Digite sua cidade"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="sticky bottom-0 bg-white px-6 lg:px-12 py-6 border-t border-gray-100">
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="stroke"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        variant="gold"
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? "Salvando..." : "Salvar alterações"}
                      </Button>
                    </div>
                  </div>
                </form>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
