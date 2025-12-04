"use client";

import { CartItem } from "@/types/cart";
import { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STORAGE_KEY = "nobile:cart";

/**
 * Hook personalizado para gerenciar operações de compra
 *
 * ARQUITETURA DE CARRINHO:
 * - Gerenciamento 100% frontend usando localStorage
 * - Backend NÃO possui modelo de carrinho
 * - Pedidos são criados apenas no momento do checkout
 *
 * @returns {Object} Métodos e estados para gerenciar compras
 */
export function usePurchase() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  /**
   * Converte Product em CartItem
   */
  const productToCartItem = (product: Product): CartItem => {
    return {
      id: `cart-${product.id}-${Date.now()}`,
      watchId: product.id,
      seller: {
        name: product.seller?.name || "Vendedor Certificado",
        isVerified: true,
      },
      watch: {
        brand: product.brand,
        model: product.model,
        image: product.images[0] || "/images/placeholder-watch.png",
        condition: product.condition,
      },
      price: product.price,
    };
  };

  /**
   * Adiciona produto ao carrinho (localStorage)
   *
   * @param product - Produto a ser adicionado
   * @param redirectAfter - Se true, redireciona para /account/cart
   */
  const addToCart = async (product: Product, redirectAfter: boolean = false) => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Simular delay para melhor UX
      await new Promise(resolve => setTimeout(resolve, 300));

      // Carregar carrinho do localStorage
      const savedCart = localStorage.getItem(STORAGE_KEY);
      const currentCart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

      // Verificar duplicata
      const existingItem = currentCart.find(item => item.watchId === product.id);

      if (existingItem) {
        setMessage({
          type: "info",
          text: "Este produto já está no seu carrinho",
        });

        if (redirectAfter) {
          setTimeout(() => {
            router.push("/account/cart");
          }, 500);
        }
        return;
      }

      // Adicionar ao carrinho
      const cartItem = productToCartItem(product);
      const updatedCart = [...currentCart, cartItem];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCart));

      setMessage({
        type: "success",
        text: "Produto adicionado ao carrinho",
      });

      // Atualizar contador do carrinho na UI
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      if (redirectAfter) {
        setTimeout(() => {
          router.push("/account/cart");
        }, 500);
      }
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      setMessage({
        type: "error",
        text: "Erro ao adicionar produto ao carrinho",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Compra direta - Vai direto para checkout
   * Não adiciona ao carrinho, apenas redireciona
   *
   * @param product - Produto a ser comprado
   */
  const buyNow = async (product: Product) => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Simular delay para melhor UX
      await new Promise(resolve => setTimeout(resolve, 200));

      // Redirecionar para checkout com o ID do produto
      router.push(`/account/checkout?items=${product.id}`);

      setMessage({
        type: "success",
        text: "Redirecionando para checkout...",
      });
    } catch (error) {
      console.error("Erro na compra direta:", error);
      setMessage({
        type: "error",
        text: "Erro ao processar compra",
      });
      setIsLoading(false);
    }
    // Não resetar loading aqui pois estamos redirecionando
  };

  /**
   * Limpa mensagem de feedback
   */
  const clearMessage = () => {
    setMessage(null);
  };

  return {
    isLoading,
    message,
    addToCart,
    buyNow,
    clearMessage,
  };
}
