"use client";

import { User } from "@/lib/auth/auth";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  mockLogin: () => void;
  mockLogout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  role?: "BUYER" | "SELLER";
}

// Usuário mockado para testes
const MOCK_USER: User = {
  id: 1,
  email: "teste@nobile.com",
  name: "Lohan Marçal",
  avatar: "/images/avatar-placeholder.jpg",
  phone: "+55 51 99999-8888",
  cpf: "123.456.789-00",
  role: "BUYER",
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

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verifica se há usuário mockado ao montar o componente
  useEffect(() => {
    const mockToken = localStorage.getItem("mock_auth_token");
    if (mockToken === "mock_token_active") {
      setUser(MOCK_USER);
      setIsLoading(false);
      return;
    }

    // Busca o usuário real se não houver mock ativo
    const hasSession = localStorage.getItem("hasSession");
    if (hasSession) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Busca o usuário atual ao montar o componente
  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Marca que há uma sessão ativa
        localStorage.setItem("hasSession", "true");
      } else {
        setUser(null);
        // Remove o marcador de sessão
        localStorage.removeItem("hasSession");
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      setUser(null);
      localStorage.removeItem("hasSession");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Erro ao fazer login");
        }

        const data = await response.json();
        setUser(data.user);
        // Marca que há uma sessão ativa após login bem-sucedido
        localStorage.setItem("hasSession", "true");
        // Remove token de mock se existir
        localStorage.removeItem("mock_auth_token");
        router.refresh();
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Erro ao fazer registro");
        }

        const responseData = await response.json();
        setUser(responseData.user);
        // Marca que há uma sessão ativa após registro bem-sucedido
        localStorage.setItem("hasSession", "true");
        // Remove token de mock se existir
        localStorage.removeItem("mock_auth_token");
        router.refresh();
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setUser(null);
      // Remove o marcador de sessão no logout
      localStorage.removeItem("hasSession");
      localStorage.removeItem("mock_auth_token");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }, [router]);

  // Função para simular login (apenas para desenvolvimento)
  const mockLogin = useCallback(() => {
    setUser(MOCK_USER);
    localStorage.setItem("mock_auth_token", "mock_token_active");
    localStorage.removeItem("hasSession");
    console.log("🔐 Mock login ativado:", MOCK_USER);
  }, []);

  // Função para simular logout (apenas para desenvolvimento)
  const mockLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("mock_auth_token");
    localStorage.removeItem("hasSession");
    console.log("🔓 Mock logout ativado");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
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
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
