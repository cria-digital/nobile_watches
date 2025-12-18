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

export interface ForgotPasswordResponse {
  message: string;
  email: string;
}

export interface ValidateResetTokenResponse {
  valid: boolean;
  message?: string;
  email?: string;
  expiresIn?: string;
  error?: string;
}

export interface ResetPasswordResponse {
  message: string;
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

const USER_KEY = "nobile_user";
const MOCK_TOKEN_KEY = "mock_auth_token";

// ===============================================
// SERVIÇO DE AUTENTICAÇÃO
// ===============================================

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Chama API Route do Next.js (não backend direto)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ Envia/recebe cookies
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao fazer login");
      }

      const data = await response.json();

      // Salva apenas dados do usuário (não token)
      if (data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }

      return {
        message: data.message || "Login realizado com sucesso",
        user: data.user,
      };
    } catch (error) {
      throw new Error(
        extractErrorMessage(
          error,
          "Erro ao fazer login. Verifique suas credenciais."
        )
      );
    }
  }

  async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao fazer registro");
      }

      const data = await response.json();

      // Salva apenas dados do usuário
      if (data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }

      return {
        message: data.message || "Cadastro realizado com sucesso",
        user: data.user,
      };
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erro ao fazer registro."));
    }
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      const response = await publicApiClient.post<ForgotPasswordResponse>(
        "/auth/forgot-password",
        { email }
      );

      return response.data;
    } catch (error: any) {
      // Tratamento específico para rate limit (429)
      if (error.response?.status === 429) {
        throw new Error(
          "Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente."
        );
      }

      // Tratamento para bad request (400)
      if (error.response?.status === 400) {
        throw new Error(
          error.response?.data?.message ||
            "Email inválido. Verifique o endereço informado."
        );
      }

      // Erro genérico
      throw new Error(
        extractErrorMessage(
          error,
          "Erro ao enviar código de recuperação. Tente novamente."
        )
      );
    }
  }

  async validateResetToken(code: string): Promise<ValidateResetTokenResponse> {
    try {
      const response = await publicApiClient.get<ValidateResetTokenResponse>(
        `/auth/reset-password/${code}`
      );

      return response.data;
    } catch (error: any) {
      // Tratamento para bad request (400) - Token inválido ou expirado
      if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.error || "Código inválido ou expirado.";
        throw new Error(errorMessage);
      }

      // Tratamento para erro interno (500)
      if (error.response?.status === 500) {
        throw new Error("Erro ao validar código. Tente novamente.");
      }

      // Erro genérico
      throw new Error(
        extractErrorMessage(error, "Erro ao validar código. Tente novamente.")
      );
    }
  }

  async resetPassword(
    code: string,
    newPassword: string
  ): Promise<ResetPasswordResponse> {
    try {
      const response = await publicApiClient.post<ResetPasswordResponse>(
        "/auth/reset-password",
        {
          token: code,
          newPassword,
        }
      );

      return response.data;
    } catch (error: any) {
      // Tratamento para bad request (400) - Token inválido
      if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.error || "Código inválido ou expirado.";
        throw new Error(errorMessage);
      }

      // Erro genérico
      throw new Error(
        extractErrorMessage(error, "Erro ao redefinir senha. Tente novamente.")
      );
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<User>("/users/me");

      // Atualiza localStorage com dados atualizados
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Erro ao buscar perfil do usuário.")
      );
    }
  }

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
          onUploadProgress: (progressEvent) => {
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
        extractErrorMessage(
          error,
          "Erro ao enviar documentos para verificação."
        )
      );
    }
  }

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

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return !!user;
  }

  async logout(): Promise<void> {
    try {
      // Limpa cookie no servidor
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Erro ao fazer logout no servidor:", error);
    } finally {
      // Limpa dados locais (sempre)
      if (typeof window !== "undefined") {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(MOCK_TOKEN_KEY);
      }
    }
  }

  getUserId(): number | null {
    const user = this.getCurrentUser();
    return user?.id || null;
  }

  getUserRole(): "BUYER" | "SELLER" | "ADMIN" | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  async validateToken(): Promise<boolean> {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      return response.ok;
    } catch (error) {
      console.error("Erro ao validar token:", error);
      return false;
    }
  }
}

export const authService = new AuthService();

// Exporta a classe para testes
export default AuthService;
