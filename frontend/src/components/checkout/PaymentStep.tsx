"use client";

import { formatCurrency } from "@/lib/utils/format";
import { CheckoutData, PaymentMethod } from "@/types/cart";
import { Copy, Download } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button, PaymentButton } from "../ui/Button";

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
  const [pixCodeGenerated, setPixCodeGenerated] = useState(false);
  const [boletoGenerated, setBoletoGenerated] = useState(false);
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
    if (selectedTab === "pix" && pixCodeGenerated && data.payment?.pixData) {
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
  }, [selectedTab, pixCodeGenerated, data.payment]);

  // Resetar estados ao trocar de aba
  useEffect(() => {
    setPixCodeGenerated(false);
    setBoletoGenerated(false);
    setTimeLeft(15 * 60);
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

  const handleGenerateCode = async () => {
    if (selectedTab === "pix") {
      await onSelectPaymentMethod("pix");
      setPixCodeGenerated(true);
    } else if (selectedTab === "boleto") {
      await onSelectPaymentMethod("boleto");
      setBoletoGenerated(true);
    }
  };

  const handleCardPayment = async () => {
    await onProcessPayment({ card: cardData });
  };

  const handleButtonClick = async () => {
    if (selectedTab === "pix" && !pixCodeGenerated) {
      await handleGenerateCode();
    } else if (selectedTab === "boleto" && !boletoGenerated) {
      await handleGenerateCode();
    } else if (selectedTab === "card") {
      await handleCardPayment();
    } else {
      await onProcessPayment();
    }
  };

  const getButtonLabel = () => {
    if (selectedTab === "pix") {
      return pixCodeGenerated ? "Finalizar pedido" : "Gerar código";
    }
    if (selectedTab === "boleto") {
      return boletoGenerated ? "Finalizar pedido" : "Gerar boleto";
    }
    return "Finalizar pedido";
  };

  return (
    <div className="px-5 pb-26">
      {/* Cabeçalho da etapa */}
      <div className="py-8">
        <h2 className="text-2xl leading-[30px] tracking-[-0.01em] mb-2">
          Pague com segurança e praticidade
        </h2>
        <p className="text-sm text-gray-400 font-light lg:font-normal leading-relaxed">
          Cartão, Pix ou boleto. você escolhe a melhor forma de garantir seu relógio com
          toda segurança.
        </p>
      </div>

      {/* Abas de pagamento */}
      <div className="">
        <div className="flex gap-2 p-2 border border-[#EFEFEF] rounded-xl mb-4">
          <PaymentButton
            label="Pix"
            variant="pix"
            selected={selectedTab === "pix"}
            onClick={() => setSelectedTab("pix")}
          />
          <PaymentButton
            label="Cartão"
            variant="credit-card"
            selected={selectedTab === "card"}
            onClick={() => setSelectedTab("card")}
          />
          <PaymentButton
            label="Boleto"
            variant="bank_slip"
            selected={selectedTab === "boleto"}
            onClick={() => setSelectedTab("boleto")}
          />
        </div>

        {/* Resumo de valores */}
        <div className="py-[14px] px-4 space-y-[2px] bg-[#F7F7F7] rounded-xl mb-8">
          <div className="h-8 flex items-center justify-between text-sm">
            <span className="font-light lg:font-normal">Subtotal</span>
            <span className="font-medium">{formatCurrency(data.summary.subtotal)}</span>
          </div>

          {data.authentication.enabled && (
            <div className="h-8 flex items-center justify-between text-sm">
              <span className="font-light lg:font-normal">Autenticação</span>
              <span className="font-medium">
                {formatCurrency(data.summary.authentication)}
              </span>
            </div>
          )}

          <div className="h-8 flex items-center justify-between text-sm">
            <span className="font-light lg:font-normal">Entrega</span>
            <span className="font-medium">
              {data.summary.shipping > 0
                ? formatCurrency(data.summary.shipping)
                : "R$ 00,00"}
            </span>
          </div>

          <div className="h-8 flex items-center justify-between text-sm">
            <span className="font-light lg:font-normal">Total</span>
            <span className="font-medium">{formatCurrency(data.summary.total)}</span>
          </div>
        </div>

        {/* Conteúdo específico de cada método */}
        {selectedTab === "pix" && pixCodeGenerated && data.payment?.pixData && (
          <div className="space-y-6">
            <p className="text-sm font-light lg:font-normal text-gray-400 leading-[24px]">
              Leia o QR code abaixo ou copie para efetuar o pagamento e concluir a
              assinatura, você receberá em até 5 minutos o E-mail de confirmação da sua
              assinatura com o link do seu acesso a plataforma
            </p>

            <div className="flex items-center justify-between py-4 px-5 rounded-xl bg-[#F7F7F7]">
              <p className="text-sm font-light lg:font-normal">Pagar em até</p>
              <p className="tex-sm">{formatTime(timeLeft)}</p>
            </div>

            {/* QR Code */}
            <div className="py-4 px-3 bg-[#F7F7F7] rounded-xl">
              <div className="mb-3 py-[50px] px-[30px] text-center flex flex-col items-center gap-6">
                {/* QR Code Image */}
                <div className="w-62 h-62">
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
                <p className="text-xs font-light break-all text-gray-400 leading-[24px]">
                  {data.payment.pixData.qrCode}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(data.payment!.pixData!.qrCode)}
                className="w-full py-3.5 bg-transparent border-2 border-[#141414] rounded-full text-base font-medium transition-all hover:bg-[#141414] hover:text-white flex items-center justify-center gap-2"
              >
                <Copy className="w-5 h-5" />
                Copiar código Pix
              </button>
            </div>
          </div>
        )}

        {selectedTab === "boleto" && boletoGenerated && data.payment?.boletoData && (
          <div className="py-4 px-3 bg-[#F7F7F7] rounded-xl">
            <div className="flex flex-col items-center gap-4 pt-[18px] pb-8 mb-3">
              <div className="flex items-center">
                <p className="text-sm">Código:</p>
                <p className="text-sm">{data.payment.boletoData.barCode}</p>
              </div>
              {/* Código de barras */}
              <div className="w-full h-15 px-[22px]">
                <div className="w-full h-full relative">
                  <Image
                    src={data.payment.boletoData.barCodeUrl}
                    alt="Código de barras"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>{" "}
              <p className="text-xs text-gray-400 font-light">
                Scaneie o código acima ou baixe o boleto abaixo.
              </p>
            </div>
            <button className="w-full py-3.5 bg-transparent border-2 border-[#141414] rounded-full text-base font-medium transition-all hover:bg-[#141414] hover:text-white flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Baixar boleto
            </button>
          </div>
        )}

        {selectedTab === "card" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div>
                <label className="block text-sm mb-2">Dados do cartão</label>
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
      <div className="fixed bottom-0 left-0 right-0 bg-[#F7F7F7] border-t border-[#EFEFEF] p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-sm font-light lg:font-normal">Total</span>
            <p className="text-[21px] font-medium">
              {formatCurrency(data.summary.total)}
            </p>
          </div>

          <Button
            variant="gold"
            onClick={handleButtonClick}
            disabled={isProcessing}
            className="max-w-[165px] flex-1"
          >
            {isProcessing ? "Processando..." : getButtonLabel()}
          </Button>
        </div>
      </div>
    </div>
  );
}
