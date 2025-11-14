import { Order, OrderListItem } from "@/types/order";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Dados mockados para desenvolvimento
 */
const MOCK_ORDERS: OrderListItem[] = [
  {
    id: 1,
    seller: {
      name: "Cordial Watches",
      isVerified: true,
    },
    watch: {
      id: 1,
      brand: "Patek Philippe",
      model: "Aquanaut",
      image: "/images/mock/order1.svg",
      condition: "Com caixa e documentos",
    },
    total: 80300,
    status: "em_transito",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    seller: {
      name: "Cordial Watches",
      isVerified: true,
    },
    watch: {
      id: 2,
      brand: "Omega",
      model: "De Ville Prestige",
      image: "/images/mock/order2.svg",
      condition: "Novo com etiquetas",
    },
    total: 125000,
    status: "entregue",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    seller: {
      name: "Premium Watches BR",
      isVerified: true,
    },
    watch: {
      id: 3,
      brand: "Audemars Piguet",
      model: "Royal Oak Offshore",
      image: "/images/mock/order3.svg",
      condition: "Seminovo - excelente estado",
    },
    total: 45000,
    status: "pago",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

/**
 * Hook para buscar e gerenciar pedidos do usuário
 */
export function useUserOrders() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Usar dados mockados se a API não estiver disponível
      const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || true;

      if (useMockData) {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));
        setOrders(MOCK_ORDERS);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/orders`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar pedidos");
      }

      const data = await response.json();

      // Transformar dados da API para o formato esperado
      const formattedOrders: OrderListItem[] = data.map((order: any) => ({
        id: order.id,
        seller: {
          name: order.watch?.seller?.name || "Vendedor",
          isVerified: order.watch?.seller?.isVerified || false,
        },
        watch: {
          id: order.watch?.id || 0,
          brand: order.watch?.brand || "",
          model: order.watch?.model || "",
          image: order.watch?.images?.[0] || "/placeholder-watch.jpg",
          condition: order.watch?.condition || "",
        },
        total: order.watch?.price || 0,
        status: order.status,
        createdAt: order.createdAt,
      }));

      setOrders(formattedOrders);
    } catch (err) {
      // Em caso de erro, usar dados mockados
      console.warn("Usando dados mockados devido ao erro:", err);
      setOrders(MOCK_ORDERS);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
  };
}

/**
 * Hook para buscar detalhes de um pedido específico
 */
export function useOrderDetails(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar detalhes do pedido");
      }

      const data = await response.json();

      // Gerar timeline do pedido
      const timeline = generateOrderTimeline(data);

      setOrder({
        ...data,
        timeline,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  const contactSeller = () => {
    // TODO: Implementar chat/mensagem com vendedor
    console.log("Contatar vendedor");
  };

  const cancelOrder = async () => {
    // TODO: Implementar cancelamento de pedido
    console.log("Cancelar pedido");
  };

  return {
    order,
    isLoading,
    error,
    refetch: fetchOrderDetails,
    contactSeller,
    cancelOrder,
  };
}

/**
 * Gera timeline do pedido baseado no status
 */
function generateOrderTimeline(order: any) {
  const baseTimeline = [
    {
      id: "1",
      title: "Pedido realizado",
      description: "Seu pedido foi confirmado",
      date: order.createdAt,
      status: "pendente" as const,
      icon: "clock" as const,
    },
    {
      id: "2",
      title: "Pagamento confirmado",
      description: "Pagamento processado com sucesso",
      date: order.updatedAt || order.createdAt,
      status: "pago" as const,
      icon: "check" as const,
    },
    {
      id: "3",
      title: "Em preparação",
      description: "Vendedor está preparando o envio",
      date: order.updatedAt || order.createdAt,
      status: "em_preparacao" as const,
      icon: "package" as const,
    },
    {
      id: "4",
      title: "Enviado",
      description: "Pedido despachado para entrega",
      date: order.updatedAt || order.createdAt,
      status: "enviado" as const,
      icon: "truck" as const,
    },
  ];

  return baseTimeline;
}
