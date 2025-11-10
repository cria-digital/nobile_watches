"use client";

import { formatCurrency } from "@/lib/utils/format";
import { CheckoutData, ShippingAddress, ShippingMethod } from "@/types/cart";
import { AlertCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/Button";

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
    <div className="px-5 pb-24">
      {/* Cabeçalho da etapa */}
      <div className="py-6">
        <h2 className="font-erstoria text-2xl leading-[124%] mb-1">Resumo do pedido</h2>
        <p className="text-sm text-gray-400 font-light leading-relaxed">
          Este é o momento de garantir que tudo está conforme o esperado: modelo, condição
          e acessórios incluídos.
        </p>
      </div>

      {/* Lista de produtos */}
      <div className="py-[18px] px-4 space-y-4 border border-[#EFEFEF] rounded-[18px]">
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
      <div className="py-8">
        <h3 className="text-[22px] mb-6">Central de autenticidade</h3>

        {/* Opção com autenticação */}
        <button
          onClick={onToggleAuthentication}
          className={`relative w-full lg:w-fit px-4 py-[18px] lg:p-6 rounded-xl transition-all mb-3 text-left ${
            data.authentication.enabled ? "bg-pb-500" : "bg-pb-500"
          }`}
        >
          {/* Radio button customizado */}
          <div
            className={`absolute top-[18px] right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
              data.authentication.enabled
                ? "border-[#D5A60A] bg-[#D5A60A]"
                : "border-gray-400"
            }`}
          >
            {data.authentication.enabled && (
              <div className="w-2 h-2 bg-white rounded-full" />
            )}
          </div>

          <div className="flex-1 max-w-[292px] lg:max-w-[510px]">
            <div className="w-[78px] h-[78px] mb-4">
              <Image
                src="/images/product/watchtime-logo.svg"
                alt="Watch Time Logo"
                width={78}
                height={78}
                className="object-contain"
              />
            </div>

            <h4 className="font-lato font-semibold text-white text-base lg:text-[18px] leading-[140%] tracking-[-0.01em] mb-2">
              {data.authentication.description} {data.authentication.provider}
            </h4>

            <p className="text-xs lg:text-sm text-[#666666] leading-relaxed mb-2">
              Enviamos os seus relógios até uma central para verificar a autenticidade com
              o custo adicional de{" "}
              <span className="font-semibold">
                {formatCurrency(data.authentication.price)}
              </span>
            </p>
          </div>

          {!data.authentication.enabled && (
            <div className="flex items-center gap-3.5 p-3.5 rounded-lg">
              <AlertCircle className="w-6 h-6 text-[#D23423]" />

              <div className="flex-1">
                <p className="text-sm text-[#D23423] font-semibold leading-[140%] tracking-[-0.01em]">
                  Sua compra será enviada sem segurança de autenticidade.
                </p>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Endereço de entrega */}
      <div>
        <div className="flex items-center justify-between h-[22px] mb-6">
          <h3 className="text-[22px]">Endereço de entrega</h3>
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
      <div className="py-8">
        <h3 className="text-[22px] mb-6">Método de envio</h3>

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
      <div>
        <div className="py-[14px] px-4 space-y-[2px] bg-[#F7F7F7] rounded-xl mb-8">
          <div className="h-8 flex items-center justify-between text-sm">
            <span className="font-light">Subtotal</span>
            <span className="font-medium">{formatCurrency(data.summary.subtotal)}</span>
          </div>

          {data.authentication.enabled && (
            <div className="h-8 flex items-center justify-between text-sm">
              <span className="font-light">Autenticação</span>
              <span className="font-medium">
                {formatCurrency(data.summary.authentication)}
              </span>
            </div>
          )}

          <div className="h-8 flex items-center justify-between text-sm">
            <span className="font-light">Entrega</span>
            <span className="font-medium">
              {data.summary.shipping > 0
                ? formatCurrency(data.summary.shipping)
                : "R$ 00,00"}
            </span>
          </div>
        </div>
      </div>

      {/* Botão fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F7F7F7] border-t border-[#EFEFEF] p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-sm font-light">Total</span>
            <p className="text-[21px] font-medium">
              {formatCurrency(data.summary.total)}
            </p>
          </div>

          <Button
            variant="gold"
            onClick={onContinue}
            disabled={!canContinue}
            className="max-w-[165px] flex-1"
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
