/**
 * Interceptors reutilizáveis para o cliente Axios
 * Centralizamos aqui toda a lógica de interceptação de requisições e respostas
 */

import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { ApiErrorResponse, InterceptorOptions } from "./types";

/**
 * Token storage key - centralizando para evitar inconsistências
 */
const TOKEN_STORAGE_KEY = "token";
const USER_STORAGE_KEY = "nobile_user";

/**
 * Obtém o token de autenticação do localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Remove dados de autenticação do localStorage
 */
function clearAuthData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem("mock_auth_token");
}

/**
 * Interceptor de requisição que adiciona o token JWT automaticamente
 */
export function requestAuthInterceptor(config: InternalAxiosRequestConfig) {
  const token = getAuthToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
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

    // Redireciona apenas se estiver no browser
    if (typeof window !== "undefined") {
      // Evita redirecionar se já estiver na página de login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = redirectUrl;
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
  const { enableAuth = true, enable401Redirect = true, redirectUrl = "/login" } = options;

  // Limpa interceptors existentes (caso seja reconfiguração)
  axiosInstance.interceptors.request.clear();
  axiosInstance.interceptors.response.clear();

  // Request interceptors
  if (enableAuth) {
    axiosInstance.interceptors.request.use(
      requestAuthInterceptor,
      requestErrorInterceptor
    );
  }

  // Response interceptors
  axiosInstance.interceptors.response.use(responseSuccessInterceptor, error =>
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
