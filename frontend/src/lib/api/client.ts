/**
 * Cliente Axios centralizado
 * Esta é a ÚNICA instância do Axios que deve ser usada em toda a aplicação
 *
 * Benefícios:
 * - Configuração centralizada
 * - Interceptors reutilizáveis
 * - Fácil manutenção
 * - Type-safe
 * - Consistência em toda a aplicação
 */

import axios, { type AxiosInstance } from "axios";
import { setupInterceptors } from "./interceptors";
import type { ApiConfig, InterceptorOptions } from "./types";

/**
 * Configuração padrão da API
 */
const DEFAULT_CONFIG: ApiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  timeout: 10000,
  withCredentials: false,
};

/**
 * Headers padrão para todas as requisições
 */
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

/**
 * Cria uma instância configurada do Axios
 */
function createApiClient(
  config: Partial<ApiConfig> = {},
  interceptorOptions: InterceptorOptions = {}
): AxiosInstance {
  const instance = axios.create({
    ...DEFAULT_CONFIG,
    ...config,
    headers: {
      ...DEFAULT_HEADERS,
      ...config,
    },
  });

  // Configura interceptors
  setupInterceptors(instance, interceptorOptions);

  return instance;
}

/**
 * Instância principal da API
 * Use esta instância para todas as chamadas à API do backend
 */
export const apiClient = createApiClient(
  {
    baseURL: DEFAULT_CONFIG.baseURL,
    timeout: DEFAULT_CONFIG.timeout,
  },
  {
    enableAuth: true,
    enable401Redirect: true,
    redirectUrl: "/login",
  }
);

/**
 * Instância alternativa sem autenticação automática
 * Use para endpoints públicos que não requerem token
 */
export const publicApiClient = createApiClient(
  {
    baseURL: DEFAULT_CONFIG.baseURL,
    timeout: DEFAULT_CONFIG.timeout,
  },
  {
    enableAuth: false,
    enable401Redirect: false,
  }
);

/**
 * Factory para criar instâncias customizadas quando necessário
 * Exemplo: integração com API externa que usa baseURL diferente
 */
export function createCustomApiClient(
  config: Partial<ApiConfig>,
  interceptorOptions?: InterceptorOptions
): AxiosInstance {
  return createApiClient(config, interceptorOptions);
}

/**
 * Exporta o tipo AxiosInstance para type-safety
 */
export type { AxiosInstance } from "axios";

/**
 * Re-exporta axios para casos especiais onde é necessário usar diretamente
 * (ex: axios.isAxiosError)
 */
export { axios };
