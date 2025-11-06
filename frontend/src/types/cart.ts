/**
 * Tipos relacionados ao carrinho e checkout
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
}

export interface ShippingAddress {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface ShippingMethod {
  id: string;
  name: string;
  carrier: "Fedex" | "Jadlog";
  deliveryTime: string;
  price: number;
}

export interface AuthenticationOption {
  enabled: boolean;
  provider: "Watch time!";
  description: string;
  price: number;
}

export type PaymentMethod = "pix" | "card" | "boleto";

export interface PaymentData {
  method: PaymentMethod;
  // Dados específicos por método
  pixData?: {
    qrCode: string;
    qrCodeUrl: string;
    expiresAt: string;
  };
  boletoData?: {
    barCode: string;
    barCodeUrl: string;
    dueDate: string;
  };
  cardData?: {
    cardNumber: string;
    cardHolderName: string;
    expirationDate: string;
    cvv: string;
    cpf: string;
    installments: number;
  };
}

export interface CheckoutData {
  items: CartItem[];
  shippingAddress: ShippingAddress | null;
  shippingMethod: ShippingMethod | null;
  authentication: AuthenticationOption;
  payment: PaymentData | null;
  summary: {
    subtotal: number;
    shipping: number;
    authentication: number;
    total: number;
  };
}

export interface CheckoutStep {
  id: number;
  title: string;
  isComplete: boolean;
  isCurrent: boolean;
}
