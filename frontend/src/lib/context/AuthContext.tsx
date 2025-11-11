"use client";

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
  role: "BUYER",
  phone: "+55 51 99999-8888",
  cpf: "123.456.789-00",
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

  const loadUser = async () => {
    try {
      setIsLoading(true);

      // Verifica se há usuário mockado ativo
      const mockToken = localStorage.getItem("mock_auth_token");
      if (mockToken === "mock_token_active") {
        console.log("🔷 Mock login ativo:", MOCK_USER);
        setUser(MOCK_USER);
        setIsLoading(false);
        return;
      }

      // Se não há mock, busca usuário real do localStorage (salvo pelo authService)
      const currentUser = authService.getCurrentUser();

      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

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

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // Chama o serviço de autenticação com axios
      const response = await authService.login(email, password);

      // O authService já salvou o token e o user no localStorage
      // Apenas atualiza o estado local
      setUser(response.user);

      // Remove token de mock se existir
      localStorage.removeItem("mock_auth_token");

      router.push("/");
      router.refresh();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);

      // Chama o serviço de registro com axios
      const response = await authService.register(userData);

      // Após o registro bem-sucedido, faz login automático
      if (userData.email && userData.password) {
        await login(userData.email, userData.password);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

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

  const mockLogin = useCallback(() => {
    setUser(MOCK_USER);
    localStorage.setItem("mock_auth_token", "mock_token_active");
    console.log("🔷 Mock login ativado:", MOCK_USER);
    router.push("/");
    router.refresh();
  }, [router]);

  const mockLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("mock_auth_token");
    console.log("🔶 Mock logout ativado");
    router.push("/login");
    router.refresh();
  }, [router]);

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
        mockLogin,
        mockLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Re-exporta o tipo User para uso em outros componentes
export type { User };
