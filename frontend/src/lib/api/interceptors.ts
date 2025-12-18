/**
 * Interceptors reutilizáveis para o cliente Axios
 * Centralizamos aqui toda a lógica de interceptação de requisições e respostas
 */

import type { AxiosError, AxiosInstance } from "axios";
import type { ApiErrorResponse, InterceptorOptions } from "./types";

const USER_STORAGE_KEY = "nobile_user";
const MOCK_TOKEN_KEY = "mock_auth_token";

/**
 * Remove dados de autenticação do localStorage
 */
function clearAuthData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(MOCK_TOKEN_KEY);
}

/**
 * Interceptor de erro de requisição
 */
export function requestErrorInterceptor(error: unknown) {
  return Promise.reject(error);
}

/**
 * Interceptor de resposta de sucesso (passa direto)
 */
export function responseSuccessInterceptor<T>(response: T) {
  return response;
}

/**
 * Interceptor de erro de resposta com tratamento de 401
 */
export function responseErrorInterceptor(
  error: AxiosError<ApiErrorResponse>,
  options: InterceptorOptions = {}
) {
  const { enable401Redirect = true, redirectUrl = "/login" } = options;

  // Tratamento de erro 401 (Unauthorized)
  if (error.response?.status === 401 && enable401Redirect) {
    clearAuthData();

    if (typeof window !== "undefined") {
      if (!window.location.pathname.includes("/login")) {
        console.log("🔒 401 detectado: redirecionando para /login");

        // ✅ ADICIONAR estas linhas:
        fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        }).catch((err) => console.error("Erro ao limpar cookie:", err));

        const currentPath = window.location.pathname;
        window.location.href = `${redirectUrl}?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
  }
  return Promise.reject(error);
}

/**
 * Configura todos os interceptors no cliente Axios
 */
export function setupInterceptors(
  axiosInstance: AxiosInstance,
  options: InterceptorOptions = {}
): void {
  const { enable401Redirect = true, redirectUrl = "/login" } = options;

  axiosInstance.interceptors.request.clear();
  axiosInstance.interceptors.response.clear();

  // Request interceptors - apenas tratamento de erro
  axiosInstance.interceptors.request.use(
    (config) => config, // ✅ Passa direto, cookies são automáticos
    requestErrorInterceptor
  );

  // Response interceptors
  axiosInstance.interceptors.response.use(responseSuccessInterceptor, (error) =>
    responseErrorInterceptor(error, { enable401Redirect, redirectUrl })
  );
}

/**
 * Utilitário para extrair mensagem de erro da resposta da API
 */
export function extractErrorMessage(
  error: unknown,
  defaultMessage = "Erro desconhecido"
): string {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return (
      axiosError.response?.data?.error ||
      axiosError.response?.data?.message ||
      defaultMessage
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
}
