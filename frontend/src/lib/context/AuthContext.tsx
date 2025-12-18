"use client";

/**
 * AuthContext - VERSÃO CORRIGIDA
 *
 * ✅ MUDANÇAS:
 * - Valida token ao carregar aplicação (previne estado inconsistente)
 * - Remove token de localStorage (agora é cookie HttpOnly)
 * - Simplifica lógica de login/logout
 * - Melhora tratamento de erros
 */

import { extractErrorMessage } from "@/lib/api";
import {
  authService,
  type RegisterData,
  type User,
} from "@/lib/services/auth.service";
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
 */
const MOCK_USER: User = {
  id: 1,
  email: "teste@nobile.com",
  name: "Lohan Marçal",
  role: "SELLER",
  isVerified: true,
  phone: "+55 51 99999-8888",
  createdAt: new Date().toISOString(),
};

const USER_KEY = "nobile_user";
const MOCK_TOKEN_KEY = "mock_auth_token";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // ===============================================
  // INICIALIZAÇÃO - Valida token ao carregar
  // ===============================================

  useEffect(() => {
    loadUser();
  }, []);

  /**
   * Carrega usuário e valida token ao iniciar aplicação
   * ✅ CRÍTICO: Sempre valida token para evitar estado inconsistente
   */
  const loadUser = async () => {
    try {
      setIsLoading(true);

      // -----------------------------------------------
      // 1. MODO MOCK (Desenvolvimento)
      // -----------------------------------------------
      const mockToken = localStorage.getItem(MOCK_TOKEN_KEY);
      if (mockToken === "mock_token_active") {
        console.log("🔷 Mock login ativo:", MOCK_USER);
        setUser(MOCK_USER);
        return;
      }

      // -----------------------------------------------
      // 2. MODO REAL - Validar token no backend
      // -----------------------------------------------
      // ✅ MUDANÇA: Sempre valida token (antes estava comentado)
      const isValid = await authService.validateToken();

      if (!isValid) {
        // Token inválido - limpar tudo
        console.log("⚠️ Token inválido detectado ao carregar");
        await authService.logout();
        setUser(null);
        return;
      }

      // -----------------------------------------------
      // 3. Token válido - Buscar dados atualizados
      // -----------------------------------------------
      try {
        const currentUser = await authService.getProfile();
        setUser(currentUser);
        console.log("✅ Usuário autenticado:", currentUser.email);
      } catch (error) {
        // Erro ao buscar perfil - usar cache local se disponível
        console.warn("⚠️ Erro ao buscar perfil, usando cache:", error);
        const cachedUser = authService.getCurrentUser();
        setUser(cachedUser);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar usuário:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================================
  // REFRESH USER
  // ===============================================

  /**
   * Atualiza dados do usuário do backend
   * Útil após atualização de perfil
   */
  const refreshUser = useCallback(async () => {
    try {
      // Não atualiza se estiver em modo mock
      const mockToken = localStorage.getItem(MOCK_TOKEN_KEY);
      if (mockToken === "mock_token_active") {
        return;
      }

      // Busca usuário atualizado do backend
      const currentUser = await authService.getProfile();
      setUser(currentUser);
      console.log("🔄 Usuário atualizado:", currentUser.email);
    } catch (error) {
      console.error("❌ Erro ao atualizar usuário:", error);

      // Se falhar, tenta usar cache local
      const cachedUser = authService.getCurrentUser();
      setUser(cachedUser);
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
      const mockToken = localStorage.getItem(MOCK_TOKEN_KEY);
      if (mockToken === "mock_token_active") {
        return true;
      }

      // Valida token real no backend
      const isValid = await authService.validateToken();

      if (!isValid) {
        // Token inválido - fazer logout
        await authService.logout();
        setUser(null);
      }

      return isValid;
    } catch (error) {
      console.error("❌ Erro ao validar token:", error);
      return false;
    }
  }, []);

  // ===============================================
  // LOGIN
  // ===============================================

  /**
   * Realiza login no backend
   * ✅ MUDANÇA: Simplificado (token é cookie HttpOnly agora)
   */
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // ✅ authService.login() chama /api/auth/login que define cookie
      const response = await authService.login(email, password);

      // Atualiza estado local
      setUser(response.user);

      // Remove token de mock se existir
      localStorage.removeItem(MOCK_TOKEN_KEY);

      console.log("✅ Login realizado:", response.user.email);

      // Redireciona
      router.push("/");
      router.refresh();
    } catch (error) {
      const message = extractErrorMessage(error, "Erro ao fazer login");
      console.error("❌ Erro no login:", message);
      throw error; // Re-lança para o componente tratar
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================================
  // REGISTER
  // ===============================================

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);

      // ✅ authService.register() já faz login automático
      const response = await authService.register(userData);

      // Atualiza estado local
      setUser(response.user);

      console.log("✅ Registro realizado:", response.user.email);

      // ✅ CORREÇÃO: Espera cookie ser estabelecido (previne race condition)
      console.log("⏱️ Aguardando estabilização do cookie...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Valida que o cookie está funcionando
      try {
        const isValid = await authService.validateToken();

        if (!isValid) {
          console.warn("⚠️ Validação retornou false, tentando reload...");
          window.location.href = "/";
          return;
        }

        console.log("✅ Cookie validado com sucesso");
      } catch (validationError) {
        console.warn(
          "⚠️ Erro na validação, mas prosseguindo...",
          validationError
        );
        // Continua mesmo se validação falhar, pois o cookie pode estar ok
      }

      // Redireciona
      router.push("/");
      router.refresh();
    } catch (error) {
      const message = extractErrorMessage(error, "Erro ao fazer registro");
      console.error("❌ Erro no registro:", message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================================
  // LOGOUT
  // ===============================================

  /**
   * Faz logout removendo cookie e dados locais
   * ✅ MUDANÇA: Chama authService.logout() que limpa cookie no servidor
   */
  const logout = async () => {
    try {
      // Remove cookie no servidor e dados locais
      await authService.logout();

      setUser(null);

      console.log("🔓 Logout realizado");

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("❌ Erro ao fazer logout:", error);

      // Mesmo com erro, remove usuário localmente
      setUser(null);
      router.push("/login");
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
    localStorage.setItem(MOCK_TOKEN_KEY, "mock_token_active");
    console.log("🔷 Mock login ativado:", MOCK_USER);
    router.push("/");
    router.refresh();
  }, [router]);

  /**
   * Desativa login mockado
   */
  const mockLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(MOCK_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
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

export type { User };
