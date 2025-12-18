import { apiClient, extractErrorMessage } from "@/lib/api";

/**
 * Estrutura do pedido retornado pelo backend
 */
interface BackendOrder {
  id: number;
  buyerId: number;
  watchId: number;
  listingId: number;
  status: string;
  shippingInfo: string | null;
  watch: {
    id: number;
    brand: string;
    model: string;
    price: number;
    images: string[];
  };
  listing: {
    seller: {
      id: number;
      name: string;
      email: string;
    };
  };
}

/**
 * Resposta da criação de pedidos do carrinho
 */
interface CreateOrdersResponse {
  message: string;
  orders: BackendOrder[];
}

/**
 * Resposta do checkout do Stripe
 */
interface StripeCheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

/**
 * Resposta da verificação de pagamento
 */
interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  pedido?: any;
  status?: string;
}

/**
 * Service para gerenciar o fluxo de checkout
 * Centraliza chamadas relacionadas ao checkout com Stripe
 */
class CheckoutService {
  /**
   * Cria pedidos a partir dos itens do carrinho
   * POST /api/orders/from-cart
   *
   * @param itemIds - IDs dos itens do carrinho (opcional, se não informado pega todos)
   */
  async createOrdersFromCart(itemIds?: string[]): Promise<{
    success: boolean;
    orders?: BackendOrder[];
    error?: string;
  }> {
    try {
      const response = await apiClient.post<CreateOrdersResponse>(
        "/orders/from-cart",
        { itemIds }
      );

      return {
        success: true,
        orders: response.data.orders,
      };
    } catch (error) {
      console.error("Erro ao criar pedidos do carrinho:", error);
      return {
        success: false,
        error: extractErrorMessage(error, "Erro ao criar pedidos do carrinho"),
      };
    }
  }

  /**
   * Cria checkout direto do carrinho SEM criar pedidos
   * Pedidos só serão criados quando pagamento for confirmado
   *
   * @param itemIds - IDs dos itens do carrinho (opcional)
   * @param addressId - ID do endereço de entrega
   */
  async createCheckoutFromCart(
    itemIds?: string[],
    addressId?: number
  ): Promise<{
    success: boolean;
    checkoutUrl?: string;
    sessionId?: string;
    error?: string;
  }> {
    try {
      const response = await apiClient.post<{
        checkoutUrl: string;
        sessionId: string;
      }>("/orders/checkout-cart", {
        itemIds,
        addressId, // ✅ Incluir addressId no payload
      });

      return {
        success: true,
        checkoutUrl: response.data.checkoutUrl,
        sessionId: response.data.sessionId,
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
   * Cria sessão de checkout no Stripe para um pedido
   * POST /api/orders/checkout/:orderId
   *
   * @param orderId - ID do pedido
   */
  async createStripeCheckout(orderId: number): Promise<{
    success: boolean;
    checkoutUrl?: string;
    sessionId?: string;
    error?: string;
  }> {
    try {
      const response = await apiClient.post<StripeCheckoutResponse>(
        `/orders/checkout/${orderId}`
      );

      return {
        success: true,
        checkoutUrl: response.data.checkoutUrl,
        sessionId: response.data.sessionId,
      };
    } catch (error) {
      console.error("Erro ao criar checkout Stripe:", error);
      return {
        success: false,
        error: extractErrorMessage(error, "Erro ao criar sessão de pagamento"),
      };
    }
  }

  /**
   * Verifica o status do pagamento no Stripe
   * GET /api/orders/verificar-pagamento?sessionId=xxx
   *
   * @param sessionId - ID da sessão Stripe
   */
  async verifyPayment(sessionId: string): Promise<{
    success: boolean;
    message?: string;
    order?: any;
    error?: string;
  }> {
    try {
      const response = await apiClient.get<PaymentVerificationResponse>(
        `/orders/verificar-pagamento?sessionId=${sessionId}`
      );

      return {
        success: response.data.success,
        message: response.data.message,
        order: response.data.pedido,
      };
    } catch (error) {
      console.error("Erro ao verificar pagamento:", error);
      return {
        success: false,
        error: extractErrorMessage(error, "Erro ao verificar pagamento"),
      };
    }
  }

  /**
   * Fluxo completo de checkout:
   * 1. Cria sessão Stripe direto do carrinho (com endereço)
   * 2. Retorna URL de redirecionamento
   *
   * @param itemIds - IDs dos itens do carrinho (opcional)
   * @param addressId - ID do endereço de entrega
   */
  async processCheckout(
    itemIds?: string[],
    addressId?: number
  ): Promise<{
    success: boolean;
    checkoutUrl?: string;
    sessionId?: string;
    error?: string;
  }> {
    try {
      // Validar endereço
      if (!addressId) {
        return {
          success: false,
          error: "Endereço de entrega é obrigatório",
        };
      }

      // Criar checkout direto do carrinho (SEM criar orders)
      const checkoutResult = await this.createCheckoutFromCart(
        itemIds,
        addressId
      );

      if (!checkoutResult.success) {
        return {
          success: false,
          error: checkoutResult.error || "Erro ao criar sessão de pagamento",
        };
      }
      //@ts-ignore
      return {
        success: true,
        checkoutUrl: checkoutResult.checkoutUrl,
        sessionId: checkoutResult.sessionId,
      };
    } catch (error) {
      console.error("Erro no fluxo de checkout:", error);
      return {
        success: false,
        error: extractErrorMessage(error, "Erro ao processar checkout"),
      };
    }
  }
}

// Exportar instância singleton
export const checkoutService = new CheckoutService();
