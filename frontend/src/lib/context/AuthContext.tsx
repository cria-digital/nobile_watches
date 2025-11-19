"use client";

import { extractErrorMessage } from "@/lib/api";
import { authService, type RegisterData, type User } from "@/lib/services/auth.service";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  validateToken: () => Promise<boolean>;
  mockLogin: () => void;
  mockLogout: () => void;
}

/**
 * Usuário mockado para desenvolvimento
 * Todos os campos estão de acordo com os tipos da API
 */
const MOCK_USER: User = {
  id: 1,
  email: "teste@nobile.com",
  name: "Lohan Marçal",
  role: "SELLER",
  isVerified: false,
  phone: "+55 51 99999-8888",
  // cpf: "123.456.789-00",
  createdAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  /**
   * Carrega usuário do localStorage ou verifica token no backend
   */
  const loadUser = async () => {
    try {
      setIsLoading(true);

      // Verifica se há usuário mockado ativo
      const mockToken = localStorage.getItem("mock_auth_token");
      if (mockToken === "mock_token_active") {
        console.log("🔷 Mock login ativo:", MOCK_USER);
        setUser(MOCK_USER);
        return;
      }

      // Se não há mock, busca usuário real do localStorage
      // O authService.getCurrentUser() pega do localStorage
      const currentUser = authService.getCurrentUser();

      if (currentUser) {
        // Opcional: validar se o token ainda é válido
        // Descomente se quiser validação automática no carregamento
        // const isValid = await authService.validateToken();
        // if (!isValid) {
        //   authService.logout();
        //   setUser(null);
        //   return;
        // }

        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================================
  // REFRESH USER
  // ===============================================

  /**
   * Atualiza dados do usuário do localStorage
   * Útil após atualização de perfil
   */
  const refreshUser = useCallback(async () => {
    try {
      // Não atualiza se estiver em modo mock
      const mockToken = localStorage.getItem("mock_auth_token");
      if (mockToken === "mock_token_active") {
        return;
      }

      // Busca usuário atualizado do localStorage
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      setUser(null);
    }
  }, []);

  // ===============================================
  // VALIDATE TOKEN
  // ===============================================

  /**
   * Valida se o token ainda é válido no backend
   * Útil para verificar sessão antes de ações críticas
   */
  const validateToken = useCallback(async (): Promise<boolean> => {
    try {
      // Mock sempre é válido
      const mockToken = localStorage.getItem("mock_auth_token");
      if (mockToken === "mock_token_active") {
        return true;
      }

      // Valida token real no backend
      const isValid = await authService.validateToken();

      if (!isValid) {
        // Token inválido - fazer logout
        authService.logout();
        setUser(null);
      }

      return isValid;
    } catch (error) {
      console.error("Erro ao validar token:", error);
      return false;
    }
  }, []);

  // ===============================================
  // LOGIN
  // ===============================================

  /**
   * Realiza login no backend
   * O authService usa publicApiClient internamente
   */
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // ✅ authService já usa apiClient (versão refatorada)
      const response = await authService.login(email, password);

      // O authService já salvou o token e o user no localStorage
      // Apenas atualiza o estado local
      setUser(response.user);

      // Remove token de mock se existir
      localStorage.removeItem("mock_auth_token");

      router.push("/");
      router.refresh();
    } catch (error) {
      // ✅ Usa extractErrorMessage para erro consistente
      const message = extractErrorMessage(error, "Erro ao fazer login");
      console.error(message);
      throw error; // Re-lança para o componente tratar
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================================
  // REGISTER
  // ===============================================

  /**
   * Realiza registro de novo usuário
   * Após sucesso, faz login automático
   */
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);

      // ✅ authService já usa apiClient (versão refatorada)
      await authService.register(userData);

      // Após o registro bem-sucedido, faz login automático
      if (userData.email && userData.password) {
        await login(userData.email, userData.password);
      }
    } catch (error) {
      // ✅ Usa extractErrorMessage para erro consistente
      const message = extractErrorMessage(error, "Erro ao fazer registro");
      console.error(message);
      throw error; // Re-lança para o componente tratar
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================================
  // LOGOUT
  // ===============================================

  /**
   * Faz logout removendo dados e redirecionando
   */
  const logout = async () => {
    try {
      // Remove tokens e dados do usuário
      authService.logout();

      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // ===============================================
  // MOCK LOGIN/LOGOUT (Desenvolvimento)
  // ===============================================

  /**
   * Ativa login mockado para desenvolvimento
   */
  const mockLogin = useCallback(() => {
    setUser(MOCK_USER);
    localStorage.setItem("mock_auth_token", "mock_token_active");
    console.log("🔷 Mock login ativado:", MOCK_USER);
    router.push("/");
    router.refresh();
  }, [router]);

  /**
   * Desativa login mockado
   */
  const mockLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("mock_auth_token");
    console.log("🔶 Mock logout ativado");
    router.push("/login");
    router.refresh();
  }, [router]);

  // ===============================================
  // PROVIDER VALUE
  // ===============================================

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        validateToken,
        mockLogin,
        mockLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ===============================================
// HOOK
// ===============================================

/**
 * Hook para usar o AuthContext
 * Garante que está sendo usado dentro do AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// ===============================================
// EXPORTS
// ===============================================

// Re-exporta o tipo User para uso em outros componentes
export type { User };
