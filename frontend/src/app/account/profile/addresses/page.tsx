"use client";

import { AddressFormModal } from "@/components/addresses/AddressFormModal";
import { ConfirmDeleteModal } from "@/components/addresses/ConfirmDeleteModal";
import { MobileBackHeader } from "@/components/layout/MobileBackHeader";
import { Button, PageLoading } from "@/components/ui";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs/Breadcrumbs";
import { useAddresses } from "@/lib/hooks/useAddresses";
import { Address } from "@/lib/services/address.service";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddressesPage() {
  const router = useRouter();
  const {
    addresses,
    isLoading,
    isActionLoading,
    deleteAddress,
    setDefaultAddress,
  } = useAddresses();

  // Estados do modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);

  /**
   * Abre modal para adicionar novo endereço
   */
  const handleAddNew = () => {
    setEditingAddress(null);
    setIsFormOpen(true);
  };

  /**
   * Abre modal para editar endereço
   */
  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  /**
   * Fecha modal de formulário
   */
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
  };

  /**
   * Abre modal de confirmação de deleção
   */
  const handleDeleteClick = (address: Address) => {
    setDeletingAddress(address);
  };

  /**
   * Confirma deleção
   */
  const handleConfirmDelete = async () => {
    if (!deletingAddress) return;

    const result = await deleteAddress(deletingAddress.id);

    if (result.success) {
      setDeletingAddress(null);
    } else {
      alert(result.error || "Erro ao remover endereço");
    }
  };

  /**
   * Cancela deleção
   */
  const handleCancelDelete = () => {
    setDeletingAddress(null);
  };

  /**
   * Define endereço como padrão
   */
  const handleSetDefault = async (id: number) => {
    const result = await setDefaultAddress(id);

    if (!result.success) {
      alert(result.error || "Erro ao definir endereço padrão");
    }
  };

  /**
   * Formata endereço em uma linha
   */
  const formatAddressOneLine = (address: Address) => {
    return `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ""}, ${address.neighborhood}, ${address.city} - ${address.state}, ${address.zipCode}`;
  };

  if (isLoading) {
    return <PageLoading text="Carregando endereços..." />;
  }

  return (
    <>
      <div className="min-h-screen bg-white pb-24 lg:py-8">
        <MobileBackHeader
          title="Meus endereços"
          onBackClick={() => router.back()}
        />

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between flex-wrap max-w-7xl mx-auto px-8.5">
          <div>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Meu perfil", href: "/account/profile" },
                { label: "Meus endereços" },
              ]}
            />
            <h1 className="text-3xl lg:text-[32px] leading-[100%] mt-4">
              Meus endereços
            </h1>
          </div>
          <div className="">
            <Button
              onClick={handleAddNew}
              variant="gold"
              className="w-full lg:w-auto"
              disabled={isActionLoading}
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar novo endereço
            </Button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-6 lg:mt-8">
          {/* Botão adicionar novo */}

          {/* Lista de endereços */}
          {addresses.length === 0 ? (
            // Estado vazio
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl mb-2">Nenhum endereço cadastrado</h2>
              <p className="text-gray-500 text-center mb-6 max-w-sm">
                Adicione um endereço para facilitar suas compras futuras
              </p>
              <Button onClick={handleAddNew} variant="gold">
                Adicionar primeiro endereço
              </Button>
            </div>
          ) : (
            // Grid de endereços
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`bg-[#F7F7F7] rounded-xl p-8 flex flex-col h-full transition-all ${
                    address.isDefault
                      ? "border-[#D5A60A]"
                      : "border-[#EFEFEF] hover:border-[#D5A60A]"
                  }`}
                >
                  {/* Header do card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {/* Flag do país */}
                      {/* {address.country.toLowerCase().includes("brasil") ? (
                        <Image
                          src="/icons/flag-br.svg"
                          alt="Brasil"
                          width={24}
                          height={16}
                        />
                      ) : (
                        <Image
                          src="/icons/flag-us.svg"
                          alt="USA"
                          width={24}
                          height={16}
                        />
                      )} */}

                      {/* Label e badge padrão */}
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {address.label || "Endereço"}
                        </span>
                        {address.isDefault && (
                          <span className="px-2 py-0.5 bg-[#D5A60A] text-white text-xs rounded-full">
                            Padrão
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botão deletar */}
                    <button
                      onClick={() => handleDeleteClick(address)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      disabled={isActionLoading}
                      aria-label="Remover endereço"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Destinatário */}
                  <p className="font-medium text-sm mb-2">
                    {address.recipientName}
                  </p>

                  {/* Endereço completo */}
                  <p className="text-sm text-gray-600 mb-1">
                    {address.street}, {address.number}
                    {address.complement && ` - ${address.complement}`}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    {address.neighborhood}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    {address.city} - {address.state}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    CEP: {address.zipCode}
                  </p>

                  {/* Telefone (se houver) */}
                  {address.phone && (
                    <p className="text-sm text-gray-600 mb-3">
                      Tel: {address.phone}
                    </p>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <Button
                      onClick={() => handleEdit(address)}
                      variant="stroke"
                      className="flex-1"
                      disabled={isActionLoading}
                    >
                      Editar
                    </Button>

                    {!address.isDefault && (
                      <Button
                        onClick={() => handleSetDefault(address.id)}
                        variant="stroke"
                        className="flex-1"
                        disabled={isActionLoading}
                      >
                        Definir como padrão
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de formulário */}
      <AddressFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        address={editingAddress}
      />

      {/* Modal de confirmação de deleção */}
      <ConfirmDeleteModal
        isOpen={!!deletingAddress}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        addressLabel={deletingAddress?.label || "Endereço"}
        isLoading={isActionLoading}
      />
    </>
  );
}
