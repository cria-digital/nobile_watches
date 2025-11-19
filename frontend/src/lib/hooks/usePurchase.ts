"use client";

import { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { purchaseService } from "../services/purchase.service";

/**
 * Hook personalizado para gerenciar operações de compra
 *
 * Fornece métodos para:
 * - Adicionar produtos ao carrinho
 * - Comprar diretamente (sem carrinho)
 * - Gerenciar estados de loading e mensagens
 */
export function usePurchase() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  /**
   * Adiciona um produto ao carrinho
   * @param product - Produto a ser adicionado
   * @param redirectAfter - Se true, redireciona para o carrinho após adicionar
   */
  const addToCart = async (product: Product, redirectAfter: boolean = false) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await purchaseService.addToCart(product);

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message,
        });

        // Disparar evento customizado para atualizar o contador do carrinho
        window.dispatchEvent(new CustomEvent("cartUpdated"));

        if (redirectAfter) {
          // Aguardar um pouco para o usuário ver a mensagem
          setTimeout(() => {
            router.push("/account/cart");
          }, 500);
        }
      } else {
        // Se o item já está no carrinho e queremos redirecionar
        if (result.message.includes("já está") && redirectAfter) {
          setMessage({
            type: "info",
            text: result.message,
          });

          setTimeout(() => {
            router.push("/account/cart");
          }, 500);
        } else {
          setMessage({
            type: "error",
            text: result.message,
          });
        }
      }
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      setMessage({
        type: "error",
        text: "Erro inesperado ao adicionar ao carrinho",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Adiciona produto ao carrinho e redireciona para a página do carrinho
   * Este é o fluxo padrão do botão "Comprar"
   */
  const addToCartAndRedirect = async (product: Product) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await purchaseService.addToCartAndRedirect(product);

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message,
        });

        // Disparar evento para atualizar contador
        window.dispatchEvent(new CustomEvent("cartUpdated"));

        // Redirecionar
        if (result.redirectTo) {
          router.push(result.redirectTo);
        }
      } else {
        setMessage({
          type: "error",
          text: result.message,
        });
      }
    } catch (error) {
      console.error("Erro ao processar compra:", error);
      setMessage({
        type: "error",
        text: "Erro ao processar compra",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Compra direta (sem passar pelo carrinho)
   * Cria pedido e inicia checkout imediatamente
   *
   * @param watchId - ID do relógio a ser comprado
   */
  const buyNow = async (watchId: number) => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Verificar autenticação
      if (!purchaseService.isAuthenticated()) {
        setMessage({
          type: "error",
          text: "Você precisa estar logado para fazer uma compra",
        });

        // Redirecionar para login após um delay
        setTimeout(() => {
          router.push("/login");
        }, 1000);
        return;
      }

      const result = await purchaseService.buyNow(watchId);

      if (result.success && result.checkoutUrl) {
        setMessage({
          type: "success",
          text: result.message || "Redirecionando...",
        });

        // Redirecionar para o checkout
        window.location.href = result.checkoutUrl;
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erro ao processar compra",
        });
      }
    } catch (error) {
      console.error("Erro na compra direta:", error);
      setMessage({
        type: "error",
        text: "Erro ao processar compra",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Limpa a mensagem atual
   */
  const clearMessage = () => {
    setMessage(null);
  };

  return {
    isLoading,
    message,
    addToCart,
    addToCartAndRedirect,
    buyNow,
    clearMessage,
  };
}
