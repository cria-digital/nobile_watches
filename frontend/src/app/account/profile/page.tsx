"use client";

import { MobileBackHeader } from "@/components/layout/MobileBackHeader";
import { Breadcrumbs, Button, ErrorState, VerifiedBadge } from "@/components/ui";
import { UserNav } from "@/components/user/UserNav";
import { VerificationModal } from "@/components/verification/VerificationModal";
import { useUserProfile } from "@/hooks/useUserProfile";
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
  } = useUserProfile();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState title="Erro ao carregar dados do perfil" />;
  }

  const { user, activity, paymentMethods, billingAddresses } = data;

  return (
    <div className="min-h-screen bg-white lg:py-8">
      <MobileBackHeader title="Perfil" />

      {/* Desktop */}
      <div className="hidden lg:flex items-center justify-between flex-wrap max-w-7xl mx-auto px-8.5">
        <div>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Meu perfil" }]} />
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
                      sizes="118px"
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
            <h3 className="font-lato text-base font-medium mb-1">Dados pessoais</h3>
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
                  <Image src="/icons/phone.svg" alt="Phone" width={24} height={24} />
                  <span className="text-sm font-medium">{user.phone}</span>
                </div>
              )}
              {(user.country || user.state || user.city) && (
                <div className="flex h-[48px] items-center gap-3">
                  <Image src="/icons/map-pin.svg" alt="Location" width={24} height={24} />
                  <span className="text-sm font-medium">
                    {[user.country, user.state, user.city].filter(Boolean).join(", ")}.
                  </span>
                </div>
              )}
            </div>

            <Link href="/account/profile/edit" className="mt-auto">
              <Button variant="stroke" className="w-full mt-auto">
                Editar dados
              </Button>
            </Link>
          </div>

          {/* Dados de pagamento */}
          <div className="bg-[#F7F7F7] rounded-xl p-8 pt-[28px] flex flex-col h-full">
            <h3 className="font-lato text-base font-medium mb-1">Dados de pagamento</h3>
            <p className="text-xs text-gray-400 font-light mb-4">
              Aqui você pode editar seus dados a qualquer momento.
            </p>

            {paymentMethods && paymentMethods.length > 0 ? (
              <div className="mb-6">
                <div className="flex h-[48px] items-center gap-3">
                  <Image src="/icons/id-card.svg" alt="Id Card" width={24} height={24} />
                  <span className="text-sm font-medium">
                    {paymentMethods[0]?.cardholderName}
                  </span>
                </div>

                <div className="flex h-[48px] items-center gap-3">
                  <Image
                    src="/icons/credit-card.svg"
                    alt="Credit Card"
                    width={24}
                    height={24}
                  />
                  <span className="text-sm font-medium">
                    {/* **** **** **** {paymentMethods[0]?.cardNumber} */}
                    {paymentMethods[0]?.cardNumber}
                  </span>
                </div>
                <div className="flex h-[48px] items-center gap-3">
                  <Image
                    src="/icons/calendar.svg"
                    alt="Calendar"
                    width={24}
                    height={24}
                  />
                  <span className="text-sm font-medium">
                    {paymentMethods[0]?.expiryDate}
                  </span>
                </div>
                <div className="flex h-[48px] items-center gap-3">
                  <Image
                    src="/icons/password-lock.svg"
                    alt="Password"
                    width={24}
                    height={24}
                  />
                  <span className="text-sm font-medium">***</span>
                </div>
                <div className="flex h-[48px] items-center gap-3">
                  <Image
                    src="/icons/credit-card.svg"
                    alt="Credit Card"
                    width={24}
                    height={24}
                  />
                  <span className="text-sm font-medium">{paymentMethods[0]?.type}</span>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm font-medium">
                  Nenhum método de pagamento cadastrado
                </p>
              </div>
            )}

            <Link href="/account/profile/edit" className="mt-auto">
              <Button variant="stroke" className="w-full mt-auto">
                Editar dados
              </Button>
            </Link>
          </div>

          {/* Endereços de cobrança - Desktop */}
          <div className="bg-[#F7F7F7] rounded-xl p-8 pt-[28px] flex flex-col h-full">
            <h3 className="font-lato text-base font-medium mb-1">
              Endereços de cobrança
            </h3>
            <p className="text-xs text-gray-400 font-light mb-4">
              Aqui você pode visualizar e editar seus dados de endereço a qualquer
              momento.
            </p>

            {billingAddresses && billingAddresses.length > 0 ? (
              <div className="space-y-4 mb-[18px]">
                {billingAddresses.slice(0, 2).map(address => (
                  <div
                    key={address.id}
                    className="flex flex-col border-1 border-[#D9D9D9] rounded-xl"
                  >
                    <div className="flex items-center p-4 gap-3 border-b-2 border-[#D9D9D9]">
                      {/* flag-${countryCode}.svg */}
                      {address.country === "Brasil" ? (
                        <Image
                          src="/icons/flag-br.svg"
                          alt="Flag Brasil"
                          width={32}
                          height={22}
                        />
                      ) : (
                        <Image
                          src="/icons/flag-es.svg"
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

                      <div>
                        <p className="text-sm font-medium">
                          {address.street}, {address.number}
                        </p>
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm font-medium">
                  Nenhum endereço de cobrança cadastrado
                </p>
              </div>
            )}

            <Link href="/account/profile/edit" className="mt-auto">
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
                {user.role === "SELLER" ? "Vendedor verificado" : "Usuário verificado"}
              </span>
            </div>
          ) : (
            <Button
              onClick={() => setIsVerificationModalOpen(true)}
              variant="gold"
              className="w-[220px] h-[56px] mt-2.5"
              disabled={isVerificationButtonDisabled()}
            >
              {getVerificationButtonText()}
            </Button>
          )}
        </div>

        {/* Card de Atividade - Mobile */}
        <div className="mx-5 mb-6">
          <div className="bg-[#F7F7F7] rounded-[12px] p-6">
            <h3 className="font-lato text-base font-medium text-pb-500 mb-1">
              Atividade
            </h3>
            <p className="font-lato text-xs text-gray-400 mb-4">
              Aqui você visualiza suas conquistas na Nobile.
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-[12px] p-4 text-center">
                <p className="font-lato text-base font-medium text-pb-500 leading-none mb-1">
                  {activity.vendidos}
                </p>
                <p className="font-lato text-xs text-gray-400">Vendidos</p>
              </div>
              <div className="bg-white rounded-[12px] p-4 text-center">
                <p className="font-lato text-base font-medium text-pb-500 leading-none mb-1">
                  {activity.comprados}
                </p>
                <p className="font-lato text-xs text-gray-400">Comprados</p>
              </div>
              <div className="bg-white rounded-[12px] p-4 text-center">
                <p className="font-lato text-base font-medium text-pb-500 leading-none mb-1">
                  {activity.colecao}
                </p>
                <p className="font-lato text-xs text-gray-400">Coleção</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dados pessoais - Mobile */}
        <div className="mx-5 mb-6">
          <div className="bg-[#F7F7F7] rounded-xl p-6">
            <h3 className="font-lato text-base font-medium text-pb-500 mb-1">
              Dados pessoais
            </h3>
            <p className="font-lato text-xs text-gray-400 mb-6">
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
                  <Image src="/icons/phone.svg" alt="Phone" width={24} height={24} />
                  <span className="text-sm font-medium">{user.phone}</span>
                </div>
              )}
              {(user.country || user.state || user.city) && (
                <div className="flex h-[48px] items-center gap-3">
                  <Image src="/icons/map-pin.svg" alt="Location" width={24} height={24} />
                  <span className="text-sm font-medium">
                    {[user.country, user.state, user.city].filter(Boolean).join(", ")}.
                  </span>
                </div>
              )}
            </div>

            <Link href="/account/profile/edit" className="mt-auto">
              <Button variant="stroke" className="w-full mt-auto">
                Editar dados
              </Button>
            </Link>
          </div>
        </div>

        {/* Dados de pagamento - Mobile */}
        <div className="mx-5 mb-6">
          <div className="bg-[#F7F7F7] rounded-xl p-6">
            <h3 className="font-lato text-base font-medium text-pb-500 mb-1">
              Dados de pagamento
            </h3>
            <p className="font-lato text-xs text-gray-400 mb-6">
              Aqui você pode editar seus dados a qualquer momento.
            </p>

            {paymentMethods && paymentMethods.length > 0 ? (
              <div className="mb-6">
                <div className="flex h-[48px] items-center gap-3">
                  <Image src="/icons/id-card.svg" alt="Id Card" width={24} height={24} />
                  <span className="text-sm font-medium">
                    {paymentMethods[0]?.cardholderName}
                  </span>
                </div>

                <div className="flex h-[48px] items-center gap-3">
                  <Image
                    src="/icons/credit-card.svg"
                    alt="Credit Card"
                    width={24}
                    height={24}
                  />
                  <span className="text-sm font-medium">
                    {/* **** **** **** {paymentMethods[0]?.cardNumber} */}
                    {paymentMethods[0]?.cardNumber}
                  </span>
                </div>
                <div className="flex h-[48px] items-center gap-3">
                  <Image
                    src="/icons/calendar.svg"
                    alt="Calendar"
                    width={24}
                    height={24}
                  />
                  <span className="text-sm font-medium">
                    {paymentMethods[0]?.expiryDate}
                  </span>
                </div>
                <div className="flex h-[48px] items-center gap-3">
                  <Image
                    src="/icons/password-lock.svg"
                    alt="Password"
                    width={24}
                    height={24}
                  />
                  <span className="text-sm font-medium">***</span>
                </div>
                <div className="flex h-[48px] items-center gap-3">
                  <Image
                    src="/icons/credit-card.svg"
                    alt="Credit Card"
                    width={24}
                    height={24}
                  />
                  <span className="text-sm font-medium">{paymentMethods[0]?.type}</span>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm font-medium">
                  Nenhum método de pagamento cadastrado
                </p>
              </div>
            )}

            <Link href="/account/profile/edit" className="mt-auto">
              <Button variant="stroke" className="w-full mt-auto">
                Editar dados
              </Button>
            </Link>
          </div>
        </div>

        {/* Endereços de cobrança - Mobile */}
        <div className="mx-5 mb-24">
          <div className="bg-[#F7F7F7] rounded-[12px] p-6">
            <h3 className="font-lato text-base font-medium text-pb-500 mb-1">
              Endereços de cobrança
            </h3>
            <p className="font-lato text-xs text-gray-400 mb-6">
              Aqui você pode visualizar e editar seus dados de endereço a qualquer
              momento.
            </p>

            {billingAddresses && billingAddresses.length > 0 ? (
              <div className="space-y-4 mb-[18px]">
                {billingAddresses.slice(0, 2).map(address => (
                  <div
                    key={address.id}
                    className="flex flex-col border-1 border-[#D9D9D9] rounded-xl"
                  >
                    <div className="flex items-center p-4 gap-3 border-b-2 border-[#D9D9D9]">
                      {/* flag-${countryCode}.svg */}
                      {address.country === "Brasil" ? (
                        <Image
                          src="/icons/flag-br.svg"
                          alt="Flag Brasil"
                          width={32}
                          height={22}
                        />
                      ) : (
                        <Image
                          src="/icons/flag-es.svg"
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

                      <div>
                        <p className="text-sm font-medium">
                          {address.street}, {address.number}
                        </p>
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm font-medium">
                  Nenhum endereço de cobrança cadastrado
                </p>
              </div>
            )}

            <Link href="/account/profile/edit" className="mt-auto">
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
    </div>
  );
}
