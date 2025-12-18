import { apiClient, extractErrorMessage } from "@/lib/api";
import { Order, OrderListItem, OrderStatus } from "@/types/order";

interface BackendOrder {
  id: number;
  buyerId: number;
  watchId: number;
  listingId: number;
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentInfo: string | null;
  shippingInfo: string | null;
  createdAt: string;
  updatedAt: string;
  listing: {
    id: number;
    watchId: number;
    sellerId: number;
    watch: {
      id: number;
      brand: string;
      model: string;
      price: number;
      images: string[];
    };
    seller: {
      id: number;
      name: string;
      email: string;
    };
  };
}

/**
 * Service para gerenciar pedidos (orders)
 * Centraliza todas as chamadas à API de pedidos
 */
class OrdersService {
  /**
   * Mapeia o status do backend para o formato do frontend
   */
  private mapBackendStatus(backendStatus: string): OrderStatus {
    const statusMap: Record<string, OrderStatus> = {
      PENDING: "pendente",
      PAID: "pago",
      SHIPPED: "enviado",
      DELIVERED: "entregue",
      CANCELLED: "cancelado",
    };
    return statusMap[backendStatus] || "pendente";
  }

  /**
   * Mapeia pedido do backend para o formato do frontend (lista)
   */
  private mapToOrderListItem(backendOrder: BackendOrder): OrderListItem {
    return {
      id: backendOrder.id,
      seller: {
        name: backendOrder.listing.seller.name,
        isVerified: true, // TODO: Adicionar campo isVerified no backend
      },
      watch: {
        id: backendOrder.listing.watch.id,
        brand: backendOrder.listing.watch.brand,
        model: backendOrder.listing.watch.model,
        image: backendOrder.listing.watch.images?.[0] || "",
        condition: "Novo", // TODO: Adicionar campo condition no backend
      },
      total: backendOrder.listing.watch.price,
      status: this.mapBackendStatus(backendOrder.status),
      createdAt: backendOrder.createdAt,
    };
  }

  /**
   * Mapeia pedido do backend para o formato do frontend (detalhes)
   */
  private mapToOrderDetails(backendOrder: BackendOrder): Order {
    //@ts-ignore
    return {
      id: backendOrder.id,
      buyerId: backendOrder.buyerId,
      watchId: backendOrder.watchId,
      status: this.mapBackendStatus(backendOrder.status),
      paymentInfo: backendOrder.paymentInfo || undefined,
      shippingInfo: backendOrder.shippingInfo || undefined,
      createdAt: backendOrder.createdAt,
      updatedAt: backendOrder.updatedAt,
      watch: {
        id: backendOrder.listing.watch.id,
        brand: backendOrder.listing.watch.brand,
        model: backendOrder.listing.watch.model,
        referenceNumber: "", // TODO: Adicionar no backend
        price: backendOrder.listing.watch.price,
        images: backendOrder.listing.watch.images,
        condition: "Novo", // TODO: Adicionar no backend
      },
      seller: {
        id: backendOrder.listing.seller.id,
        name: backendOrder.listing.seller.name,
        email: backendOrder.listing.seller.email,
        isVerified: true, // TODO: Adicionar no backend
      },
      timeline: this.generateTimeline(backendOrder),
    };
  }

  /**
   * Gera timeline baseada no status do pedido
   */
  private generateTimeline(order: BackendOrder) {
    const baseDate = new Date(order.createdAt);
    const timeline = [];

    // Pedido realizado
    timeline.push({
      id: "1",
      title: "Pedido realizado",
      description: "Seu pedido foi confirmado com sucesso",
      date: order.createdAt,
      status: "pendente" as OrderStatus,
      icon: "package" as const,
    });

    // Pagamento aprovado
    if (
      order.status === "PAID" ||
      order.status === "SHIPPED" ||
      order.status === "DELIVERED"
    ) {
      timeline.push({
        id: "2",
        title: "Pagamento aprovado",
        description: "Pagamento processado e aprovado",
        date: order.updatedAt || order.createdAt,
        status: "pago" as OrderStatus,
        icon: "check" as const,
      });
    }

    // Enviado
    if (order.status === "SHIPPED" || order.status === "DELIVERED") {
      timeline.push({
        id: "3",
        title: "Pedido enviado",
        description: "Produto despachado para entrega",
        date: order.updatedAt || order.createdAt,
        status: "enviado" as OrderStatus,
        icon: "truck" as const,
      });
    }

    // Entregue
    if (order.status === "DELIVERED") {
      timeline.push({
        id: "4",
        title: "Pedido entregue",
        description: "Produto entregue com sucesso",
        date: order.updatedAt || order.createdAt,
        status: "entregue" as OrderStatus,
        icon: "check" as const,
      });
    }

    // Cancelado
    if (order.status === "CANCELLED") {
      timeline.push({
        id: "2",
        title: "Pedido cancelado",
        description: "Este pedido foi cancelado",
        date: order.updatedAt || order.createdAt,
        status: "cancelado" as OrderStatus,
        icon: "clock" as const,
      });
    }

    return timeline;
  }

  /**
   * Lista todos os pedidos do usuário
   * GET /api/orders
   */
  async listOrders(): Promise<OrderListItem[]> {
    try {
      const response = await apiClient.get<BackendOrder[]>("/orders");
      return response.data.map((order) => this.mapToOrderListItem(order));
    } catch (error) {
      console.error("Erro ao listar pedidos:", error);
      throw new Error(extractErrorMessage(error, "Erro ao carregar pedidos"));
    }
  }

  /**
   * Busca detalhes de um pedido específico
   * Nota: O backend não tem endpoint específico, então filtramos da lista
   */
  async getOrderDetails(orderId: number): Promise<Order> {
    try {
      const response = await apiClient.get<BackendOrder[]>("/orders");
      const order = response.data.find((o) => o.id === orderId);

      if (!order) {
        throw new Error("Pedido não encontrado");
      }

      return this.mapToOrderDetails(order);
    } catch (error) {
      console.error("Erro ao buscar detalhes do pedido:", error);
      throw new Error(
        extractErrorMessage(error, "Erro ao carregar detalhes do pedido")
      );
    }
  }

  /**
   * Atualiza o status de um pedido
   * PUT /api/orders/:id
   */
  async updateOrderStatus(
    orderId: number,
    status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  ): Promise<Order> {
    try {
      const response = await apiClient.put<BackendOrder>(`/orders/${orderId}`, {
        status,
      });
      return this.mapToOrderDetails(response.data);
    } catch (error) {
      console.error("Erro ao atualizar status do pedido:", error);
      throw new Error(
        extractErrorMessage(error, "Erro ao atualizar status do pedido")
      );
    }
  }

  /**
   * Confirma a entrega de um pedido (apenas comprador)
   * PUT /api/orders/:id/confirm-delivery
   */
  async confirmDelivery(orderId: number): Promise<Order> {
    try {
      const response = await apiClient.put<{
        success: boolean;
        pedido: BackendOrder;
      }>(`/orders/${orderId}/confirm-delivery`);
      return this.mapToOrderDetails(response.data.pedido);
    } catch (error) {
      console.error("Erro ao confirmar entrega:", error);
      throw new Error(extractErrorMessage(error, "Erro ao confirmar entrega"));
    }
  }
}

export const ordersService = new OrdersService();
