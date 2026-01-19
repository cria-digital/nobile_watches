import { ordersService } from "@/lib/services/orders.service";
import { OrderListItem } from "@/types/order";
import { useCallback, useEffect, useState } from "react";

/**
 * Hook para buscar e gerenciar pedidos do usuário
 * Usa apenas a API - SEM dados mockados
 */
export function useUserOrders() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar pedidos via service (que usa apiClient)
      const data = await ordersService.listOrders();
      setOrders(data);
    } catch (err: any) {
      console.error("Erro ao buscar pedidos:", err);
      setError(err.message || "Erro ao carregar pedidos");
      setOrders([]); // Limpa os pedidos em caso de erro
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
  };
}
