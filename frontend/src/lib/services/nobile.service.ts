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

/**
 * Interface para resposta de busca avançada
 */
export interface SearchAdvancedResponse {
  watches: Watch[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Parâmetros para busca avançada
 */
export interface SearchAdvancedParams {
  query?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  movement?: string;
  caseMaterial?: string;
  braceletMaterial?: string;
  dialColor?: string;
  gender?: string;
  minYear?: number;
  maxYear?: number;
  minDiameter?: number;
  maxDiameter?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

class NobileService {
  // ===============================================
  // WATCHES (RELÓGIOS)
  // ===============================================

  /**
   * Busca todos os relógios
   * ⚠️ ATENÇÃO: Este método retorna TODOS os watches, incluindo os sem listings ativos.
   * Para páginas de listagem, use searchWatchesAdvanced() que filtra apenas watches disponíveis.
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
   * 🆕 Busca relógios com busca avançada (apenas com listings ativos)
   *
   * Este é o método RECOMENDADO para páginas de listagem de produtos.
   * Retorna apenas watches que possuem listings ACTIVE (disponíveis para compra).
   *
   * @param params - Parâmetros de busca e filtros
   * @returns Objeto com watches, total, página e totalPages
   *
   * @example
   * // Buscar IWC ordenado por preço
   * const result = await nobileService.searchWatchesAdvanced({
   *   brand: "IWC",
   *   sortBy: "price",
   *   order: "asc",
   *   limit: 20
   * });
   *
   * @example
   * // Buscar todos os watches disponíveis
   * const result = await nobileService.searchWatchesAdvanced({
   *   limit: 100
   * });
   */
  async searchWatchesAdvanced(
    params: SearchAdvancedParams
  ): Promise<SearchAdvancedResponse> {
    try {
      // Remove parâmetros undefined para não enviar na query string
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      );

      const response = await apiClient.get<SearchAdvancedResponse>(
        "/search/advanced",
        { params: cleanParams }
      );

      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar relógios"));
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
      const response = await apiClient.post<{
        message: string;
        relogio: Watch;
      }>("/watches", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao criar relógio"));
    }
  }

  /**
   * Atualiza relógio
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
  async deleteWatch(id: number): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        `/watches/${id}`
      );
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao deletar relógio"));
    }
  }

  // ===============================================
  // LISTINGS (ANÚNCIOS)
  // ===============================================

  /**
   * Cria e publica anúncio em uma única operação
   * Atalho para createListing com publishNow: true
   */
  async createAndPublishListing(
    watchId: number,
    data: {
      shippingInfo?: string;
      returnPolicy?: string;
      deliveryTime?: string;
      negotiable?: boolean;
      titleSuffix?: string;
    }
  ): Promise<ListingResponse> {
    try {
      const listingData: CreateListingRequest = {
        watchId,
        publishNow: true, // ← Chave para publicar automaticamente
        ...data,
      };

      const response = await apiClient.post<ListingResponse>(
        "/listings",
        listingData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Erro ao criar e publicar anúncio")
      );
    }
  }

  /**
   * Busca meus anúncios (vendedor logado)
   */
  async getMyListings(status?: ListingStatus): Promise<Listing[]> {
    try {
      const url = status
        ? `/listings/my-listings?status=${status}`
        : "/listings/my-listings";
      const response = await apiClient.get<Listing[]>(url);
      return response.data;
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Erro ao buscar meus anúncios")
      );
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
      throw new Error(
        extractErrorMessage(error, "Erro ao buscar anúncios ativos")
      );
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
  async updateListing(
    id: number,
    data: UpdateListingRequest
  ): Promise<ListingResponse> {
    try {
      const response = await apiClient.put<ListingResponse>(
        `/listings/${id}`,
        data
      );
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
      const response = await apiClient.put<ListingResponse>(
        `/listings/${id}/pause`,
        {}
      );
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
      const response = await apiClient.put<ListingResponse>(
        `/listings/${id}/cancel`,
        {}
      );
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
      throw new Error(
        extractErrorMessage(error, "Erro ao marcar anúncio como vendido")
      );
    }
  }

  /**
   * Deleta anúncio
   */
  async deleteListing(id: number): Promise<DeleteListingResponse> {
    try {
      const response = await apiClient.delete<DeleteListingResponse>(
        `/listings/${id}`
      );
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao deletar anúncio"));
    }
  }

  // ===============================================
  // ORDERS (PEDIDOS)
  // ===============================================

  /**
   * Busca pedidos do usuário
   */
  async getOrders(): Promise<Order[]> {
    try {
      const response = await apiClient.get<Order[]>("/orders");
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
   * Cria novo pedido
   */
  async createOrder(data: {
    watchId: number;
    shippingAddress: string;
    paymentMethod: string;
  }): Promise<Order> {
    try {
      const response = await apiClient.post<Order>("/orders", data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao criar pedido"));
    }
  }

  // ===============================================
  // MESSAGES (MENSAGENS)
  // ===============================================

  /**
   * Busca conversas do usuário
   */
  async getConversations(): Promise<Message[]> {
    try {
      const response = await apiClient.get<Message[]>("/messages");
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar conversas"));
    }
  }

  /**
   * Busca mensagens entre usuários
   */
  async getMessagesBetweenUsers(otherUserId: number): Promise<Message[]> {
    try {
      const response = await apiClient.get<Message[]>(
        `/messages/conversation/${otherUserId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar mensagens"));
    }
  }

  /**
   * Envia mensagem
   */
  async sendMessage(data: {
    receiverId: number;
    content: string;
  }): Promise<Message> {
    try {
      const response = await apiClient.post<Message>("/messages", data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao enviar mensagem"));
    }
  }

  // ===============================================
  // COLLECTIONS (COLEÇÕES)
  // ===============================================

  /**
   * Busca coleção do usuário
   */
  async getCollection(): Promise<Collection[]> {
    try {
      const response = await apiClient.get<Collection[]>("/collections");
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar coleção"));
    }
  }

  /**
   * Adiciona relógio à coleção
   */
  async createCollection(data: {
    watchId: number;
    estimatedValue?: number;
  }): Promise<Collection> {
    try {
      const response = await apiClient.post<Collection>("/collections", data);
      return response.data;
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Erro ao adicionar relógio à coleção")
      );
    }
  }

  /**
   * Atualiza item da coleção
   */
  async updateCollection(
    id: number,
    data: { estimatedValue?: number }
  ): Promise<Collection> {
    try {
      const response = await apiClient.put<Collection>(
        `/collections/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Erro ao atualizar item da coleção")
      );
    }
  }

  /**
   * Remove relógio da coleção por watchId
   */
  async removeWatchFromCollection(
    watchId: number
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        `/collections/watch/${watchId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Erro ao remover relógio da coleção")
      );
    }
  }

  /**
   * Remove item da coleção por ID
   */
  async deleteCollection(id: number): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        `/collections/${id}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Erro ao remover item da coleção")
      );
    }
  }

  // ===============================================
  // WISHLIST (LISTA DE DESEJOS)
  // ===============================================

  /**
   * Busca lista de desejos do usuário
   */
  async getWishlist(): Promise<WishlistItem[]> {
    try {
      const response = await apiClient.get<WishlistItem[]>("/wishlist");
      return response.data;
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Erro ao buscar lista de desejos")
      );
    }
  }

  /**
   * Adiciona relógio à lista de desejos
   */
  async addToWishlist(watchId: number): Promise<WishlistItem> {
    try {
      const response = await apiClient.post<WishlistItem>("/wishlist", {
        watchId,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Erro ao adicionar à lista de desejos")
      );
    }
  }

  /**
   * Remove relógio da lista de desejos
   */
  async removeFromWishlist(watchId: number): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        `/wishlist/${watchId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Erro ao remover da lista de desejos")
      );
    }
  }

  /**
   * Verifica se relógio está na lista de desejos
   */
  async checkWishlistStatus(
    watchId: number
  ): Promise<{ isInWishlist: boolean }> {
    try {
      const response = await apiClient.get<{ isInWishlist: boolean }>(
        `/wishlist/check/${watchId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        extractErrorMessage(
          error,
          "Erro ao verificar status da lista de desejos"
        )
      );
    }
  }

  // ===============================================
  // PRICE HISTORY (HISTÓRICO DE PREÇOS)
  // ===============================================

  /**
   * Busca histórico de preços
   */
  async getPriceHistory(watchModel: string): Promise<PriceHistory[]> {
    try {
      const response = await apiClient.get<PriceHistory[]>("/price-history", {
        params: { watchModel },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Erro ao buscar histórico de preços")
      );
    }
  }

  // ===============================================
  // ADMIN (ADMINISTRAÇÃO)
  // ===============================================

  /**
   * Busca logs de admin
   */
  async getAdminLogs(): Promise<AdminLog[]> {
    try {
      const response = await apiClient.get<AdminLog[]>("/admin/logs");
      return response.data;
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Erro ao buscar logs de admin")
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
      const response =
        await apiClient.get<SearchFilterOptions>("/search/filters");
      return response.data;
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Erro ao buscar opções de filtros")
      );
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
   * ⚠️ Para páginas de listagem, use searchWatchesAdvanced()
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
