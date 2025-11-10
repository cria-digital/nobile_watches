/**
 * Serviço de Compra - Gerencia operações de compra com suporte a modo mock e real
 *
 * Este serviço integra com o backend Nobile e fornece métodos para:
 * - Adicionar produtos ao carrinho
 * - Criar pedidos
 * - Iniciar processo de checkout
 */

import { CartItem } from "@/types/cart";
import { Product } from "@/types/product";

/**
 * Configuração do modo de operação
 * false = usa dados reais da API
 * true = usa dados mockados
 */
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

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
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  }

  /**
   * Obtém o token de autenticação do localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  /**
   * Cria headers para requisições autenticadas
   */
  private getAuthHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

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
   * Em modo mock: usa localStorage
   * Em modo real: sincroniza com a API (quando disponível)
   */
  async addToCart(product: Product): Promise<{
    success: boolean;
    message: string;
    cartItem?: CartItem;
  }> {
    try {
      const cartItem = this.productToCartItem(product);

      if (USE_MOCK_DATA) {
        // Modo Mock: usar localStorage
        const savedCart = localStorage.getItem("nobile:cart");
        const currentCart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

        // Verificar se o item já está no carrinho
        const existingItem = currentCart.find(item => item.watchId === product.id);
        if (existingItem) {
          return {
            success: false,
            message: "Este produto já está no seu carrinho",
          };
        }

        // Adicionar ao carrinho
        currentCart.push(cartItem);
        localStorage.setItem("nobile:cart", JSON.stringify(currentCart));

        return {
          success: true,
          message: "Produto adicionado ao carrinho com sucesso",
          cartItem,
        };
      }

      // Modo Real: sincronizar com API
      // TODO: Implementar endpoint de carrinho no backend quando disponível
      // Por enquanto, usar localStorage como fallback
      const savedCart = localStorage.getItem("nobile:cart");
      const currentCart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

      const existingItem = currentCart.find(item => item.watchId === product.id);
      if (existingItem) {
        return {
          success: false,
          message: "Este produto já está no seu carrinho",
        };
      }

      currentCart.push(cartItem);
      localStorage.setItem("nobile:cart", JSON.stringify(currentCart));

      return {
        success: true,
        message: "Produto adicionado ao carrinho com sucesso",
        cartItem,
      };
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      return {
        success: false,
        message: "Erro ao adicionar produto ao carrinho",
      };
    }
  }

  /**
   * Cria um pedido no backend
   * Em modo mock: retorna dados simulados
   * Em modo real: faz requisição POST /orders
   */
  async createOrder(watchId: number): Promise<{
    success: boolean;
    data?: CreateOrderResponse;
    error?: string;
  }> {
    try {
      if (USE_MOCK_DATA) {
        // Modo Mock: simular delay e retornar dados mockados
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockResponse: CreateOrderResponse = {
          message: "Pedido criado com sucesso",
          pedido: {
            id: Math.floor(Math.random() * 1000) + 1,
            userId: 1,
            watchId,
            status: "Pendente",
            totalAmount: 80300,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };

        return {
          success: true,
          data: mockResponse,
        };
      }

      // Modo Real: fazer requisição à API
      const response = await fetch(`${this.apiBaseUrl}/orders`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ watchId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar pedido");
      }

      const data: CreateOrderResponse = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao criar pedido",
      };
    }
  }

  /**
   * Inicia o processo de checkout para um pedido
   * Em modo mock: retorna URL simulada
   * Em modo real: faz requisição POST /orders/checkout/:orderId
   */
  async createCheckout(orderId: number): Promise<{
    success: boolean;
    data?: CheckoutResponse;
    error?: string;
  }> {
    try {
      if (USE_MOCK_DATA) {
        // Modo Mock: simular delay e retornar URL mockada
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockResponse: CheckoutResponse = {
          checkoutUrl: `/checkout?orderId=${orderId}`,
        };

        return {
          success: true,
          data: mockResponse,
        };
      }

      // Modo Real: fazer requisição à API
      const response = await fetch(`${this.apiBaseUrl}/orders/checkout/${orderId}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar checkout");
      }

      const data: CheckoutResponse = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Erro ao criar checkout:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao criar checkout",
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
            redirectTo: "/carrinho",
          };
        }
        return result;
      }

      // Redirecionar para o carrinho
      return {
        success: true,
        message: result.message,
        redirectTo: "/carrinho",
      };
    } catch (error) {
      console.error("Erro no fluxo de compra:", error);
      return {
        success: false,
        message: "Erro ao processar compra",
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
        error: "Erro ao processar compra",
      };
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

// Exportar instância singleton
export const purchaseService = new PurchaseService();

// Exportar classe para testes
export default PurchaseService;
