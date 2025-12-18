import { apiClient, extractErrorMessage } from "@/lib/api";
import { Product } from "@/types/product";

/**
 * Estrutura de item do carrinho retornado pelo backend
 */
interface BackendCartItem {
  id: number;
  cartId: number;
  watchId: number;
  listingId: number | null;
  quantity: number;
  addedAt: string;
  watch: {
    id: number;
    brand: string;
    model: string;
    price: number;
    images: string[];
    condition: string;
    seller: {
      id: number;
      name: string;
      isVerified?: boolean;
    };
  };
  listing: {
    id: number;
    watchId: number;
    sellerId: number;
    status: "ACTIVE" | "DRAFT" | "PAUSED" | "SOLD" | "CANCELLED";
    titleSuffix?: string;
    shippingInfo?: string;
    returnPolicy?: string;
    deliveryTime?: string;
    negotiable: boolean;
    publishedAt?: string;
  };
}

/**
 * Estrutura de item do carrinho no frontend
 */
export interface CartItem {
  id: string;
  watchId: number;
  seller: {
    name: string;
    isVerified: boolean;
  };
  watch: {
    brand: string;
    model: string;
    image: string;
    condition: string;
  };
  price: number;
  addedAt: string;
  listing: {
    id: number;
    watchId: number;
    sellerId: number;
    status: "ACTIVE" | "DRAFT" | "PAUSED" | "SOLD" | "CANCELLED";
    titleSuffix?: string;
    shippingInfo?: string;
    returnPolicy?: string;
    deliveryTime?: string;
    negotiable: boolean;
    publishedAt?: string;
  };
}

/**
 * Service para gerenciar o carrinho de compras
 * Centraliza todas as chamadas à API de carrinho
 */
class CartService {
  /**
   * Mapeia item do backend para o formato do frontend
   */
  private mapToCartItem(backendItem: BackendCartItem): CartItem {
    return {
      id: backendItem.id.toString(),
      watchId: backendItem.watchId,
      seller: {
        name: backendItem.watch.seller.name,
        isVerified: backendItem.watch.seller.isVerified ?? true,
      },
      watch: {
        brand: backendItem.watch.brand,
        model: backendItem.watch.model,
        image: backendItem.watch.images[0] || "",
        condition: backendItem.watch.condition,
      },
      listing: backendItem.listing,
      price: backendItem.watch.price,
      addedAt: backendItem.addedAt,
    };
  }

  /**
   * Adiciona um produto ao carrinho
   * POST /api/cart/items
   */
  async addToCart(product: Product): Promise<{
    success: boolean;
    message: string;
    cartItem?: CartItem;
  }> {
    try {
      const response = await apiClient.post<{
        message: string;
        cartItem: BackendCartItem;
      }>("/cart/items", {
        watchId: product.id,
      });

      return {
        success: true,
        message: response.data.message,
        cartItem: this.mapToCartItem(response.data.cartItem),
      };
    } catch (error) {
      const errorMessage = extractErrorMessage(
        error,
        "Erro ao adicionar produto ao carrinho"
      );

      // Tratamento específico para erro de duplicata
      if (
        errorMessage.toLowerCase().includes("já está") ||
        errorMessage.toLowerCase().includes("duplicate")
      ) {
        return {
          success: false,
          message: "Este produto já está no seu carrinho",
        };
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Lista todos os itens do carrinho
   * GET /api/cart/items
   */
  async getCartItems(): Promise<CartItem[]> {
    try {
      const response = await apiClient.get<{ items: BackendCartItem[] }>(
        "/cart/items"
      );

      return response.data.items.map((item) => this.mapToCartItem(item));
    } catch (error) {
      console.error("Erro ao buscar itens do carrinho:", error);
      throw new Error(extractErrorMessage(error, "Erro ao carregar carrinho"));
    }
  }

  /**
   * Remove um item do carrinho
   * DELETE /api/cart/items/:itemId
   */
  async removeFromCart(itemId: string | number): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      await apiClient.delete(`/cart/items/${itemId}`);

      return {
        success: true,
        message: "Produto removido do carrinho",
      };
    } catch (error) {
      console.error("Erro ao remover do carrinho:", error);
      return {
        success: false,
        message: extractErrorMessage(
          error,
          "Erro ao remover produto do carrinho"
        ),
      };
    }
  }

  /**
   * Limpa todo o carrinho
   * DELETE /api/cart
   */
  async clearCart(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      await apiClient.delete("/cart");

      return {
        success: true,
        message: "Carrinho limpo com sucesso",
      };
    } catch (error) {
      console.error("Erro ao limpar carrinho:", error);
      return {
        success: false,
        message: extractErrorMessage(error, "Erro ao limpar carrinho"),
      };
    }
  }

  /**
   * Obtém a contagem de itens no carrinho
   * GET /api/cart/count
   */
  async getCartCount(): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>("/cart/count");
      return response.data.count;
    } catch (error) {
      console.error("Erro ao contar itens do carrinho:", error);
      return 0;
    }
  }
}

export const cartService = new CartService();
