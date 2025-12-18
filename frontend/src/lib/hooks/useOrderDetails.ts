"use client";

import { ordersService } from "@/lib/services/orders.service";
import { Order } from "@/types/order";
import useSWR from "swr";

/**
 * Hook para buscar detalhes de um pedido específico
 * Usa SWR para caching e revalidação
 */
export function useOrderDetails(orderId: number | string) {
  const orderIdNumber =
    typeof orderId === "string" ? parseInt(orderId) : orderId;

  // Fetcher para SWR
  const orderFetcher = async () => {
    if (!orderIdNumber || isNaN(orderIdNumber)) {
      throw new Error("ID do pedido inválido");
    }
    return await ordersService.getOrderDetails(orderIdNumber);
  };

  // SWR hook
  const {
    data: order,
    error,
    isLoading,
    mutate,
  } = useSWR<Order>(
    orderIdNumber ? `/orders/${orderIdNumber}` : null,
    orderFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      dedupingInterval: 5000,
    }
  );

  /**
   * Confirma a entrega do pedido
   */
  const confirmDelivery = async () => {
    try {
      const updatedOrder = await ordersService.confirmDelivery(orderIdNumber);
      // Atualizar cache
      mutate(updatedOrder, false);
      return { success: true, order: updatedOrder };
    } catch (err) {
      console.error("Erro ao confirmar entrega:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Erro desconhecido",
      };
    }
  };

  /**
   * Força revalidação dos dados
   */
  const refresh = async () => {
    await mutate();
  };

  return {
    order,
    isLoading,
    isError: !!error,
    error,
    confirmDelivery,
    refresh,
  };
}
