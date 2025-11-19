export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  cpf?: string;
  addresses: Address[];
  preferences: UserPreferences;
  createdAt: string;
}

export interface Address {
  id: string;
  type: "home" | "work" | "other";
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
  };
}

/**
 * Tipos relacionados ao perfil e dados do usuário
 */

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  role: "BUYER" | "SELLER" | "ADMIN";
  isVerified?: boolean;
  createdAt: string;
  updatedAt?: string;

  // não existe
  avatar?: string;
}

export interface UserActivity {
  vendidos: number;
  comprados: number;
  colecao: number;
}

export interface PaymentMethod {
  id: string;
  cardholderName: string;
  cardNumber: string; // últimos 4 dígitos
  expiryDate: string;
  cvv: string;
  type: "Crédito" | "Débito";
}

export interface BillingAddress {
  id: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserProfileData {
  user: UserProfile;
  activity: UserActivity;
  paymentMethods: PaymentMethod[];
  billingAddresses: BillingAddress[];
}
