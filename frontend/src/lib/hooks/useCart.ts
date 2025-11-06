"use client";

import { CartItem } from "@/types/cart";
import { useEffect, useState } from "react";

const STORAGE_KEY = "nobile:cart";

/**
 * Dados mockados para desenvolvimento
 */
const MOCK_CART_ITEMS: CartItem[] = [
  {
    id: "cart-1",
    watchId: 1,
    seller: {
      name: "Cordial Watches",
      isVerified: true,
    },
    watch: {
      brand: "Patek Philippe",
      model: "Aquanaut",
      image: "/images/mock/aquanaut.png",
      condition: "Com caixa e documentos originais",
    },
    price: 80300,
  },
  {
    id: "cart-2",
    watchId: 2,
    seller: {
      name: "Cordial Watches",
      isVerified: true,
    },
    watch: {
      brand: "Omega",
      model: "De Ville Prestige",
      image: "/images/mock/omega1.jpg",
      condition: "Com caixa e documentos originais",
    },
    price: 80300,
  },
];

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setIsLoading(true);

      // Usar dados mockados durante desenvolvimento
      const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

      if (useMockData) {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 300));

        // Tentar carregar do localStorage, senão usar mock
        const savedCart = localStorage.getItem(STORAGE_KEY);
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        } else {
          setItems(MOCK_CART_ITEMS);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CART_ITEMS));
        }
        return;
      }

      // TODO: Implementar chamada real à API quando disponível
      // const response = await fetch('/api/cart');
      // const data = await response.json();
      // setItems(data);
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
      setItems(MOCK_CART_ITEMS);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (item: CartItem) => {
    try {
      // Verificar se o item já existe no carrinho
      const existingItem = items.find(i => i.watchId === item.watchId);
      if (existingItem) {
        console.log("Item já está no carrinho");
        return;
      }

      const newItems = [...items, item];
      setItems(newItems);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));

      // TODO: Sincronizar com API quando disponível
      // await fetch('/api/cart', {
      //   method: 'POST',
      //   body: JSON.stringify(item),
      // });
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const newItems = items.filter(item => item.id !== itemId);
      setItems(newItems);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));

      // TODO: Sincronizar com API quando disponível
      // await fetch(`/api/cart/${itemId}`, {
      //   method: 'DELETE',
      // });
    } catch (error) {
      console.error("Erro ao remover item:", error);
    }
  };

  const clearCart = async () => {
    try {
      setItems([]);
      localStorage.removeItem(STORAGE_KEY);

      // TODO: Sincronizar com API quando disponível
      // await fetch('/api/cart', {
      //   method: 'DELETE',
      // });
    } catch (error) {
      console.error("Erro ao limpar carrinho:", error);
    }
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

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
