"use client";

import { CartItem, cartService } from "@/lib/services/cart.service";
import { useState } from "react";
import useSWR from "swr";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
const STORAGE_KEY = "nobile:cart";

/**
 * Fetcher para SWR - busca itens do carrinho
 */
const cartFetcher = async (): Promise<CartItem[]> => {
  return await cartService.getCartItems();
};

/**
 * Hook para gerenciar o carrinho de compras
 * Usa SWR para cache e revalidação automática
 *
 * Modo Real: Sincroniza com backend via API
 * Modo Mock: Usa localStorage para desenvolvimento
 *
 * @example
 * ```tsx
 * const { items, isLoading, removeItem, clearCart, getTotal } = useCart();
 *
 * if (isLoading) return <LoadingSpinner />;
 *
 * return (
 *   <div>
 *     {items.map(item => (
 *       <CartItem key={item.id} item={item} onRemove={() => removeItem(item.id)} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useCart() {
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  // SWR para buscar e cachear itens do carrinho
  const {
    data: apiItems,
    error,
    isLoading: apiLoading,
    mutate,
  } = useSWR<CartItem[]>(USE_MOCK_DATA ? null : "/cart/items", cartFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    shouldRetryOnError: true,
    errorRetryCount: 2,
    dedupingInterval: 2000,
  });

  // Modo mock: carregar do localStorage
  const getMockItems = (): CartItem[] => {
    if (typeof window === "undefined") return [];
    const savedCart = localStorage.getItem(STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  };

  const items = USE_MOCK_DATA
    ? getMockItems()
    : apiItems?.filter((item) => item?.listing?.status === "ACTIVE") || [];
  const isLoading = USE_MOCK_DATA ? false : apiLoading;

  /**
   * Remove um item do carrinho
   */
  const removeItem = async (itemId: string) => {
    if (USE_MOCK_DATA) {
      // Modo mock: remover do localStorage
      const mockItems = getMockItems();
      const updatedItems = mockItems.filter((item) => item.id !== itemId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      return { success: true };
    }

    // Modo real: remover via API
    setIsRemoving(itemId);
    try {
      const result = await cartService.removeFromCart(itemId);

      if (result.success) {
        // Atualização otimista do cache
        mutate(
          items.filter((item) => item.id !== itemId),
          false
        );

        // Disparar evento para atualizar contador
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      }

      return result;
    } catch (error) {
      console.error("Erro ao remover item:", error);
      return { success: false, message: "Erro ao remover item" };
    } finally {
      setIsRemoving(null);
    }
  };

  /**
   * Limpa todo o carrinho
   */
  const clearCart = async () => {
    if (USE_MOCK_DATA) {
      // Modo mock: limpar localStorage
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      return { success: true };
    }

    // Modo real: limpar via API
    setIsClearing(true);
    try {
      const result = await cartService.clearCart();

      if (result.success) {
        // Limpar cache local
        mutate([], false);

        // Disparar evento para atualizar contador
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      }

      return result;
    } catch (error) {
      console.error("Erro ao limpar carrinho:", error);
      return { success: false, message: "Erro ao limpar carrinho" };
    } finally {
      setIsClearing(false);
    }
  };

  /**
   * Calcula o total do carrinho
   */
  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  /**
   * Retorna a quantidade de itens no carrinho
   */
  const getItemCount = () => {
    return items.length;
  };

  return {
    items,
    isLoading,
    error,
    isRemoving,
    isClearing,
    removeItem,
    clearCart,
    getTotal,
    getItemCount,
    refetch: mutate,
  };
}
