"use client";

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
 * Interface User - campos base da API + campos opcionais para mock
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: "BUYER" | "SELLER" | "ADMIN";
  // Campos opcionais (não existem na API mas são úteis no mock)
  avatar?: string;
  phone?: string;
  cpf?: string;
  addresses?: Address[];
  preferences?: UserPreferences;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

interface JWTPayload {
  id: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// ===============================================
// FUNÇÕES AUXILIARES
// ===============================================

/**
 * Decodifica um JWT manualmente (base64)
 */
function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    //@ts-ignore
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error("Erro ao decodificar JWT:", error);
    return null;
  }
}

// ===============================================
// FUNÇÕES DE AUTENTICAÇÃO
// ===============================================

/**
 * Verifica se há um token válido e retorna os dados do usuário
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Faz requisição para a rota API que lê o cookie
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Erro ao buscar usuário atual:", error);
    return null;
  }
}

/**
 * Obtém apenas o ID do usuário
 */
export async function getUserId(): Promise<number | null> {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user?.id || null;
  } catch (error) {
    console.error("Erro ao buscar ID do usuário:", error);
    return null;
  }
}

/**
 * Obtém o role do usuário
 */
export async function getUserRole(): Promise<"BUYER" | "SELLER" | "ADMIN" | null> {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user?.role || null;
  } catch (error) {
    console.error("Erro ao buscar role do usuário:", error);
    return null;
  }
}

/**
 * Faz login no backend e salva o token
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erro ao fazer login");
  }

  const data: AuthResponse = await response.json();
  return data;
}

/**
 * Faz registro no backend
 */
export async function register(userData: {
  name: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  role?: "BUYER" | "SELLER";
}): Promise<AuthResponse> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erro ao fazer registro");
  }

  const data: AuthResponse = await response.json();
  return data;
}

/**
 * Faz logout
 */
export async function logout() {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
}
