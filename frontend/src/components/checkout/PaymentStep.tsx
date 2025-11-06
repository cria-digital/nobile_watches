"use client";

import { formatCurrency } from "@/lib/utils/format";
import { CheckoutData, PaymentMethod } from "@/types/cart";
import { Copy, Download } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface PaymentStepProps {
  data: CheckoutData;
  isProcessing: boolean;
  onSelectPaymentMethod: (method: PaymentMethod) => Promise<void>;
  onProcessPayment: (paymentDetails?: any) => Promise<any>;
}

export function PaymentStep({
  data,
  isProcessing,
  onSelectPaymentMethod,
  onProcessPayment,
}: PaymentStepProps) {
  const [selectedTab, setSelectedTab] = useState<PaymentMethod>("pix");
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos em segundos
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    cardHolderName: "",
    cpf: "",
    installments: 1,
  });

  // Timer para PIX
  useEffect(() => {
    if (selectedTab === "pix" && data.payment?.pixData) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [selectedTab, data.payment]);

  // Carregar dados de pagamento ao selecionar aba
  useEffect(() => {
    if (!data.payment || data.payment.method !== selectedTab) {
      onSelectPaymentMethod(selectedTab);
    }
  }, [selectedTab]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")} Minutos e ${secs.toString().padStart(2, "0")} Segundos`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: Mostrar toast de sucesso
      alert("Código copiado!");
    } catch (error) {
      console.error("Erro ao copiar:", error);
    }
  };

  const handleCardPayment = async () => {
    await onProcessPayment({ card: cardData });
  };

  return (
    <div className="pb-24">
      {/* Cabeçalho da etapa */}
      <div className="px-4 py-6 border-b border-[#E5E5E5]">
        <p className="text-sm text-[#999999] mb-2">01/03</p>
        <h2 className="font-erstoria text-2xl mb-2">Pague com segurança e praticidade</h2>
        <p className="text-sm text-[#666666] leading-relaxed">
          Cartão, Pix ou boleto. você escolhe a melhor forma de garantir seu relógio com
          toda segurança.
        </p>
      </div>

      {/* Abas de pagamento */}
      <div className="px-4 pt-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedTab("pix")}
            className={`flex-1 py-3 rounded-full font-medium text-sm transition-all ${
              selectedTab === "pix"
                ? "bg-[#D5A60A] text-white"
                : "bg-[#F7F7F7] text-[#666666] hover:bg-[#EFEFEF]"
            }`}
          >
            Pix
          </button>
          <button
            onClick={() => setSelectedTab("card")}
            className={`flex-1 py-3 rounded-full font-medium text-sm transition-all ${
              selectedTab === "card"
                ? "bg-[#D5A60A] text-white"
                : "bg-[#F7F7F7] text-[#666666] hover:bg-[#EFEFEF]"
            }`}
          >
            Cartão
          </button>
          <button
            onClick={() => setSelectedTab("boleto")}
            className={`flex-1 py-3 rounded-full font-medium text-sm transition-all ${
              selectedTab === "boleto"
                ? "bg-[#D5A60A] text-white"
                : "bg-[#F7F7F7] text-[#666666] hover:bg-[#EFEFEF]"
            }`}
          >
            Boleto
          </button>
        </div>

        {/* Resumo de valores */}
        <div className="space-y-3 mb-6 pb-6 border-b border-[#E5E5E5]">
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

          <div className="pt-3 border-t border-[#E5E5E5]">
            <div className="flex items-center justify-between">
              <span className="font-erstoria text-lg">Total</span>
              <span className="font-erstoria text-2xl">
                {formatCurrency(data.summary.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Conteúdo específico de cada método */}
        {selectedTab === "pix" && data.payment?.pixData && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-[#666666] mb-4">
                Leia o QR code abaixo ou copie para efetuar o pagamento e concluir a
                assinatura, você receberá em até 5 minutos o E-mail de confirmação da sua
                assinatura com o link do seu acesso a plataforma
              </p>

              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Pagar em até</p>
                <p className="text-lg font-semibold text-[#D5A60A]">
                  {formatTime(timeLeft)}
                </p>
              </div>

              {/* QR Code */}
              <div className="w-64 h-64 mx-auto mb-6 bg-white border border-[#E5E5E5] rounded-lg p-4">
                <div className="w-full h-full relative">
                  <Image
                    src={data.payment.pixData.qrCodeUrl}
                    alt="QR Code PIX"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Código PIX */}
              <div className="bg-[#F7F7F7] rounded-lg p-4 mb-4">
                <p className="text-xs text-[#666666] mb-2 break-all font-mono">
                  {data.payment.pixData.qrCode}
                </p>
              </div>

              <button
                onClick={() => copyToClipboard(data.payment!.pixData!.qrCode)}
                className="w-full py-3.5 bg-white border-2 border-[#141414] rounded-full text-base font-medium transition-all hover:bg-[#141414] hover:text-white flex items-center justify-center gap-2"
              >
                <Copy className="w-5 h-5" />
                Copiar código Pix
              </button>
            </div>
          </div>
        )}

        {selectedTab === "boleto" && data.payment?.boletoData && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-[#666666] mb-6">
                Scaneie o código acima ou baixe o boleto abaixo.
              </p>

              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Código:</p>
                <p className="text-base font-mono">{data.payment.boletoData.barCode}</p>
              </div>

              {/* Código de barras */}
              <div className="w-full h-24 mx-auto mb-6 bg-white border border-[#E5E5E5] rounded-lg p-4">
                <div className="w-full h-full relative">
                  <Image
                    src={data.payment.boletoData.barCodeUrl}
                    alt="Código de barras"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <button className="w-full py-3.5 bg-white border-2 border-[#141414] rounded-full text-base font-medium transition-all hover:bg-[#141414] hover:text-white flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Baixar boleto
              </button>
            </div>
          </div>
        )}

        {selectedTab === "card" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Dados do cartão</label>
              <input
                type="text"
                placeholder="1234 1234 1234 1234"
                value={cardData.cardNumber}
                onChange={e => setCardData({ ...cardData, cardNumber: e.target.value })}
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#D5A60A]"
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">MM/AA</label>
                <input
                  type="text"
                  placeholder="MM/AA"
                  value={cardData.expirationDate}
                  onChange={e =>
                    setCardData({ ...cardData, expirationDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#D5A60A]"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">CVC</label>
                <input
                  type="text"
                  placeholder="CVC"
                  value={cardData.cvv}
                  onChange={e => setCardData({ ...cardData, cvv: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#D5A60A]"
                  maxLength={4}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Parcelamento</label>
              <select
                value={cardData.installments}
                onChange={e =>
                  setCardData({ ...cardData, installments: Number(e.target.value) })
                }
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#D5A60A]"
              >
                <option value={1}>Uma vez sem juros</option>
                <option value={2}>2x sem juros</option>
                <option value={3}>3x sem juros</option>
                <option value={6}>6x sem juros</option>
                <option value={12}>12x sem juros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Nome completo do titular
              </label>
              <input
                type="text"
                placeholder="Loren ipsum sit"
                value={cardData.cardHolderName}
                onChange={e =>
                  setCardData({ ...cardData, cardHolderName: e.target.value })
                }
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#D5A60A]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">CPF</label>
              <input
                type="text"
                placeholder="237.423.324-23"
                value={cardData.cpf}
                onChange={e => setCardData({ ...cardData, cpf: e.target.value })}
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#D5A60A]"
                maxLength={14}
              />
            </div>
          </div>
        )}
      </div>

      {/* Botão fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5E5] p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-erstoria text-lg">Total</span>
          <span className="font-erstoria text-2xl">
            {formatCurrency(data.summary.total)}
          </span>
        </div>

        <button
          onClick={selectedTab === "card" ? handleCardPayment : () => onProcessPayment()}
          disabled={isProcessing}
          className="w-full h-14 bg-[#D5A60A] text-white rounded-full font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#B88F08] transition-colors"
        >
          {isProcessing
            ? "Processando..."
            : selectedTab === "pix"
              ? "Gerar código"
              : selectedTab === "boleto"
                ? "Gerar boleto"
                : "Finalizar pedido"}
        </button>
      </div>
    </div>
  );
}
