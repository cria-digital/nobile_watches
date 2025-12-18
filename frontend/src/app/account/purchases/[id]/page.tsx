"use client";

import { MobileBackHeader } from "@/components/layout/MobileBackHeader";
import { ShippingAddressCard } from "@/components/orders/ShippingAddressCard";
import { Button, ErrorState, PageLoading } from "@/components/ui";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs/Breadcrumbs";
import { OrderTimelineComponent } from "@/components/user/OrderTimeline";
import { useOrderDetails } from "@/lib/hooks/useOrderDetails";
import { AlertCircle, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const statusLabels: Record<string, string> = {
  pendente: "Aguardando pagamento",
  pago: "Pagamento aprovado",
  em_preparacao: "Em preparação",
  enviado: "Enviado",
  em_transito: "Em trânsito",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  pago: "bg-green-100 text-green-800",
  em_preparacao: "bg-blue-100 text-blue-800",
  enviado: "bg-blue-100 text-blue-800",
  em_transito: "bg-blue-100 text-blue-800",
  entregue: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params.id as string;

  const { order, isLoading, isError, error, confirmDelivery, refresh } =
    useOrderDetails(orderId);

  const [isConfirming, setIsConfirming] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);

  /**
   * Confirma entrega do pedido
   */
  const handleConfirmDelivery = async () => {
    if (!window.confirm("Confirmar que você recebeu o pedido?")) {
      return;
    }

    setIsConfirming(true);
    const result = await confirmDelivery();
    setIsConfirming(false);

    if (result.success) {
      alert("Entrega confirmada com sucesso!");
    } else {
      alert(result.error || "Erro ao confirmar entrega");
    }
  };

  /**
   * Contatar vendedor (placeholder)
   */
  const handleContactSeller = () => {
    if (!order) return;

    // TODO: Implementar chat/mensagens
    alert(`Contatar ${order.seller?.name || "vendedor"}`);
  };

  // Loading
  if (isLoading || isVerifyingPayment) {
    return (
      <PageLoading
        text={
          isVerifyingPayment
            ? "Confirmando pagamento..."
            : "Carregando detalhes do pedido..."
        }
      />
    );
  }

  // Erro
  if (isError || !order) {
    return (
      <div className="min-h-screen bg-white">
        <MobileBackHeader
          title="Detalhes do pedido"
          onBackClick={() => router.back()}
        />

        <div className="max-w-2xl mx-auto px-4 py-12">
          <ErrorState
            title="Pedido não encontrado"
            description={
              error?.message ||
              "Não foi possível encontrar os detalhes deste pedido."
            }
          />
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => router.push("/account/purchases")}
              variant="gold"
            >
              Ver todos os pedidos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white lg:py-8">
      <MobileBackHeader
        title="Acompanhar pedido"
        onBackClick={() => router.back()}
      />

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Minhas compras", href: "/account/purchases" },
                  { label: "Detalhes do pedido" },
                ]}
              />
              <h1 className="text-3xl lg:text-[32px] leading-[100%]">
                Detalhes do pedido #{order.id}
              </h1>
            </div>
            {/* <UserNav /> */}
          </div>
        </div>
      </div>
      {/*  Banner de sucesso do pagamento */}
      {paymentVerified && (
        <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-900">
                Pagamento confirmado com sucesso!
              </p>
              <p className="text-sm text-green-700">
                O vendedor foi notificado e seu pedido será processado.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto lg:mt-8 px-5 lg:px-8 lg:pb-[150px]">
        <div className="rounded-[12px] lg:border border-[#EFEFEF] py-4 lg:py-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Card do Produto */}
            <div className="lg:bg-[#F7F7F7] rounded-[24px] lg:p-6">
              <div className="flex gap-4 mb-4 lg:mb-6">
                {/* Imagem do produto */}
                <div className="w-[116px] h-[116px] lg:w-[140px] lg:h-[140px] relative bg-[#EFEFEF] rounded-[8px] overflow-hidden flex-shrink-0">
                  <Image
                    src={
                      order.watch.images[0] || "/images/placeholder-watch.png"
                    }
                    alt={`${order.watch.brand} ${order.watch.model}`}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Informações do produto */}
                <div className="flex-1 min-w-0">
                  {/* Vendedor */}
                  {order.seller && (
                    <div className="flex items-center gap-1.5 mb-3">
                      {order.seller.isVerified && (
                        <Image
                          src="/icons/verified-badge.svg"
                          alt="Verificado"
                          width={16}
                          height={16}
                        />
                      )}
                      <span className="font-erstoria text-sm text-[#D5A60A]">
                        {order.seller.name}
                      </span>
                    </div>
                  )}

                  {/* Modelo */}
                  <h2 className="text-lg lg:text-xl mb-1 truncate">
                    {order.watch.brand} {order.watch.model}
                  </h2>

                  {/* Condição */}
                  <p className="text-sm text-gray-500 mb-2">
                    {order.watch.condition}
                  </p>

                  {/* Referência */}
                  {order.watch.referenceNumber && (
                    <p className="text-xs text-gray-400 mb-3">
                      REF: {order.watch.referenceNumber}
                    </p>
                  )}

                  {/* Preço */}
                  <p className="text-xl lg:text-2xl font-bold">
                    R$ {order.watch.price.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>

              {/* Status do pedido */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">
                    Status do pedido:
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      statusColors[order.status]
                    }`}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>

                {/* Data do pedido */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Pedido realizado em:</span>
                  <span className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>

              {/* Informações de pagamento */}
              {order.paymentInfo && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">
                        Informações de pagamento
                      </p>
                      {/* <p className="text-xs whitespace-pre-wrap">
                        {typeof order.paymentInfo === "string"
                          ? order.paymentInfo
                          : JSON.stringify(order.paymentInfo, null, 2)}
                      </p> */}
                      Pagamento realizado através do Stripe
                    </div>
                  </div>
                </div>
              )}

              <div className="lg:col-span-1 mt-6 lg:mt-0">
                <ShippingAddressCard shippingInfo={order.shippingInfo} />
              </div>
            </div>

            {/* Timeline do pedido */}
            <div>
              <h3 className="text-lg mb-4 lg:mb-6">Rastreamento do pedido</h3>

              {order.timeline && order.timeline.length > 0 ? (
                <OrderTimelineComponent timeline={order.timeline} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma atualização disponível ainda</p>
                </div>
              )}

              {/* Ações */}
              <div className="space-y-3 mt-12">
                {/* Botão contatar vendedor */}
                {order.seller && (
                  <Button
                    onClick={handleContactSeller}
                    variant="stroke"
                    className="w-full"
                  >
                    Contatar vendedor
                  </Button>
                )}

                {/* Botão confirmar entrega */}
                {order.status === "enviado" && (
                  <Button
                    onClick={handleConfirmDelivery}
                    variant="gold"
                    className="w-full"
                    disabled={isConfirming}
                  >
                    {isConfirming ? "Confirmando..." : "Confirmar entrega"}
                  </Button>
                )}

                {/* Botão cancelar (apenas se pendente) */}
                {order.status === "pendente" && (
                  <button
                    onClick={() => {
                      // TODO: Implementar cancelamento
                      alert("Funcionalidade em desenvolvimento");
                    }}
                    className="w-full text-red-600 text-sm font-medium hover:underline"
                  >
                    Cancelar pedido
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
