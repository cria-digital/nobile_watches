"use client";

import { CartItem } from "@/types/cart";
import { useEffect, useState } from "react";

const STORAGE_KEY = "nobile:cart";

/**
 * Hook para gerenciar o carrinho de compras
 *
 * ARQUITETURA:
 * - Gerenciamento 100% frontend usando localStorage
 * - Backend NÃO possui modelo de carrinho
 * - Sincronização acontece apenas no checkout (criação de pedido)
 *
 * @returns {Object} Estado e métodos para gerenciar o carrinho
 */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar carrinho do localStorage ao montar o componente
  useEffect(() => {
    loadCart();

    // Listener para evento 'cartUpdated' disparado por outros componentes
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  /**
   * Carrega o carrinho do localStorage
   */
  const loadCart = async () => {
    try {
      setIsLoading(true);

      // Simular delay de rede para melhor UX
      await new Promise(resolve => setTimeout(resolve, 300));

      // Carregar do localStorage
      const savedCart = localStorage.getItem(STORAGE_KEY);

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } else {
        // Se não houver carrinho salvo, iniciar com array vazio
        setItems([]);
      }
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Adiciona um item ao carrinho
   * @param item - Item a ser adicionado
   */
  const addItem = async (item: CartItem) => {
    try {
      // Verificar se o item já existe no carrinho
      const existingItem = items.find(i => i.watchId === item.watchId);

      if (existingItem) {
        console.log("Item já está no carrinho");
        return;
      }

      // Adicionar novo item
      const newItems = [...items, item];
      setItems(newItems);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));

      // Disparar evento para atualizar UI
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
    }
  };

  /**
   * Remove um item do carrinho
   * @param itemId - ID do item a ser removido
   */
  const removeItem = async (itemId: string) => {
    try {
      const newItems = items.filter(item => item.id !== itemId);
      setItems(newItems);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));

      // Disparar evento para atualizar UI
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (error) {
      console.error("Erro ao remover item:", error);
    }
  };

  /**
   * Limpa todo o carrinho
   */
  const clearCart = async () => {
    try {
      setItems([]);
      localStorage.removeItem(STORAGE_KEY);

      // Disparar evento para atualizar UI
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (error) {
      console.error("Erro ao limpar carrinho:", error);
    }
  };

  /**
   * Calcula o total do carrinho
   * @returns Total em centavos/reais
   */
  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  /**
   * Retorna a quantidade de itens no carrinho
   * @returns Número de itens
   */
  const getItemCount = () => {
    return items.length;
  };

  return {
    items,
    isLoading,
    addItem,
    removeItem,
    clearCart,
    getTotal,
    getItemCount,
    refetch: loadCart,
  };
}
