/**
 * Serviço de Compra - Gerencia operações de compra
 *
 * Este serviço integra com o backend Nobile e fornece métodos para:
 * - Adicionar produtos ao carrinho
 * - Criar pedidos
 * - Iniciar processo de checkout
 *
 * Usa apiClient centralizado do lib/api/client para todas as requisições
 */

import { apiClient, extractErrorMessage } from "@/lib/api";
import { CartItem } from "@/types/cart";
import { Product } from "@/types/product";

/**
 * Interface para resposta de criação de pedido (baseada na API do backend)
 */
interface CreateOrderResponse {
  message: string;
  pedido: {
    id: number;
    userId: number;
    watchId: number;
    status: string;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Interface para resposta de checkout (baseada na API do backend)
 */
interface CheckoutResponse {
  checkoutUrl: string;
}

/**
 * Classe de serviço para operações de compra
 */
class PurchaseService {
  /**
   * Converte um Product em CartItem
   * Gera ID único baseado no watchId e timestamp
   */
  productToCartItem(product: Product): CartItem {
    return {
      id: `cart-${product.id}-${Date.now()}`,
      watchId: product.id,
      seller: {
        name: product.seller?.name || "Vendedor Certificado",
        isVerified: true,
      },
      watch: {
        brand: product.brand,
        model: product.model,
        image: product.images[0] || "/images/placeholder-watch.png",
        condition: product.condition,
      },
      price: product.price,
    };
  }

  /**
   * Adiciona um produto ao carrinho
   * Faz requisição para API e sincroniza com localStorage para persistência offline
   */
  async addToCart(product: Product): Promise<{
    success: boolean;
    message: string;
    cartItem?: CartItem;
  }> {
    try {
      const cartItem = this.productToCartItem(product);

      // Fazer requisição à API usando apiClient
      // Endpoint: POST /cart/items
      const response = await apiClient.post<{
        message: string;
        cartItem: CartItem;
      }>("/cart/items", {
        watchId: product.id,
        quantity: 1,
      });

      // Também manter no localStorage para consistência offline
      const savedCart = localStorage.getItem("nobile:cart");
      const currentCart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

      // Verificar se já existe antes de adicionar
      const existingItem = currentCart.find(item => item.watchId === product.id);
      if (!existingItem) {
        currentCart.push(cartItem);
        localStorage.setItem("nobile:cart", JSON.stringify(currentCart));
      }

      return {
        success: true,
        message: response.data.message || "Produto adicionado ao carrinho com sucesso",
        cartItem: response.data.cartItem || cartItem,
      };
    } catch (error) {
      const errorMessage = extractErrorMessage(
        error,
        "Erro ao adicionar produto ao carrinho"
      );

      // Se for erro de duplicata, retornar mensagem específica
      if (
        errorMessage.toLowerCase().includes("já está") ||
        errorMessage.toLowerCase().includes("duplicate") ||
        errorMessage.toLowerCase().includes("already")
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
   * Cria um pedido no backend
   * Endpoint: POST /orders
   */
  async createOrder(watchId: number): Promise<{
    success: boolean;
    data?: CreateOrderResponse;
    error?: string;
  }> {
    try {
      const response = await apiClient.post<CreateOrderResponse>("/orders", {
        watchId,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      return {
        success: false,
        error: extractErrorMessage(error, "Erro ao criar pedido"),
      };
    }
  }

  /**
   * Inicia o processo de checkout para um pedido
   * Endpoint: POST /orders/checkout/:orderId
   */
  async createCheckout(orderId: number): Promise<{
    success: boolean;
    data?: CheckoutResponse;
    error?: string;
  }> {
    try {
      const response = await apiClient.post<CheckoutResponse>(
        `/orders/checkout/${orderId}`
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erro ao criar checkout:", error);
      return {
        success: false,
        error: extractErrorMessage(error, "Erro ao criar checkout"),
      };
    }
  }

  /**
   * Fluxo completo: Adiciona ao carrinho e redireciona
   * Esta é a função principal chamada pelo botão de compra
   */
  async addToCartAndRedirect(product: Product): Promise<{
    success: boolean;
    message: string;
    redirectTo?: string;
  }> {
    try {
      // Adicionar ao carrinho
      const result = await this.addToCart(product);

      if (!result.success) {
        // Se o produto já está no carrinho, redirecionar mesmo assim
        if (result.message.includes("já está")) {
          return {
            success: true,
            message: result.message,
            redirectTo: "/account/cart",
          };
        }
        return result;
      }

      // Redirecionar para o carrinho
      return {
        success: true,
        message: result.message,
        redirectTo: "/account/cart",
      };
    } catch (error) {
      console.error("Erro no fluxo de compra:", error);
      return {
        success: false,
        message: extractErrorMessage(error, "Erro ao processar compra"),
      };
    }
  }

  /**
   * Fluxo alternativo: Compra direta (sem carrinho)
   * Cria pedido e inicia checkout imediatamente
   */
  async buyNow(watchId: number): Promise<{
    success: boolean;
    message?: string;
    checkoutUrl?: string;
    error?: string;
  }> {
    try {
      // Criar pedido
      const orderResult = await this.createOrder(watchId);

      if (!orderResult.success || !orderResult.data) {
        return {
          success: false,
          error: orderResult.error || "Erro ao criar pedido",
        };
      }

      // Criar checkout
      const checkoutResult = await this.createCheckout(orderResult.data.pedido.id);

      if (!checkoutResult.success || !checkoutResult.data) {
        return {
          success: false,
          error: checkoutResult.error || "Erro ao criar checkout",
        };
      }

      return {
        success: true,
        message: "Redirecionando para checkout...",
        checkoutUrl: checkoutResult.data.checkoutUrl,
      };
    } catch (error) {
      console.error("Erro na compra direta:", error);
      return {
        success: false,
        error: extractErrorMessage(error, "Erro ao processar compra"),
      };
    }
  }

  /**
   * Verifica se o usuário está autenticado
   * Verifica a presença do token no localStorage
   */
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  }

  /**
   * Remove um item do carrinho
   * Endpoint: DELETE /cart/items/:cartItemId
   */
  async removeFromCart(cartItemId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      await apiClient.delete(`/cart/items/${cartItemId}`);

      // Também remover do localStorage
      const savedCart = localStorage.getItem("nobile:cart");
      const currentCart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];
      const updatedCart = currentCart.filter(item => item.id !== cartItemId);
      localStorage.setItem("nobile:cart", JSON.stringify(updatedCart));

      return {
        success: true,
        message: "Produto removido do carrinho",
      };
    } catch (error) {
      console.error("Erro ao remover do carrinho:", error);
      return {
        success: false,
        message: extractErrorMessage(error, "Erro ao remover produto do carrinho"),
      };
    }
  }

  /**
   * Obtém os itens do carrinho
   * Endpoint: GET /cart/items
   */
  async getCartItems(): Promise<{
    success: boolean;
    items: CartItem[];
    error?: string;
  }> {
    try {
      const response = await apiClient.get<{ items: CartItem[] }>("/cart/items");

      // Sincronizar com localStorage para cache offline
      localStorage.setItem("nobile:cart", JSON.stringify(response.data.items));

      return {
        success: true,
        items: response.data.items,
      };
    } catch (error) {
      console.error("Erro ao obter itens do carrinho:", error);
      return {
        success: false,
        items: [],
        error: extractErrorMessage(error, "Erro ao obter itens do carrinho"),
      };
    }
  }

  /**
   * Limpa todo o carrinho
   * Endpoint: DELETE /cart
   */
  async clearCart(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      await apiClient.delete("/cart");

      // Também limpar localStorage
      localStorage.removeItem("nobile:cart");

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
}

// Exportar instância singleton
export const purchaseService = new PurchaseService();

// Exportar classe para testes
export default PurchaseService;
