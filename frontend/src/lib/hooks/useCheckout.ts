"use client";

import {
  MOCK_ADDRESSES,
  MOCK_BOLETO_BARCODE_URL,
  MOCK_BOLETO_CODE,
  MOCK_PIX_CODE,
  MOCK_PIX_QR_CODE_URL,
  MOCK_SHIPPING_METHODS,
} from "@/lib/data/mockCheckout";
import { CartItem, CheckoutData, CheckoutStep, PaymentMethod } from "@/types/cart";
import { useEffect, useMemo, useState } from "react";

interface UseCheckoutProps {
  itemIds?: string[];
}

export function useCheckout({ itemIds }: UseCheckoutProps) {
  // Estabilizar itemIds com useMemo para evitar loop infinito
  const stableItemIds = useMemo(() => itemIds, [itemIds?.join(",")]);

  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    items: [],
    shippingAddress: null,
    shippingMethod: null,
    authentication: {
      enabled: false,
      provider: "Watch time!",
      description: "Sua compra com laudo de autenticidade",
      price: 3430,
    },
    payment: null,
    summary: {
      subtotal: 0,
      shipping: 0,
      authentication: 0,
      total: 0,
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps: CheckoutStep[] = [
    {
      id: 1,
      title: "Resumo do pedido",
      isComplete: currentStep > 1,
      isCurrent: currentStep === 1,
    },
    {
      id: 2,
      title: "Pagamento",
      isComplete: currentStep > 2,
      isCurrent: currentStep === 2,
    },
    {
      id: 3,
      title: "Confirmação",
      isComplete: currentStep > 3,
      isCurrent: currentStep === 3,
    },
  ];

  useEffect(() => {
    loadCheckoutData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableItemIds]);

  useEffect(() => {
    calculateSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    checkoutData.items.length,
    checkoutData.shippingMethod?.id,
    checkoutData.authentication.enabled,
  ]);

  const loadCheckoutData = async () => {
    try {
      setIsLoading(true);

      // Usar dados mockados durante desenvolvimento
      const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

      if (useMockData) {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));

        // Carregar items do carrinho baseado nos IDs
        const cartItems = loadCartItems(stableItemIds);

        // Criar objeto completo do tipo CheckoutData
        const newCheckoutData: CheckoutData = {
          items: cartItems,
          shippingAddress: MOCK_ADDRESSES[0] || null, // Selecionar primeiro endereço por padrão
          shippingMethod: null,
          authentication: {
            enabled: false,
            provider: "Watch time!",
            description: "Sua compra com laudo de autenticidade",
            price: 3430,
          },
          payment: null,
          summary: {
            subtotal: 0,
            shipping: 0,
            authentication: 0,
            total: 0,
          },
        };

        setCheckoutData(newCheckoutData);
        return;
      }

      // TODO: Implementar chamada real à API quando disponível
      // const response = await fetch(`/api/checkout?items=${stableItemIds?.join(',')}`);
      // const data = await response.json();
      // setCheckoutData(data);
    } catch (error) {
      console.error("Erro ao carregar dados do checkout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCartItems = (ids?: string[]): CartItem[] => {
    // Carregar do localStorage
    const savedCart = localStorage.getItem("nobile:cart");
    if (!savedCart) return [];

    const allItems: CartItem[] = JSON.parse(savedCart);

    // Filtrar apenas os items selecionados
    if (ids && ids.length > 0) {
      return allItems.filter(item => ids.includes(item.id));
    }

    return allItems;
  };

  const calculateSummary = () => {
    const subtotal = checkoutData.items.reduce((sum, item) => sum + item.price, 0);
    const shipping = checkoutData.shippingMethod?.price || 0;
    const authentication = checkoutData.authentication.enabled
      ? checkoutData.authentication.price
      : 0;
    const total = subtotal + shipping + authentication;

    setCheckoutData(prev => ({
      ...prev,
      summary: {
        subtotal,
        shipping,
        authentication,
        total,
      },
    }));
  };

  const selectShippingAddress = (addressId: string) => {
    const address = MOCK_ADDRESSES.find(a => a.id === addressId);
    if (address) {
      setCheckoutData(prev => ({
        ...prev,
        shippingAddress: address,
      }));
    }
  };

  const selectShippingMethod = (methodId: string) => {
    const method = MOCK_SHIPPING_METHODS.find(m => m.id === methodId);
    if (method) {
      setCheckoutData(prev => ({
        ...prev,
        shippingMethod: method,
      }));
    }
  };

  const toggleAuthentication = () => {
    setCheckoutData(prev => ({
      ...prev,
      authentication: {
        ...prev.authentication,
        enabled: !prev.authentication.enabled,
      },
    }));
  };

  const selectPaymentMethod = async (method: PaymentMethod) => {
    setIsProcessing(true);

    try {
      // Simular geração de dados de pagamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      let paymentData = null;

      if (method === "pix") {
        paymentData = {
          method: "pix" as const,
          pixData: {
            qrCode: MOCK_PIX_CODE,
            qrCodeUrl: MOCK_PIX_QR_CODE_URL,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
          },
        };
      } else if (method === "boleto") {
        paymentData = {
          method: "boleto" as const,
          boletoData: {
            barCode: MOCK_BOLETO_CODE,
            barCodeUrl: MOCK_BOLETO_BARCODE_URL,
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias
          },
        };
      } else if (method === "card") {
        paymentData = {
          method: "card" as const,
        };
      }

      setCheckoutData(prev => ({
        ...prev,
        payment: paymentData,
      }));
    } catch (error) {
      console.error("Erro ao selecionar método de pagamento:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processPayment = async (paymentDetails?: any) => {
    setIsProcessing(true);

    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Implementar chamada real à API
      // const response = await fetch('/api/orders/checkout', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     items: checkoutData.items,
      //     shippingAddress: checkoutData.shippingAddress,
      //     shippingMethod: checkoutData.shippingMethod,
      //     authentication: checkoutData.authentication,
      //     payment: paymentDetails,
      //   }),
      // });

      // Avançar para confirmação
      setCurrentStep(3);

      return { success: true };
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      return { success: false, error };
    } finally {
      setIsProcessing(false);
    }
  };

  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return {
    checkoutData,
    currentStep,
    steps,
    isLoading,
    isProcessing,
    addresses: MOCK_ADDRESSES,
    shippingMethods: MOCK_SHIPPING_METHODS,
    selectShippingAddress,
    selectShippingMethod,
    toggleAuthentication,
    selectPaymentMethod,
    processPayment,
    goToNextStep,
    goToPreviousStep,
  };
}
