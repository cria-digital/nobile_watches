"use client";

import {
  login as authLogin,
  logout as authLogout,
  register as authRegister,
  getCurrentUser,
  User,
} from "@/lib/auth/auth";
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

interface RegisterData {
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
// DADOS MOCKADOS
// ===============================================

/**
 * Usuário mockado para desenvolvimento
 * Todos os campos estão de acordo com os tipos da API
 */
const MOCK_USER: User = {
  id: 1,
  email: "teste@nobile.com",
  name: "Carlos Eduardo Silva",
  role: "BUYER",
  // Campos opcionais (não existem na API real)
  avatar: "/images/avatar-placeholder2.jpg",
  phone: "+55 51 99999-8888",
  cpf: "123.456.789-00",
  addresses: [
    {
      id: "addr-001",
      type: "home",
      street: "Rua das Flores",
      number: "123",
      complement: "Apto 45",
      neighborhood: "Centro",
      city: "Porto Alegre",
      state: "RS",
      zipCode: "90000-000",
      isDefault: true,
    },
  ],
  preferences: {
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    privacy: {
      showEmail: false,
      showPhone: false,
    },
  },
  createdAt: new Date().toISOString(),
};

// ===============================================
// CONTEXTO
// ===============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // ===============================================
  // EFEITO INICIAL - Carrega usuário ao montar
  // ===============================================
  useEffect(() => {
    loadUser();
  }, []);

  // ===============================================
  // FUNÇÃO DE CARREGAMENTO DE USUÁRIO
  // ===============================================
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

      // Se não há mock, busca usuário real da API
      const currentUser = await getCurrentUser();

      // Se não tem name no JWT, tentar recuperar do sessionStorage
      if (currentUser && !currentUser.name) {
        const savedName = sessionStorage.getItem("user_name");
        if (savedName) {
          currentUser.name = savedName;
        }
      }

      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================================
  // FUNÇÃO DE REFRESH
  // ===============================================
  const refreshUser = useCallback(async () => {
    try {
      // Não atualiza se estiver em modo mock
      const mockToken = localStorage.getItem("mock_auth_token");
      if (mockToken === "mock_token_active") {
        return;
      }

      const currentUser = await getCurrentUser();

      if (currentUser && !currentUser.name) {
        const savedName = sessionStorage.getItem("user_name");
        if (savedName) {
          currentUser.name = savedName;
        }
      }

      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      setUser(null);
    }
  }, []);

  // ===============================================
  // LOGIN (API)
  // ===============================================
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authLogin(email, password);

      // Salvar name no sessionStorage
      if (response.user.name) {
        sessionStorage.setItem("user_name", response.user.name);
      }

      // Remove token de mock se existir
      localStorage.removeItem("mock_auth_token");

      setUser(response.user);
      router.push("/");
      router.refresh();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================================
  // REGISTER (API)
  // ===============================================
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await authRegister(userData);

      // Salvar name no sessionStorage
      if (response.user.name) {
        sessionStorage.setItem("user_name", response.user.name);
      }

      // Remove token de mock se existir
      localStorage.removeItem("mock_auth_token");

      setUser(response.user);
      router.push("/");
      router.refresh();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================================
  // LOGOUT (API)
  // ===============================================
  const logout = async () => {
    try {
      await authLogout();
      sessionStorage.removeItem("user_name");
      localStorage.removeItem("mock_auth_token");
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // ===============================================
  // MOCK LOGIN
  // ===============================================
  const mockLogin = useCallback(() => {
    setUser(MOCK_USER);
    localStorage.setItem("mock_auth_token", "mock_token_active");
    sessionStorage.removeItem("user_name");
    console.log("🔷 Mock login ativado:", MOCK_USER);
    router.push("/");
    router.refresh();
  }, [router]);

  // ===============================================
  // MOCK LOGOUT
  // ===============================================
  const mockLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("mock_auth_token");
    sessionStorage.removeItem("user_name");
    console.log("🔶 Mock logout ativado");
    router.push("/login");
    router.refresh();
  }, [router]);

  // ===============================================
  // PROVIDER
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
