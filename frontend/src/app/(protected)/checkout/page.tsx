"use client";

import { ConfirmationStep } from "@/components/checkout/ConfirmationStep";
import { OrderSummaryStep } from "@/components/checkout/OrderSummaryStep";
import { PaymentStep } from "@/components/checkout/PaymentStep";
import { MobileBackHeader } from "@/components/layout/MobileBackHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useCheckout } from "@/lib/hooks/useCheckout";
import { useRouter, useSearchParams } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemIds = searchParams.get("items")?.split(",") || undefined;

  const {
    checkoutData,
    currentStep,
    steps,
    isLoading,
    isProcessing,
    addresses,
    shippingMethods,
    selectShippingAddress,
    selectShippingMethod,
    toggleAuthentication,
    selectPaymentMethod,
    processPayment,
    goToNextStep,
    goToPreviousStep, //@ts-ignore
  } = useCheckout({ itemIds });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-[#666666]">Preparando checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (checkoutData.items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-screen px-4">
          <div className="text-center max-w-sm">
            <p className="text-lg text-[#666666] mb-2">Nenhum item para checkout</p>
            <p className="text-sm text-[#999999] mb-6">
              Adicione itens ao carrinho antes de finalizar a compra
            </p>
            <button
              onClick={() => router.push("/carrinho")}
              className="px-6 py-3 bg-[#D5A60A] text-white rounded-full font-medium hover:bg-[#B88F08] transition-colors"
            >
              Ir para o carrinho
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3 (Confirmação) não precisa de header
  if (currentStep === 3) {
    return <ConfirmationStep />;
  }

  return (
    <div className="min-h-screen bg-white lg:py-8">
      <MobileBackHeader
        title="Finalizar pedido"
        onBackClick={currentStep === 1 ? () => router.back() : goToPreviousStep}
      />

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Meu carrinho", href: "/carrinho" },
                  { label: "Finalizar pedido" },
                ]}
              />
              <h1 className="text-3xl lg:text-[32px] leading-[100%]">Finalizar pedido</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto lg:mt-12.5 lg:px-8">
        {currentStep === 1 && (
          <OrderSummaryStep
            data={checkoutData}
            addresses={addresses}
            shippingMethods={shippingMethods}
            onSelectAddress={selectShippingAddress}
            onSelectShipping={selectShippingMethod}
            onToggleAuthentication={toggleAuthentication}
            onContinue={goToNextStep}
          />
        )}

        {currentStep === 2 && (
          <PaymentStep
            data={checkoutData}
            isProcessing={isProcessing}
            onSelectPaymentMethod={selectPaymentMethod}
            onProcessPayment={processPayment}
          />
        )}
      </div>
    </div>
  );
}
