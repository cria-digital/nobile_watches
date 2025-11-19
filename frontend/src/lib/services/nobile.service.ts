import { apiClient, extractErrorMessage } from "@/lib/api";
import type {
  AdminLog,
  Collection,
  Message,
  Order,
  PriceHistory,
  Watch,
} from "@/types/nobile";

class NobileService {
  // ===============================================
  // WATCHES (RELÓGIOS)
  // ===============================================

  /**
   * Busca todos os relógios
   */
  async getWatches(params?: {
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    page?: number;
    limit?: number;
  }): Promise<Watch[]> {
    try {
      const response = await apiClient.get<Watch[]>("/watches", { params });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar relógios"));
    }
  }

  /**
   * Busca relógio por ID
   */
  async getWatchById(id: number): Promise<Watch> {
    try {
      const response = await apiClient.get<Watch>(`/watches/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar relógio"));
    }
  }

  /**
   * Cria novo relógio
   */
  async createWatch(data: Partial<Watch>): Promise<Watch> {
    try {
      const response = await apiClient.post<Watch>("/watches", data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao criar relógio"));
    }
  }

  /**
   * Atualiza relógio existente
   */
  async updateWatch(id: number, data: Partial<Watch>): Promise<Watch> {
    try {
      const response = await apiClient.put<Watch>(`/watches/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao atualizar relógio"));
    }
  }

  /**
   * Deleta relógio
   */
  async deleteWatch(id: number): Promise<void> {
    try {
      await apiClient.delete(`/watches/${id}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao deletar relógio"));
    }
  }

  /**
   * Busca relógios do vendedor
   */
  async getSellerWatches(sellerId: number): Promise<Watch[]> {
    try {
      const response = await apiClient.get<Watch[]>(`/sellers/${sellerId}/watches`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar relógios do vendedor"));
    }
  }

  // ===============================================
  // ORDERS (PEDIDOS)
  // ===============================================

  /**
   * Cria novo pedido
   */
  async createOrder(data: Partial<Order>): Promise<Order> {
    try {
      const response = await apiClient.post<Order>("/orders", data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao criar pedido"));
    }
  }

  /**
   * Busca pedidos do usuário
   */
  async getUserOrders(): Promise<Order[]> {
    try {
      const response = await apiClient.get<Order[]>("/orders/me");
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar pedidos"));
    }
  }

  /**
   * Busca pedido por ID
   */
  async getOrderById(id: number): Promise<Order> {
    try {
      const response = await apiClient.get<Order>(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar pedido"));
    }
  }

  /**
   * Atualiza status do pedido
   */
  async updateOrderStatus(id: number, status: Order["status"]): Promise<Order> {
    try {
      const response = await apiClient.patch<Order>(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao atualizar status do pedido"));
    }
  }

  // ===============================================
  // COLLECTIONS (COLEÇÕES)
  // ===============================================

  /**
   * Busca todas as coleções
   */
  async getCollections(): Promise<Collection[]> {
    try {
      const response = await apiClient.get<Collection[]>("/collections");
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar coleções"));
    }
  }

  /**
   * Busca coleção por ID
   */
  async getCollectionById(id: number): Promise<Collection> {
    try {
      const response = await apiClient.get<Collection>(`/collections/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar coleção"));
    }
  }

  /**
   * Cria nova coleção
   */
  async createCollection(data: Partial<Collection>): Promise<Collection> {
    try {
      const response = await apiClient.post<Collection>("/collections", data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao criar coleção"));
    }
  }

  // ===============================================
  // MESSAGES (MENSAGENS)
  // ===============================================

  /**
   * Envia mensagem
   */
  async sendMessage(data: {
    recipientId: number;
    content: string;
    watchId?: number;
  }): Promise<Message> {
    try {
      const response = await apiClient.post<Message>("/messages", data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao enviar mensagem"));
    }
  }

  /**
   * Busca conversas do usuário
   */
  async getConversations(): Promise<Message[]> {
    try {
      const response = await apiClient.get<Message[]>("/messages/conversations");
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar conversas"));
    }
  }

  /**
   * Busca mensagens de uma conversa
   */
  async getConversationMessages(userId: number): Promise<Message[]> {
    try {
      const response = await apiClient.get<Message[]>(`/messages/conversation/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar mensagens"));
    }
  }

  // ===============================================
  // PRICE HISTORY (HISTÓRICO DE PREÇOS)
  // ===============================================

  /**
   * Busca histórico de preços de um relógio
   */
  async getPriceHistory(watchId: number): Promise<PriceHistory[]> {
    try {
      const response = await apiClient.get<PriceHistory[]>(
        `/watches/${watchId}/price-history`
      );
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar histórico de preços"));
    }
  }

  // ===============================================
  // ADMIN LOGS
  // ===============================================

  /**
   * Busca logs administrativos
   */
  async getAdminLogs(params?: {
    page?: number;
    limit?: number;
    action?: string;
  }): Promise<AdminLog[]> {
    try {
      const response = await apiClient.get<AdminLog[]>("/admin/logs", { params });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar logs administrativos"));
    }
  }

  // ===============================================
  // FAVORITOS
  // ===============================================

  /**
   * Adiciona relógio aos favoritos
   */
  async addToFavorites(watchId: number): Promise<void> {
    try {
      await apiClient.post(`/favorites/${watchId}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao adicionar aos favoritos"));
    }
  }

  /**
   * Remove relógio dos favoritos
   */
  async removeFromFavorites(watchId: number): Promise<void> {
    try {
      await apiClient.delete(`/favorites/${watchId}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao remover dos favoritos"));
    }
  }

  /**
   * Busca favoritos do usuário
   */
  async getFavorites(): Promise<Watch[]> {
    try {
      const response = await apiClient.get<Watch[]>("/favorites");
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar favoritos"));
    }
  }

  // ===============================================
  // BUSCA
  // ===============================================

  /**
   * Busca relógios por termo
   */
  async searchWatches(query: string, limit = 10): Promise<Watch[]> {
    try {
      const response = await apiClient.get<Watch[]>("/watches/search", {
        params: { q: query, limit },
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar relógios"));
    }
  }
}

// Exporta instância singleton
const nobileService = new NobileService();
export default nobileService;

// Exporta a classe para testes
export { NobileService };
