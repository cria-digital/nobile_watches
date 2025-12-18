// src/lib/hooks/usePurchase.ts
"use client";

import { cartService } from "@/lib/services/cart.service";
import { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import { useState } from "react";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
const STORAGE_KEY = "nobile:cart";

/**
 * Hook para gerenciar operações de compra
 *
 * Suporta dois modos:
 * - addToCart: Adiciona ao carrinho e opcionalmente redireciona
 * - buyNow: Adiciona ao carrinho e vai direto para checkout
 */
export function usePurchase() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  /**
   * Adiciona produto ao carrinho
   *
   * @param product - Produto a ser adicionado
   * @param redirectAfter - Se true, redireciona para /account/cart após adicionar
   */
  const addToCart = async (
    product: Product,
    redirectAfter: boolean = false
  ) => {
    setIsLoading(true);
    setMessage(null);

    try {
      if (USE_MOCK_DATA) {
        // Modo mock: usar localStorage
        await new Promise((resolve) => setTimeout(resolve, 300));

        const savedCart = localStorage.getItem(STORAGE_KEY);
        const currentCart = savedCart ? JSON.parse(savedCart) : [];

        const existingItem = currentCart.find(
          (item: any) => item.watchId === product.id
        );

        if (existingItem) {
          setMessage({
            type: "info",
            text: "Este produto já está no seu carrinho",
          });
        } else {
          const cartItem = {
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

          currentCart.push(cartItem);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(currentCart));

          setMessage({
            type: "success",
            text: "Produto adicionado ao carrinho",
          });

          window.dispatchEvent(new CustomEvent("cartUpdated"));
        }
      } else {
        // Modo real: usar API
        const result = await cartService.addToCart(product);

        if (result.success) {
          setMessage({
            type: "success",
            text: result.message,
          });

          // Disparar evento para atualizar UI
          window.dispatchEvent(new CustomEvent("cartUpdated"));
        } else {
          setMessage({
            type: result.message.includes("já está") ? "info" : "error",
            text: result.message,
          });
        }
      }

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
   * Compra direta - Adiciona ao carrinho e vai direto para checkout
   *
   * Fluxo:
   * 1. Adiciona o produto ao carrinho
   * 2. Pega o ID do CartItem criado
   * 3. Redireciona para checkout com esse ID específico
   *
   * @param product - Produto a ser comprado
   */
  const buyNow = async (product: Product) => {
    setIsLoading(true);
    setMessage(null);

    try {
      if (USE_MOCK_DATA) {
        // Modo mock: adicionar ao localStorage e redirecionar
        await new Promise((resolve) => setTimeout(resolve, 200));

        const savedCart = localStorage.getItem(STORAGE_KEY);
        const currentCart = savedCart ? JSON.parse(savedCart) : [];

        let cartItemId: string;
        const existingItem = currentCart.find(
          (item: any) => item.watchId === product.id
        );

        if (existingItem) {
          // Se já existe, usar o ID existente
          cartItemId = existingItem.id;
        } else {
          // Se não existe, criar novo item
          const newCartItem = {
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

          currentCart.push(newCartItem);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(currentCart));
          cartItemId = newCartItem.id;

          window.dispatchEvent(new CustomEvent("cartUpdated"));
        }

        // Redirecionar para checkout com o ID do CartItem
        router.push(`/account/checkout?items=${cartItemId}`);

        setMessage({
          type: "success",
          text: "Redirecionando para checkout...",
        });
      } else {
        // Modo real: adicionar via API e redirecionar
        const result = await cartService.addToCart(product);

        if (result.success && result.cartItem) {
          // Sucesso: redirecionar com o ID do CartItem
          router.push(`/account/checkout?items=${result.cartItem.id}`);

          setMessage({
            type: "success",
            text: "Redirecionando para checkout...",
          });
        } else if (!result.success && result.message.includes("já está")) {
          // Produto já está no carrinho: buscar o ID e redirecionar
          // Precisamos buscar os itens do carrinho para pegar o ID
          const cartItems = await cartService.getCartItems();
          const existingItem = cartItems.find(
            (item) => item.watchId === product.id
          );

          if (existingItem) {
            router.push(`/account/checkout?items=${existingItem.id}`);
            setMessage({
              type: "success",
              text: "Redirecionando para checkout...",
            });
          } else {
            // Fallback: se não achar, vai para o carrinho
            router.push("/account/cart");
          }
        } else {
          // Erro ao adicionar
          setMessage({
            type: "error",
            text: result.message || "Erro ao processar compra",
          });
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error("Erro na compra direta:", error);
      setMessage({
        type: "error",
        text: "Erro ao processar compra",
      });
      setIsLoading(false);
    }
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
