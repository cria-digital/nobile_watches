/**
 * Serviço de Autenticação usando Axios
 * Conecta diretamente ao backend no endpoint /auth/login
 */

import axios, { AxiosError } from "axios";

// ===============================================
// CONFIGURAÇÃO DO AXIOS
// ===============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para inserir token JWT automaticamente em requisições autenticadas
authApi.interceptors.request.use(
  config => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("nobile_token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor para tratamento de erros de resposta
authApi.interceptors.response.use(
  response => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    // Se receber 401 Unauthorized, limpa o token e redireciona para login
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("nobile_token");
        localStorage.removeItem("nobile_user");
        // Não redireciona automaticamente para não interferir no fluxo
      }
    }
    return Promise.reject(error);
  }
);

// ===============================================
// TIPOS
// ===============================================

export interface User {
  id: number;
  name: string;
  email: string;
  role: "BUYER" | "SELLER" | "ADMIN";
  phone?: string;
  cpf?: string;
  createdAt?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  role?: "BUYER" | "SELLER";
}

// ===============================================
// SERVIÇO DE AUTENTICAÇÃO
// ===============================================

class AuthService {
  /**
   * Realiza login no backend
   * Endpoint: POST /auth/login
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await authApi.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      // Salva o token no localStorage
      if (response.data.token) {
        localStorage.setItem("nobile_token", response.data.token);
      }

      // Salva os dados do usuário no localStorage
      if (response.data.user) {
        localStorage.setItem("nobile_user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Erro ao fazer login. Verifique suas credenciais.";
        throw new Error(message);
      }
      throw new Error("Erro de conexão com o servidor");
    }
  }

  /**
   * Realiza registro de novo usuário no backend
   * Endpoint: POST /auth/register
   */
  async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await authApi.post<RegisterResponse>("/auth/register", userData);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Erro ao fazer registro.";
        throw new Error(message);
      }
      throw new Error("Erro de conexão com o servidor");
    }
  }

  /**
   * Obtém o usuário atual do localStorage
   */
  getCurrentUser(): User | null {
    try {
      if (typeof window === "undefined") return null;

      const userStr = localStorage.getItem("nobile_user");
      if (!userStr) return null;

      return JSON.parse(userStr);
    } catch (error) {
      console.error("Erro ao buscar usuário atual:", error);
      return null;
    }
  }

  /**
   * Obtém o token atual do localStorage
   */
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("nobile_token");
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Faz logout removendo token e dados do usuário
   */
  logout(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem("nobile_token");
    localStorage.removeItem("nobile_user");
    localStorage.removeItem("mock_auth_token"); // Remove também o token mock se existir
  }

  /**
   * Obtém apenas o ID do usuário
   */
  getUserId(): number | null {
    const user = this.getCurrentUser();
    return user?.id || null;
  }

  /**
   * Obtém o role do usuário
   */
  getUserRole(): "BUYER" | "SELLER" | "ADMIN" | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }
}

// Exporta uma instância única do serviço
export const authService = new AuthService();

// Exporta também a instância do axios configurado para uso avançado
export { authApi };
