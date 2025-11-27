import { apiClient, extractErrorMessage } from "@/lib/api";
import type {
  ActiveListingsResponse,
  AdminLog,
  Collection,
  CreateListingRequest,
  DeleteListingResponse,
  Listing,
  ListingResponse,
  ListingStatus,
  Message,
  Order,
  PriceHistory,
  SearchFilterOptions,
  UpdateListingRequest,
  Watch,
  WishlistItem,
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
   * Cria novo relógio com FormData (para upload de imagens)
   */
  async createWatchWithFormData(
    formData: FormData
  ): Promise<{ message: string; relogio: Watch }> {
    try {
      const response = await apiClient.post<{ message: string; relogio: Watch }>(
        "/watches",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
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
  // LISTINGS (ANÚNCIOS)
  // ===============================================

  /**
   * Cria anúncio como rascunho
   */
  async createDraftListing(
    watchId: number,
    data: Omit<CreateListingRequest, "watchId" | "publishNow">
  ): Promise<ListingResponse> {
    try {
      const response = await apiClient.post<ListingResponse>("/listings", {
        watchId,
        ...data,
        publishNow: false,
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao criar rascunho de anúncio"));
    }
  }

  /**
   * Cria e publica anúncio imediatamente
   */
  async createAndPublishListing(
    watchId: number,
    data: Omit<CreateListingRequest, "watchId" | "publishNow">
  ): Promise<ListingResponse> {
    try {
      const response = await apiClient.post<ListingResponse>("/listings", {
        watchId,
        ...data,
        publishNow: true,
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao criar e publicar anúncio"));
    }
  }

  /**
   * Busca meus anúncios (com filtro opcional de status)
   */
  async getMyListings(status?: ListingStatus): Promise<Listing[]> {
    try {
      const url = status
        ? `/listings/my-listings?status=${status}`
        : "/listings/my-listings";
      const response = await apiClient.get<Listing[]>(url);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar meus anúncios"));
    }
  }

  /**
   * Busca anúncios ativos (público)
   */
  async getActiveListings(
    page: number = 1,
    limit: number = 20
  ): Promise<ActiveListingsResponse> {
    try {
      const response = await apiClient.get<ActiveListingsResponse>(
        `/listings/active?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar anúncios ativos"));
    }
  }

  /**
   * Busca anúncio por ID
   */
  async getListingById(id: number): Promise<Listing> {
    try {
      const response = await apiClient.get<Listing>(`/listings/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar anúncio"));
    }
  }

  /**
   * Atualiza informações do anúncio
   */
  async updateListing(id: number, data: UpdateListingRequest): Promise<ListingResponse> {
    try {
      const response = await apiClient.put<ListingResponse>(`/listings/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao atualizar anúncio"));
    }
  }

  /**
   * Publica anúncio em rascunho
   */
  async publishListing(id: number): Promise<ListingResponse> {
    try {
      const response = await apiClient.put<ListingResponse>(
        `/listings/${id}/publish`,
        {}
      );
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao publicar anúncio"));
    }
  }

  /**
   * Pausa anúncio ativo
   */
  async pauseListing(id: number): Promise<ListingResponse> {
    try {
      const response = await apiClient.put<ListingResponse>(`/listings/${id}/pause`, {});
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao pausar anúncio"));
    }
  }

  /**
   * Reativa anúncio pausado
   */
  async reactivateListing(id: number): Promise<ListingResponse> {
    try {
      const response = await apiClient.put<ListingResponse>(
        `/listings/${id}/reactivate`,
        {}
      );
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao reativar anúncio"));
    }
  }

  /**
   * Cancela anúncio
   */
  async cancelListing(id: number): Promise<ListingResponse> {
    try {
      const response = await apiClient.put<ListingResponse>(`/listings/${id}/cancel`, {});
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao cancelar anúncio"));
    }
  }

  /**
   * Marca anúncio como vendido
   */
  async markListingAsSold(id: number): Promise<ListingResponse> {
    try {
      const response = await apiClient.put<ListingResponse>(
        `/listings/${id}/mark-sold`,
        {}
      );
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao marcar anúncio como vendido"));
    }
  }

  /**
   * Deleta anúncio (apenas rascunhos ou cancelados sem pedidos)
   */
  async deleteListing(id: number): Promise<DeleteListingResponse> {
    try {
      const response = await apiClient.delete<DeleteListingResponse>(`/listings/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao deletar anúncio"));
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

  /**
   * Atualiza uma coleção existente
   */
  async updateCollection(id: number, data: Partial<Collection>): Promise<Collection> {
    try {
      const response = await apiClient.put<Collection>(`/collections/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao atualizar coleção"));
    }
  }

  /**
   * Remove uma coleção
   */
  async deleteCollection(id: number): Promise<void> {
    try {
      await apiClient.delete(`/collections/${id}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao remover coleção"));
    }
  }

  /**
   * Remove um relógio da coleção por watchId
   */
  async removeWatchFromCollection(watchId: number): Promise<void> {
    try {
      await apiClient.delete(`/collections/watch/${watchId}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao remover relógio da coleção"));
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
  // WISHLIST (LISTA DE DESEJOS)
  // ===============================================

  /**
   * Busca lista de desejos do usuário autenticado
   * Retorna array com metadados da wishlist e objeto completo do relógio
   */
  async getWishlist(): Promise<WishlistItem[]> {
    try {
      const response = await apiClient.get<WishlistItem[]>("/wishlist");
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar lista de desejos"));
    }
  }

  /**
   * Adiciona relógio à wishlist
   */
  async addToWishlist(watchId: number): Promise<void> {
    try {
      await apiClient.post("/wishlist", { watchId });
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao adicionar à lista de desejos"));
    }
  }

  /**
   * Remove relógio da wishlist
   */
  async removeFromWishlist(watchId: number): Promise<void> {
    try {
      await apiClient.delete(`/wishlist/${watchId}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao remover da lista de desejos"));
    }
  }

  /**
   * Verifica se um relógio está na wishlist
   */
  async checkWishlistStatus(watchId: number): Promise<{ isFavorited: boolean }> {
    try {
      const response = await apiClient.get<{ isFavorited: boolean }>(
        `/wishlist/check/${watchId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Erro ao verificar status da lista de desejos")
      );
    }
  }
  // ===============================================
  // BUSCA
  // ===============================================

  /**
   * Busca opções de filtros disponíveis
   */
  async getFilterOptions(): Promise<SearchFilterOptions> {
    try {
      const response = await apiClient.get<SearchFilterOptions>("/search/filters");
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar opções de filtros"));
    }
  }

  /**
   * Busca todas as marcas disponíveis
   */
  async getBrands(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>("/search/brands");
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar marcas"));
    }
  }

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
