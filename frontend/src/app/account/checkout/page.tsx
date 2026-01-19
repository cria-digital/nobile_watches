// src/app/account/checkout/page.tsx
"use client";

import { AddressFormModal } from "@/components/addresses/AddressFormModal";
import { MobileBackHeader } from "@/components/layout/MobileBackHeader";
import { Button, ErrorState, PageLoading } from "@/components/ui";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs/Breadcrumbs";
import { useAddresses } from "@/lib/hooks/useAddresses";
import { useCart } from "@/lib/hooks/useCart";
import { useCheckout } from "@/lib/hooks/useCheckout";
import { Address } from "@/lib/services/address.service";
import { formatCurrency } from "@/lib/utils/format";
import { AlertCircle, MapPin } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemIds = searchParams.get("items")?.split(",") || undefined;

  const { items, isLoading: isLoadingCart, error: cartError } = useCart();
  const { addresses, isLoading: loadingAddresses } = useAddresses();
  //@ts-ignore
  const { isProcessing, error, startCheckout, clearError } = useCheckout({
    itemIds,
  });

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [authenticationEnabled, setAuthenticationEnabled] = useState(false);

  const selectedItems = itemIds
    ? items.filter((item) => itemIds.includes(item.id))
    : items;

  // Calcular totais
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const authenticationPrice = 3430.0; // R$ 3.430,00
  const total = subtotal + (authenticationEnabled ? authenticationPrice : 0);

  // Selecionar endereço padrão automaticamente
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      //@ts-ignore
      setSelectedAddress(defaultAddress || addresses[0]);
    }
  }, [addresses, selectedAddress]);

  /**
   * Processar checkout
   */
  const handleCheckout = async () => {
    if (!selectedAddress) {
      alert("Por favor, selecione um endereço de entrega");
      return;
    }

    const result = await startCheckout(selectedAddress.id);

    if (!result.success) {
      console.error("Erro no checkout:", result.error);
    }
  };

  // Loading
  if (isLoadingCart || loadingAddresses) {
    return <PageLoading text="Carregando checkout..." />;
  }

  // Erro ao carregar carrinho
  if (cartError) {
    return (
      <ErrorState
        title="Erro ao carregar carrinho"
        description="Não foi possível carregar os itens do carrinho. Tente novamente."
        // action={{
        //   label: "Voltar ao carrinho",
        //   onClick: () => router.push("/account/cart"),
        // }}
      />
    );
  }

  // Sem itens
  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white pb-24 lg:py-8">
      <MobileBackHeader title="Checkout" onBackClick={() => router.back()} />

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Meu carrinho", href: "/account/cart" },
                  { label: "Checkout" },
                ]}
              />
              <h1 className="text-3xl lg:text-[32px] leading-[100%]">
                Checkout
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto lg:py-8 px-5 lg:px-8">
        <div className="lg:grid lg:grid-cols-5 lg:gap-8 rounded-xl lg:border-2 border-[#EFEFEF] px-2 py-6 lg:px-8">
          {/* Coluna esquerda - Itens e Endereço */}
          <div className="lg:col-span-2">
            <div className="">
              <div className="flex items-center h-2 mb-6">
                <div className="w-[90%] h-[2.5px] bg-[#D5A60A]" />
              </div>
              <div className="mb-8">
                <h2 className="text-2xl leading-[30px] mb-3">
                  Resumo do pedido
                </h2>
                <p className="text-sm text-gray-400 font-light max-w-sm">
                  Este é o momento de garantir que tudo está conforme o
                  esperado: modelo, condição e acessórios incluídos.
                </p>
              </div>
              <div className="space-y-6">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-6 bg-[#F7F7F7] rounded-3xl"
                  >
                    {/* Imagem */}
                    <div className="w-[116px] h-[116px] relative flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {item.watch.image ? (
                        <Image
                          src={item.watch.image}
                          alt={`${item.watch.brand} ${item.watch.model}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 116px, (max-width: 1024px) 116px, 116px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Sem imagem
                        </div>
                      )}
                    </div>

                    {/* Detalhes */}
                    <div className="flex-1">
                      <h3 className="font-medium text-base mb-1">
                        {item.watch.brand} {item.watch.model}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.watch.condition}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Total</span>
                        <span className="text-lg font-semibold">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Erro de Checkout */}
              {error && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      Erro ao processar checkout
                    </p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                  <button
                    onClick={clearError}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Coluna direita - Resumo e Checkout */}
          <div className="lg:col-span-3 mt-4 lg:mt-0">
            <div className="py-6 lg:p-6 lg:bg-[#F7F7F7] rounded-3xl mb-3.5">
              <h2 className="text-[22px] mb-6">Central de autenticidade</h2>

              {/* Card selecionável */}
              <button
                onClick={() => setAuthenticationEnabled(!authenticationEnabled)}
                className={`w-full relative flex flex-col items-start gap-3 rounded-xl py-[18px] px-4 transition-all text-left ${
                  authenticationEnabled
                    ? "bg-[#141414] border-2 border-[#141414]"
                    : "bg-[#EFEFEF] border-2 border-transparent hover:border-gray-300"
                }`}
              >
                {/* Radio button */}
                <div
                  className={`absolute top-[18px] right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    authenticationEnabled
                      ? "border-[#D5A60A] bg-[#D5A60A]"
                      : "border-gray-400 bg-transparent"
                  }`}
                >
                  {authenticationEnabled && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>

                {/* Conteúdo do card */}
                {authenticationEnabled ? (
                  <>
                    <div className="relative flex-shrink-0">
                      <div className="w-[80px] h-[80px]">
                        <Image
                          src="/images/product/watchtime-logo.svg"
                          alt="Watch Time Logo"
                          width={80}
                          height={80}
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <p className="font-semibold tracking-[0.01em] max-w-xs text-white">
                      Sua compra com laudo de autenticidade Watch time!
                    </p>
                    <p className="text-xs/relaxed text-gray-300 max-w-xs">
                      Enviamos seus relógios até uma central para verificar a
                      autenticidade com o custo adicional de{" "}
                      <span className="font-bold text-white">
                        {formatCurrency(authenticationPrice)}
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <div className="relative flex-shrink-0">
                      <div className="w-[80px] h-[80px]">
                        <Image
                          src="/images/product/watchtime-logo.svg"
                          alt="Watch Time Logo"
                          width={80}
                          height={80}
                          className="object-contain opacity-50"
                        />
                      </div>
                    </div>
                    <p className="font-semibold tracking-[0.01em] max-w-xs">
                      Sua compra com laudo de autenticidade Watch time!
                    </p>
                    <p className="text-xs/relaxed text-gray-800 max-w-xs">
                      Enviamos seus relógios até uma central para verificar a
                      autenticidade com o custo adicional de{" "}
                      <span className="font-bold text-white">
                        {formatCurrency(authenticationPrice)}
                      </span>
                    </p>

                    <div className="flex items-center gap-3.5 w-full min-h-[54px] bg-[#fbedeb] p-[14px] rounded-[8px] border-2 border-gray-200">
                      <AlertCircle className="w-5 h-5 text-[#D23423] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-[#D23423] font-semibold leading-[20px] tracking-[-0.01em]">
                        Sua compra será enviada sem segurança de autenticidade.
                      </p>
                    </div>
                  </>
                )}
              </button>
              {/* Endereços */}
              <div className="border-t border-[#EFEFEF] pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[22px] flex items-center gap-2">
                    Endereço de entrega
                  </h2>
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-sm text-[#D5A60A] hover:text-[#B8900A]"
                  >
                    Adicionar
                  </button>
                </div>

                {addresses && addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <button
                        key={address.id}
                        onClick={() => setSelectedAddress(address)}
                        className={`w-full flex flex-col border-1 border-[#D9D9D9] rounded-xl relative transition-all text-left ${
                          selectedAddress?.id === address.id ? "" : ""
                        }`}
                      >
                        {/* Radio Button */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 absolute right-4 top-4                              ${
                            selectedAddress?.id === address.id
                              ? "border-gray-400 bg-white"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedAddress?.id === address.id && (
                            <div className="w-3 h-3 bg-[#D5A60A] rounded-full" />
                          )}
                        </div>

                        {/* Informações */}
                        <div className="flex-1">
                          <div className="flex items-center p-4 gap-3 border-b-2 border-[#D9D9D9]">
                            {/* Flag do país */}
                            {address.country
                              .toLowerCase()
                              .includes("brasil") ? (
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

                            <p className="text-sm font-semibold">
                              {address.street}, {address.number}
                              {address.complement && ` - ${address.complement}`}
                            </p>
                          </div>

                          <div className="flex items-center">
                            <div className="flex-1 border-r-1 border-[#D9D9D9] p-4">
                              <p className="text-sm font-semibold text-center">
                                {address.neighborhood} - {address.city},{" "}
                                {address.state}
                              </p>
                            </div>
                            <div className="flex-1  p-4">
                              <p className="text-sm font-semibold text-center">
                                {address.zipCode}
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-3 text-sm">
                      Você ainda não tem endereços cadastrados
                    </p>
                    <Button
                      onClick={() => setIsAddressModalOpen(true)}
                      variant="gold"
                      className="mx-auto"
                    >
                      Adicionar Endereço
                    </Button>
                  </div>
                )}
              </div>

              {/* Resumo de valores */}
              <div className="space-y-2.5 mt-6 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                {authenticationEnabled && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Autenticação</span>
                    <span className="font-medium">
                      {formatCurrency(authenticationPrice)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Entrega</span>
                  <span className="font-medium">R$ 00,00</span>
                </div>
              </div>
            </div>

            {/* Valor final */}
            <div className="bg-[#F7F7F7] rounded-3xl py-6 px-8 sticky top-24">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-light">Total</p>
                  <p className="text-[22px] font-medium">
                    <span>{formatCurrency(total)}</span>
                  </p>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isProcessing || !selectedAddress}
                  className="w-full lg:w-[165px]"
                  variant="gold"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processando...
                    </div>
                  ) : (
                    <div className="flex items-center">Finalizar compra</div>
                  )}
                </Button>
              </div>
              {!selectedAddress && addresses && addresses.length > 0 && (
                <p className="text-xs text-center text-red-600 mt-3">
                  Selecione um endereço para continuar
                </p>
              )}

              <p className="text-xs text-center text-gray-500 mt-4">
                Pagamento seguro via Stripe
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Novo Endereço */}
      <AddressFormModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
      />
    </div>
  );
}
