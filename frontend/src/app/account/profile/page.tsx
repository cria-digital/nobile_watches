"use client";

import { MobileBackHeader } from "@/components/layout/MobileBackHeader";
import {
  Breadcrumbs,
  Button,
  ErrorState,
  VerifiedBadge,
} from "@/components/ui";
import {
  EditProfileFormData,
  EditProfileModal,
} from "@/components/user/EditProfileModal";
import { UserNav } from "@/components/user/UserNav";
import { VerificationModal } from "@/components/verification/VerificationModal";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAddresses } from "@/lib/hooks/useAddresses";
import { getInitials } from "@/lib/utils/stringUtils";
import { Edit2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Profile() {
  const {
    data,
    isLoading,
    error,
    verificationStatus,
    isLoadingStatus,
    refetch,
    refetchVerificationStatus,
    updateUserData,
  } = useUserProfile();
  const {
    addresses,
    isLoading: loadingAddresses,
    setDefaultAddress,
    isActionLoading,
  } = useAddresses();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  const handleVerificationSubmitted = () => {
    refetch();
    refetchVerificationStatus();
  };

  const getVerificationButtonText = () => {
    if (isLoadingStatus) return "Verificando...";

    switch (verificationStatus) {
      case "pending":
        return "Verificação em análise";
      case "rejected":
        return "Reenviar verificação";
      default:
        return "Realizar verificação";
    }
  };

  const isVerificationButtonDisabled = () => {
    return isLoadingStatus || verificationStatus === "pending";
  };

  // Determina se um endereço deve ser considerado padrão
  // Se houver apenas 1 endereço, ele é automaticamente o padrão
  const isAddressDefault = (address: any) => {
    if (!addresses || addresses.length === 0) return false;
    if (addresses.length === 1) return true; // Único endereço é sempre padrão
    return address.isDefault; // Múltiplos endereços: usa a propriedade
  };

  // Verifica se o endereço pode ser clicado (não é padrão e há múltiplos endereços)
  const canSelectAddress = (address: any) => {
    if (!addresses || addresses.length <= 1) return false; // Não pode clicar se houver apenas 1
    return !address.isDefault; // Só pode clicar se não for o padrão
  };

  // Handler para alterar endereço padrão
  const handleSetDefaultAddress = async (addressId: number) => {
    const result = await setDefaultAddress(addressId);
    if (!result.success) {
      alert(result.error || "Erro ao definir endereço padrão");
    }
  };

  // Handler para salvar edição de dados pessoais
  const handleSaveProfileData = async (formData: EditProfileFormData) => {
    //@ts-ignore
    await updateUserData({
      name: formData.name,
      phone: formData.phone,
      country: formData.country,
      state: formData.state,
      city: formData.city,
    });
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500" />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Erro ao carregar perfil" description={error} />;
  }

  if (!data?.user) {
    return (
      <ErrorState
        title="Perfil não encontrado"
        description="Não foi possível carregar os dados do perfil."
      />
    );
  }

  const { user, activity, paymentMethods } = data;

  return (
    <div className="min-h-screen bg-white lg:py-8">
      <MobileBackHeader title="Perfil" />

      {/* Desktop */}
      <div className="hidden lg:flex items-center justify-between flex-wrap max-w-7xl mx-auto px-8.5">
        <div>
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Meu perfil" }]}
          />
          <h1 className="text-[32px] leading-[100%]">Meu perfil</h1>
        </div>
        <UserNav />
      </div>

      {/* ==================== LAYOUT DESKTOP ==================== */}
      <div className="hidden lg:block max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-6 gap-6 mt-8 mb-6">
          {/* Card de perfil principal - Desktop */}
          <div className="relative col-span-4 bg-[#F7F7F7] rounded-[12px] py-6 px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-7">
                {/* Avatar */}
                <div className="relative w-[118px] h-[118px] rounded-full overflow-hidden bg-gray-300 shrink-0">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gold-500 text-white text-4xl font-medium">
                      {getInitials(user?.name)}
                    </div>
                  )}
                </div>

                {/* Nome */}
                <h2 className="font-lato text-2xl font-normal leading-snug max-w-[400px] line-clamp-2">
                  Olá, <span className="font-semibold">{user.name}!</span>
                </h2>
              </div>

              {/* Status */}
              {user.isVerified ? (
                <VerifiedBadge role={user.role} />
              ) : (
                <Button
                  onClick={() => setIsVerificationModalOpen(true)}
                  variant="gold"
                  className="w-[260px]"
                  disabled={isVerificationButtonDisabled()}
                >
                  {getVerificationButtonText()}
                </Button>
              )}
            </div>
          </div>

          {/* Atividade - Desktop */}
          <div className="col-span-2 bg-[#F7F7F7] rounded-[12px] py-[28px] px-[32px]">
            <h3 className="font-lato font-medium mb-[7px]">Atividade</h3>
            <p className="text-xs text-gray-400 mb-[18px]">
              Aqui você visualiza suas conquistas na Nobile.
            </p>
            <div className="grid grid-cols-3 gap-[18px]">
              <div className="h-[72px] bg-white text-center p-[14px] rounded-[12px]">
                <p className="font-medium text-pb-500">{activity.vendidos}</p>
                <p className="text-sm text-gray-400 font-normal">Vendidos</p>
              </div>
              <div className="h-[72px] bg-white text-center p-[14px] rounded-[12px]">
                <p className="font-medium text-pb-500">{activity.comprados}</p>
                <p className="text-sm text-gray-400 font-normal">Comprados</p>
              </div>
              <div className="h-[72px] bg-white text-center p-[14px] rounded-[12px]">
                <p className="font-medium text-pb-500">{activity.colecao}</p>
                <p className="text-sm text-gray-400 font-normal">Coleção</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de informações - Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-[170px]">
          {/* Dados pessoais */}
          <div className="bg-[#F7F7F7] rounded-xl p-8 pt-[28px] flex flex-col h-full">
            <h3 className="font-lato text-base font-medium mb-1">
              Dados pessoais
            </h3>
            <p className="text-xs text-gray-400 font-light mb-4">
              Aqui você pode editar seus dados a qualquer momento.
            </p>

            <div className="mb-6">
              <div className="flex h-[48px] items-center gap-3">
                <Image
                  src="/icons/envelope-outline.svg"
                  alt="Email"
                  width={24}
                  height={24}
                />
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <div className="flex h-[48px] items-center gap-3">
                <Image
                  src="/icons/password-lock.svg"
                  alt="Password"
                  width={24}
                  height={24}
                />
                <span className="text-sm font-medium">************</span>
              </div>
              {user.phone && (
                <div className="flex h-[48px] items-center gap-3">
                  <Image
                    src="/icons/phone.svg"
                    alt="Phone"
                    width={24}
                    height={24}
                  />
                  <span className="text-sm font-medium">{user.phone}</span>
                </div>
              )}
              {(user.country || user.state || user.city) && (
                <div className="flex h-[48px] items-center gap-3">
                  <Image
                    src="/icons/map-pin.svg"
                    alt="Location"
                    width={24}
                    height={24}
                  />
                  <span className="text-sm font-medium">
                    {[user.country, user.state, user.city]
                      .filter(Boolean)
                      .join(", ")}
                    .
                  </span>
                </div>
              )}
            </div>

            <Button
              variant="stroke"
              className="w-full mt-auto"
              onClick={() => setIsEditProfileModalOpen(true)}
            >
              Editar dados
            </Button>
          </div>

          {/* Dados de pagamento */}
          <div className="bg-[#F7F7F7] rounded-xl p-8 pt-[28px] flex flex-col h-full">
            <h3 className="font-lato text-base font-medium mb-1">
              Dados de pagamento
            </h3>
            <p className="text-xs text-gray-400 font-light mb-4">
              Aqui você pode editar seus dados a qualquer momento.
            </p>

            {paymentMethods && paymentMethods.length > 0 ? (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Image
                    src="/icons/credit-card-outline.svg"
                    alt="Cartão"
                    width={24}
                    height={24}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {paymentMethods[0]?.cardholderName}
                    </p>
                    <p className="text-xs text-gray-400">
                      Final {paymentMethods[0]?.cardNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {paymentMethods[0]?.expiryDate}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {paymentMethods[0]?.type}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm font-medium">
                  Nenhum método de pagamento cadastrado
                </p>
              </div>
            )}

            <Button variant="stroke" className="w-full mt-auto">
              Editar dados
            </Button>
          </div>

          {/* Endereços de cobrança - Desktop */}
          <div className="bg-[#F7F7F7] rounded-xl p-8 pt-[28px] flex flex-col h-full">
            <h3 className="font-lato text-base font-medium mb-1">
              Endereços de cobrança
            </h3>
            <p className="text-xs text-gray-400 font-light mb-4">
              Aqui você pode visualizar e editar seus dados de endereço a
              qualquer momento.
            </p>

            {/* Listar endereços com seleção */}
            {addresses && addresses.length > 0 ? (
              <div className="space-y-4 mb-[18px]">
                {addresses.slice(0, 2).map((address) => {
                  const isDefault = isAddressDefault(address);
                  const canSelect = canSelectAddress(address);
                  return (
                    <button
                      key={address.id}
                      onClick={() =>
                        canSelect && handleSetDefaultAddress(address.id)
                      }
                      disabled={isActionLoading || !canSelect}
                      className={`
                        w-full flex flex-col border-1 rounded-xl transition-all border-[#D9D9D9]
                        ${canSelect ? "hover:border-gold-300 cursor-pointer" : "cursor-default"}
                        ${isActionLoading ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      <div className="flex items-center p-4 gap-3 border-b-2 border-[#D9D9D9]">
                        {/* Flag do país */}
                        {address.country.toLowerCase().includes("brasil") ? (
                          <Image
                            src="/icons/flag-br.svg"
                            alt="Flag Brasil"
                            width={32}
                            height={22}
                          />
                        ) : (
                          <Image
                            src="/icons/flag-us.svg"
                            alt="Flag EUA"
                            width={32}
                            height={22}
                          />
                        )}

                        <svg
                          width="1"
                          height="22"
                          viewBox="0 0 1 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="1" height="22" fill="#D9D9D9" />
                        </svg>

                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">
                            {address.street}, {address.number}
                          </p>
                        </div>

                        {/* Radio button - indicador de seleção */}
                        <div className="flex items-center justify-center w-6 h-6">
                          {isDefault ? (
                            // Selecionado - círculo preenchido dourado
                            <div className="w-5 h-5 rounded-full bg-white border-2 border-gray-400 flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full bg-[#D5A60A]" />
                            </div>
                          ) : (
                            // Não selecionado - círculo vazio
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center p-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-center">
                            {address.city}, {address.state}.
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-center">
                            {address.zipCode}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm font-medium">
                  Nenhum endereço de cobrança cadastrado
                </p>
              </div>
            )}

            <Link href="/account/profile/addresses" className="mt-auto">
              <Button variant="stroke" className="w-full mt-auto">
                Editar dados
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ==================== LAYOUT MOBILE ==================== */}
      <div className="lg:hidden">
        {/* Avatar e Nome - Mobile */}
        <div className="flex flex-col items-center pt-[30px] pb-6 px-5">
          {/* Avatar com botão de edição */}
          <div className="relative mb-4">
            <div className="relative w-[126px] h-[126px] rounded-full overflow-hidden bg-gray-300">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  fill
                  className="object-cover"
                  sizes="126px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gold-500 text-white text-4xl font-medium">
                  {getInitials(user?.name)}
                </div>
              )}
            </div>
            <button
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center shadow-sm"
              aria-label="Editar foto de perfil"
            >
              <Edit2 className="w-4 h-4 text-pb-500" />
            </button>
          </div>

          {/* Nome */}
          <h2 className="font-lato text-[18px] font-normal mb-2">
            Olá, <span className="font-semibold">{user.name}!</span>
          </h2>

          {/* Verificação Status */}
          {user.isVerified ? (
            <div className="flex items-center gap-1.5 h-6 px-2 bg-[#EFEFEF] rounded-sm">
              <div>
                <Image
                  src="/icons/verified-badge.svg"
                  alt="Verificado"
                  width={16}
                  height={16}
                />
              </div>
              <span className="text-xs">
                {user.role === "SELLER"
                  ? "Vendedor verificado"
                  : "Comprador verificado"}
              </span>
            </div>
          ) : (
            <Button
              onClick={() => setIsVerificationModalOpen(true)}
              variant="gold"
              className="w-full max-w-xs"
              disabled={isVerificationButtonDisabled()}
            >
              {getVerificationButtonText()}
            </Button>
          )}
        </div>

        {/* Atividade - Mobile */}
        <div className="mx-5 mb-6">
          <div className="bg-[#F7F7F7] rounded-[12px] p-6">
            <h3 className="font-lato text-base font-medium text-pb-500 mb-1">
              Atividade
            </h3>
            <p className="font-lato text-xs text-gray-400 mb-6">
              Aqui você visualiza suas conquistas na Nobile.
            </p>
            <div className="grid grid-cols-3 gap-[18px]">
              <div className="h-[72px] bg-white text-center p-[14px] rounded-[12px]">
                <p className="font-medium text-pb-500">{activity.vendidos}</p>
                <p className="text-sm text-gray-400 font-normal">Vendidos</p>
              </div>
              <div className="h-[72px] bg-white text-center p-[14px] rounded-[12px]">
                <p className="font-medium text-pb-500">{activity.comprados}</p>
                <p className="text-sm text-gray-400 font-normal">Comprados</p>
              </div>
              <div className="h-[72px] bg-white text-center p-[14px] rounded-[12px]">
                <p className="font-medium text-pb-500">{activity.colecao}</p>
                <p className="text-sm text-gray-400 font-normal">Coleção</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dados pessoais - Mobile */}
        <div className="mx-5 mb-6">
          <div className="bg-[#F7F7F7] rounded-[12px] p-6">
            <h3 className="font-lato text-base font-medium text-pb-500 mb-1">
              Dados pessoais
            </h3>
            <p className="font-lato text-xs text-gray-400 mb-6">
              Aqui você pode editar seus dados a qualquer momento.
            </p>

            <div className="space-y-0">
              <div className="flex h-[48px] items-center gap-3">
                <Image
                  src="/icons/envelope-outline.svg"
                  alt="Email"
                  width={24}
                  height={24}
                />
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <div className="flex h-[48px] items-center gap-3">
                <Image
                  src="/icons/password-lock.svg"
                  alt="Password"
                  width={24}
                  height={24}
                />
                <span className="text-sm font-medium">************</span>
              </div>
              {user.phone && (
                <div className="flex h-[48px] items-center gap-3">
                  <Image
                    src="/icons/phone.svg"
                    alt="Phone"
                    width={24}
                    height={24}
                  />
                  <span className="text-sm font-medium">{user.phone}</span>
                </div>
              )}
              {(user.country || user.state || user.city) && (
                <div className="flex h-[48px] items-center gap-3">
                  <Image
                    src="/icons/map-pin.svg"
                    alt="Location"
                    width={24}
                    height={24}
                  />
                  <span className="text-sm font-medium">
                    {[user.country, user.state, user.city]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
            </div>

            <Button
              variant="stroke"
              className="w-full mt-auto"
              onClick={() => setIsEditProfileModalOpen(true)}
            >
              Editar dados
            </Button>
          </div>
        </div>

        {/* Dados de pagamento - Mobile */}
        <div className="mx-5 mb-6">
          <div className="bg-[#F7F7F7] rounded-[12px] p-6">
            <h3 className="font-lato text-base font-medium text-pb-500 mb-1">
              Dados de pagamento
            </h3>
            <p className="font-lato text-xs text-gray-400 mb-6">
              Aqui você pode editar seus dados a qualquer momento.
            </p>

            {paymentMethods && paymentMethods.length > 0 ? (
              <div className="mb-[18px]">
                <div className="flex items-center gap-3 mb-3">
                  <Image
                    src="/icons/credit-card-outline.svg"
                    alt="Cartão"
                    width={24}
                    height={24}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {paymentMethods[0]?.cardholderName}
                    </p>
                    <p className="text-xs text-gray-400">
                      Final {paymentMethods[0]?.cardNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {paymentMethods[0]?.expiryDate}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {paymentMethods[0]?.type}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm font-medium">
                  Nenhum método de pagamento cadastrado
                </p>
              </div>
            )}

            <Button variant="stroke" className="w-full mt-auto">
              Editar dados
            </Button>
          </div>
        </div>

        {/* Endereços de cobrança - Mobile */}
        <div className="mx-5 mb-24">
          <div className="bg-[#F7F7F7] rounded-[12px] p-6">
            <h3 className="font-lato text-base font-medium text-pb-500 mb-1">
              Endereços de cobrança
            </h3>
            <p className="font-lato text-xs text-gray-400 mb-6">
              Aqui você pode visualizar e editar seus dados de endereço a
              qualquer momento.
            </p>

            {/* Listar endereços com seleção */}
            {addresses && addresses.length > 0 ? (
              <div className="space-y-4 mb-[18px]">
                {addresses.slice(0, 2).map((address) => {
                  const isDefault = isAddressDefault(address);
                  const canSelect = canSelectAddress(address);

                  return (
                    <button
                      key={address.id}
                      onClick={() =>
                        canSelect && handleSetDefaultAddress(address.id)
                      }
                      disabled={isActionLoading || !canSelect}
                      className={`
                        w-full flex flex-col border-1 rounded-xl transition-all
                        ${
                          isDefault
                            ? "border-gold-500 bg-gold-50/30"
                            : "border-[#D9D9D9]"
                        }
                        ${canSelect ? "hover:border-gold-300 cursor-pointer" : "cursor-default"}
                        ${isActionLoading ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      <div className="flex items-center p-4 gap-3 border-b-2 border-[#D9D9D9]">
                        {/* Flag do país */}
                        {address.country.toLowerCase().includes("brasil") ? (
                          <Image
                            src="/icons/flag-br.svg"
                            alt="Flag Brasil"
                            width={32}
                            height={22}
                          />
                        ) : (
                          <Image
                            src="/icons/flag-us.svg"
                            alt="Flag EUA"
                            width={32}
                            height={22}
                          />
                        )}

                        <svg
                          width="1"
                          height="22"
                          viewBox="0 0 1 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="1" height="22" fill="#D9D9D9" />
                        </svg>

                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">
                            {address.street}, {address.number}
                          </p>
                        </div>

                        {/* Radio button - indicador de seleção */}
                        <div className="flex items-center justify-center w-6 h-6">
                          {isDefault ? (
                            // Selecionado - círculo preenchido dourado
                            <div className="w-5 h-5 rounded-full bg-white border-2 border-gray-400 flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full bg-[#D5A60A]" />
                            </div>
                          ) : (
                            // Não selecionado - círculo vazio
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center p-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-center">
                            {address.city}, {address.state}.
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-center">
                            {address.zipCode}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm font-medium">
                  Nenhum endereço de cobrança cadastrado
                </p>
              </div>
            )}

            <Link href="/account/profile/addresses" className="mt-auto">
              <Button variant="stroke" className="w-full mt-auto">
                Editar dados
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onVerificationSubmitted={handleVerificationSubmitted}
      />

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        //@ts-ignore
        userData={{
          name: user.name,
          email: user.email,
          phone: user.phone,
          country: user.country,
          state: user.state,
          city: user.city,
        }}
        onSave={handleSaveProfileData}
      />
    </div>
  );
}
