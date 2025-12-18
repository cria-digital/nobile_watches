// frontend/src/lib/api/client.ts

/**
 * Cliente Axios centralizado - VERSÃO PARA PRODUÇÃO VERCEL
 *
 * ✅ MUDANÇAS PARA PRODUÇÃO:
 * - baseURL aponta para /api (API Routes do Next.js)
 * - API Routes fazem proxy para o backend
 * - Cookies funcionam porque são same-origin
 * - withCredentials: true garante envio de cookies
 *
 * ✅ FLUXO:
 * Browser → /api/wishlist → API Route → Backend Render
 *         ✅ Cookie enviado
 */

import axios, { type AxiosInstance } from "axios";
import { setupInterceptors } from "./interceptors";
import type { ApiConfig, InterceptorOptions } from "./types";

/**
 * Configuração padrão da API
 *
 * ✅ PRODUÇÃO: baseURL = /api (API Routes)
 * ✅ DESENVOLVIMENTO: baseURL = http://localhost:8000/api (direto ao backend)
 */
const DEFAULT_CONFIG: ApiConfig = {
  // Em produção usa /api (API Routes), em dev usa backend direto
  baseURL:
    process.env.NODE_ENV === "production"
      ? "/api" // ✅ Usa API Routes como proxy
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  timeout: 30000, // 30 segundos (aumentado para cold starts)
  withCredentials: true, // ✅ CRÍTICO: Envia cookies
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
      ...config.headers,
    },
  });

  // Configura interceptors
  setupInterceptors(instance, interceptorOptions);

  return instance;
}

/**
 * Instância principal da API
 *
 * ✅ PRODUÇÃO: Requisições vão para /api → API Routes → Backend
 * ✅ DESENVOLVIMENTO: Requisições vão direto para backend
 *
 * @example
 * // Código continua o mesmo:
 * apiClient.get('/wishlist/check/18')
 *
 * // Mas o caminho muda:
 * // PROD: GET /api/wishlist/check/18 → API Route → Backend
 * // DEV:  GET http://localhost:8000/api/wishlist/check/18
 */
export const apiClient = createApiClient(
  {
    baseURL:
      process.env.NODE_ENV === "production"
        ? "/api"
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
    timeout: 30000,
    withCredentials: true, // ✅ Envia cookies
  },
  {
    enableAuth: false, // ✅ Não precisa (API Route envia cookie)
    enable401Redirect: true, // ✅ Redireciona em 401
    redirectUrl: "/login",
  }
);

/**
 * Instância alternativa para endpoints públicos
 */
export const publicApiClient = createApiClient(
  {
    baseURL:
      process.env.NODE_ENV === "production"
        ? "/api"
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
    timeout: 30000,
    withCredentials: false, // ✅ Público não precisa cookies
  },
  {
    enableAuth: false,
    enable401Redirect: false,
  }
);

/**
 * Factory para criar instâncias customizadas
 */
export function createCustomApiClient(
  config: Partial<ApiConfig>,
  interceptorOptions?: InterceptorOptions
): AxiosInstance {
  return createApiClient(config, interceptorOptions);
}

export type { AxiosInstance } from "axios";
export { axios };

/**
 * FLUXO COMPLETO - PRODUÇÃO VERCEL:
 *
 * 1. LOGIN:
 *    Browser: fetch('/api/auth/login')
 *    ↓
 *    API Route: Chama backend Render
 *    ↓
 *    Backend: Valida e retorna token
 *    ↓
 *    API Route: Define cookie no domínio Vercel
 *    ↓
 *    Browser: Cookie salvo ✅
 *
 * 2. REQUISIÇÃO AUTENTICADA:
 *    Browser: apiClient.get('/wishlist')
 *    ↓
 *    Axios: GET /api/wishlist (mesmo domínio!)
 *           Cookie: token=eyJhbG... ✅
 *    ↓
 *    API Route /api/[...path]:
 *      - Lê cookie
 *      - Adiciona como header
 *      - Chama https://nobile-deploy.onrender.com/api/wishlist
 *    ↓
 *    Backend: Valida token e retorna dados
 *    ↓
 *    API Route: Retorna dados para browser
 *    ↓
 *    Browser: Recebe dados ✅
 *
 * 3. ERRO 401:
 *    Backend: Token inválido → 401
 *    ↓
 *    API Route: Repassa 401
 *    ↓
 *    Interceptor: Detecta 401
 *    ↓
 *    Interceptor: Limpa cookie e redireciona
 */
