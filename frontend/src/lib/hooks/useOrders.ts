import { OrderListItem } from "@/types/order";
import useSWR from "swr";
import { ordersService } from "../services/orders.service";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

/**
 * Fetcher para SWR - busca lista de pedidos
 */
const ordersFetcher = async (): Promise<OrderListItem[]> => {
  return await ordersService.listOrders();
};

/**
 * Hook para listar todos os pedidos do usuário
 * Usa SWR para cache e revalidação automática
 *
 * @example
 * ```tsx
 * const { orders, isLoading, error, refetch } = useOrders();
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage />;
 *
 * return (
 *   <div>
 *     {orders.map(order => (
 *       <OrderCard key={order.id} order={order} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useOrders() {
  const {
    data: orders,
    error,
    isLoading,
    mutate,
  } = useSWR<OrderListItem[]>(USE_MOCK_DATA ? null : "/orders", ordersFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    shouldRetryOnError: true,
    errorRetryCount: 2,
    dedupingInterval: 5000,
  });

  return {
    orders: orders || [],
    isLoading,
    error,
    refetch: mutate,
  };
}
