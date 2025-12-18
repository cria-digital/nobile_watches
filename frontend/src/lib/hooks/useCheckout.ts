// src/lib/hooks/useCheckout.ts
import { checkoutService } from "@/lib/services/checkout.service";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Hook para gerenciar o fluxo de checkout com Stripe
 *
 * Fluxo:
 * 1. Valida itens do carrinho
 * 2. Valida endereço selecionado
 * 3. Processa checkout no backend (cria sessão Stripe)
 * 4. Redireciona para Stripe
 * 5. Após pagamento, verifica status e cria pedidos
 */
export function useCheckout(options?: { itemIds?: string[] }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Inicia o checkout
   * @param addressId - ID do endereço de entrega selecionado
   */
  const startCheckout = async (addressId: number) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Validar endereço
      if (!addressId) {
        setError("Endereço de entrega é obrigatório");
        return { success: false, error: "Endereço de entrega é obrigatório" };
      }

      // Processar checkout completo com endereço
      const result = await checkoutService.processCheckout(
        options?.itemIds,
        addressId
      );

      if (!result.success) {
        setError(result.error || "Erro ao processar checkout");
        return { success: false, error: result.error };
      }

      // Redirecionar para Stripe
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return { success: true };
      }

      setError("URL de checkout não disponível");
      return { success: false, error: "URL de checkout não disponível" };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Erro ao iniciar checkout:", err);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Verifica o pagamento após retorno do Stripe
   * Deve ser chamado na página de sucesso
   */
  const verifyPayment = async (sessionId: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await checkoutService.verifyPayment(sessionId);

      if (!result.success) {
        setError(result.error || "Pagamento não confirmado");
        return { success: false, error: result.error };
      }

      return {
        success: true,
        order: result.order,
        message: result.message,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Erro ao verificar pagamento:", err);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Limpa erros
   */
  const clearError = () => {
    setError(null);
  };

  return {
    isProcessing,
    error,
    startCheckout,
    verifyPayment,
    clearError,
  };
}
