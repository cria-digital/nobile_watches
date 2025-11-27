import { apiClient, extractErrorMessage, publicApiClient } from "@/lib/api";

export interface User {
  id: number;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  role: "BUYER" | "SELLER" | "ADMIN";
  isVerified?: boolean;
  verificationStatus?: "pending" | "approved" | "rejected" | null;
  verificationSubmittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface VerificationResponse {
  message: string;
  user: User;
}

export interface VerificationStatusResponse {
  user: {
    id: number;
    name: string;
    email: string;
    isVerified: boolean;
    verificationStatus: "pending" | "approved" | "rejected" | null;
    verificationSubmittedAt?: string;
  };
}

// ===============================================
// CONSTANTES
// ===============================================

const TOKEN_KEY = "token";
const USER_KEY = "nobile_user";
const MOCK_TOKEN_KEY = "mock_auth_token";

// ===============================================
// SERVIÇO DE AUTENTICAÇÃO
// ===============================================

class AuthService {
  /**
   * Realiza login no backend
   * Endpoint: POST /auth/login
   *
   * Usa publicApiClient pois o login não precisa de autenticação prévia
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await publicApiClient.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      // Salva o token no localStorage
      if (response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
      }

      // Salva os dados do usuário no localStorage
      if (response.data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Erro ao fazer login. Verifique suas credenciais.")
      );
    }
  }

  /**
   * Realiza registro de novo usuário no backend
   * Endpoint: POST /auth/register
   *
   * Usa publicApiClient pois o registro não precisa de autenticação
   */
  async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await publicApiClient.post<RegisterResponse>(
        "/auth/register",
        userData
      );

      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao fazer registro."));
    }
  }

  /**
   * Busca perfil do usuário autenticado
   * Endpoint: GET /auth/me
   *
   * Usa apiClient pois precisa de autenticação (token)
   */
  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<User>("/users/me");

      // Atualiza localStorage com dados atualizados
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao buscar perfil do usuário."));
    }
  }

  /**
   * Atualiza perfil do usuário
   * Endpoint: PUT /auth/profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put<User>("/auth/profile", userData);

      // Atualiza localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao atualizar perfil."));
    }
  }

  /**
   * Envia documentos para verificação de identidade com suporte a progresso de upload
   * Endpoint: POST /auth/submit-verification
   */
  async submitVerification(
    documentFront: File,
    documentBack: File,
    selfie: File,
    onProgress?: (progress: number) => void
  ): Promise<VerificationResponse> {
    try {
      const formData = new FormData();
      formData.append("documentFront", documentFront);
      formData.append("documentBack", documentBack);
      formData.append("selfie", selfie);

      const response = await apiClient.post<VerificationResponse>(
        "/auth/submit-verification",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: progressEvent => {
            if (progressEvent.total && onProgress) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          },
        }
      );

      // Atualiza o usuário no localStorage com o novo status de verificação
      const currentUser = this.getCurrentUser();
      if (currentUser && response.data.user) {
        const updatedUser = { ...currentUser, ...response.data.user };
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }

      return response.data;
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Erro ao enviar documentos para verificação.")
      );
    }
  }

  /**
   * Consulta o status de verificação do usuário
   * Endpoint: GET /auth/verification-status
   */
  async getVerificationStatus(): Promise<VerificationStatusResponse> {
    try {
      const response = await apiClient.get<VerificationStatusResponse>(
        "/auth/verification-status"
      );

      // Atualiza o usuário no localStorage com o status atual
      const currentUser = this.getCurrentUser();
      if (currentUser && response.data.user) {
        const updatedUser = { ...currentUser, ...response.data.user };
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }

      return response.data;
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Erro ao consultar status de verificação.")
      );
    }
  }

  /**
   * Obtém o usuário atual do localStorage
   */
  getCurrentUser(): User | null {
    try {
      if (typeof window === "undefined") return null;

      const userStr = localStorage.getItem(USER_KEY);
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
    return localStorage.getItem(TOKEN_KEY);
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

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(MOCK_TOKEN_KEY);
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

  /**
   * Verifica se o token é válido fazendo uma requisição ao backend
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.getProfile();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Exporta uma instância única do serviço
export const authService = new AuthService();

// Exporta a classe para testes
export default AuthService;
