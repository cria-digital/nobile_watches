"use client";

import { formatCurrency } from "@/lib/utils/format";
import { CheckoutData, ShippingAddress, ShippingMethod } from "@/types/cart";
import Image from "next/image";

interface OrderSummaryStepProps {
  data: CheckoutData;
  addresses: ShippingAddress[];
  shippingMethods: ShippingMethod[];
  onSelectAddress: (addressId: string) => void;
  onSelectShipping: (methodId: string) => void;
  onToggleAuthentication: () => void;
  onContinue: () => void;
}

export function OrderSummaryStep({
  data,
  addresses,
  shippingMethods,
  onSelectAddress,
  onSelectShipping,
  onToggleAuthentication,
  onContinue,
}: OrderSummaryStepProps) {
  const canContinue = data.shippingAddress && data.shippingMethod;

  return (
    <div className="pb-24">
      {/* Cabeçalho da etapa */}
      <div className="px-4 py-6 border-b border-[#E5E5E5]">
        <h2 className="font-erstoria text-2xl leading-[124%] mb-1">Resumo do pedido</h2>
        <p className="text-sm text-gray-400 font-light leading-relaxed">
          Este é o momento de garantir que tudo está conforme o esperado: modelo, condição
          e acessórios incluídos.
        </p>
      </div>

      {/* Lista de produtos */}
      <div className="px-4 py-6 space-y-4 border-b border-[#E5E5E5]">
        {data.items.map(item => (
          <div key={item.id} className="bg-[#F7F7F7] rounded-[12px] p-4">
            <div className="flex gap-4">
              {/* Imagem */}
              <div className="w-20 h-20 relative bg-[#EFEFEF] rounded-[5px] overflow-hidden flex-shrink-0">
                <Image
                  src={item.watch.image}
                  alt={`${item.watch.brand} ${item.watch.model}`}
                  fill
                  className="object-contain p-1"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {/* Vendedor */}
                <div className="flex items-center gap-1.5 mb-2">
                  {item.seller.isVerified && (
                    <Image
                      src="/icons/verified-badge.svg"
                      alt="Verificado"
                      width={14}
                      height={14}
                    />
                  )}
                  <span className="font-erstoria text-xs text-[#D5A60A]">
                    {item.seller.name}
                  </span>
                </div>

                {/* Nome */}
                <h3 className="text-base font-medium mb-1 truncate">
                  {item.watch.brand} {item.watch.model}
                </h3>

                {/* Condição */}
                <p className="text-xs text-[#666666] mb-2 truncate">
                  {item.watch.condition}
                </p>

                {/* Preço */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#666666]">Total:</span>
                  <span className="text-base font-semibold">
                    {formatCurrency(item.price)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Central de autenticidade */}
      <div className="px-4 py-6 border-b border-[#E5E5E5]">
        <h3 className="font-erstoria text-lg mb-4">Central de autenticidade</h3>

        {/* Opção com autenticação */}
        <button
          onClick={onToggleAuthentication}
          className={`w-full p-4 rounded-[12px] border-2 transition-all mb-3 text-left ${
            data.authentication.enabled
              ? "border-[#D5A60A] bg-[#FFFBF0]"
              : "border-[#E5E5E5] bg-white"
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Radio button customizado */}
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                data.authentication.enabled
                  ? "border-[#D5A60A] bg-[#D5A60A]"
                  : "border-[#CCCCCC]"
              }`}
            >
              {data.authentication.enabled && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-base">
                  {data.authentication.description}
                </h4>
              </div>
              <p className="text-sm font-medium mb-1">{data.authentication.provider}</p>
              <p className="text-xs text-[#666666] leading-relaxed mb-2">
                Enviamos os seus relógios até uma central para verificar a autenticidade
                com o custo adicional de{" "}
                <span className="font-semibold">
                  {formatCurrency(data.authentication.price)}
                </span>
              </p>
            </div>
          </div>
        </button>

        {/* Opção sem autenticação */}
        <button
          onClick={onToggleAuthentication}
          className={`w-full p-4 rounded-[12px] border-2 transition-all text-left ${
            !data.authentication.enabled
              ? "border-[#D5A60A] bg-[#FFFBF0]"
              : "border-[#E5E5E5] bg-white"
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Radio button customizado */}
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                !data.authentication.enabled
                  ? "border-[#D5A60A] bg-[#D5A60A]"
                  : "border-[#CCCCCC]"
              }`}
            >
              {!data.authentication.enabled && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium">
                Sua compra será enviada sem segurança de autenticidade.
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Endereço de entrega */}
      <div className="px-4 py-6 border-b border-[#E5E5E5]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-erstoria text-lg">Endereço de entrega</h3>
          <button className="text-sm text-[#D5A60A] font-medium">Adicionar</button>
        </div>

        <div className="space-y-3">
          {addresses.map(address => (
            <button
              key={address.id}
              onClick={() => onSelectAddress(address.id)}
              className={`w-full p-4 rounded-[12px] border-2 transition-all text-left ${
                data.shippingAddress?.id === address.id
                  ? "border-[#D5A60A] bg-[#FFFBF0]"
                  : "border-[#E5E5E5] bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    data.shippingAddress?.id === address.id
                      ? "border-[#D5A60A] bg-[#D5A60A]"
                      : "border-[#CCCCCC]"
                  }`}
                >
                  {data.shippingAddress?.id === address.id && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">
                    {address.street}, {address.number}
                    {address.complement && ` ${address.complement}`}
                  </p>
                  <p className="text-xs text-[#666666]">
                    {address.city}, {address.state}. {address.zipCode}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Método de envio */}
      <div className="px-4 py-6 border-b border-[#E5E5E5]">
        <h3 className="font-erstoria text-lg mb-4">Método de envio</h3>

        <div className="space-y-3">
          {shippingMethods.map(method => (
            <button
              key={method.id}
              onClick={() => onSelectShipping(method.id)}
              className={`w-full p-4 rounded-[12px] border-2 transition-all text-left ${
                data.shippingMethod?.id === method.id
                  ? "border-[#D5A60A] bg-[#FFFBF0]"
                  : "border-[#E5E5E5] bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    data.shippingMethod?.id === method.id
                      ? "border-[#D5A60A] bg-[#D5A60A]"
                      : "border-[#CCCCCC]"
                  }`}
                >
                  {data.shippingMethod?.id === method.id && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{method.name}</p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(method.price)}
                    </p>
                  </div>
                  <p className="text-xs text-[#666666]">
                    Delivery: {method.deliveryTime}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Resumo de valores */}
      <div className="px-4 py-6">
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#666666]">Subtotal</span>
            <span className="font-medium">{formatCurrency(data.summary.subtotal)}</span>
          </div>

          {data.authentication.enabled && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#666666]">Autenticação</span>
              <span className="font-medium">
                {formatCurrency(data.summary.authentication)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-[#666666]">Entrega</span>
            <span className="font-medium">
              {data.summary.shipping > 0
                ? formatCurrency(data.summary.shipping)
                : "R$ 00,00"}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E5E5E5]">
          <div className="flex items-center justify-between">
            <span className="font-erstoria text-lg">Total</span>
            <span className="font-erstoria text-2xl">
              {formatCurrency(data.summary.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Botão continuar fixo */}
      <div className="bg-white border-t border-[#E5E5E5] mt-4">
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className="w-full h-14 bg-[#D5A60A] text-white rounded-full font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#B88F08] transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
