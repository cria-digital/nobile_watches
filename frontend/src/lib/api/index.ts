/**
 * Exportação centralizada da API
 *
 * Import único para todos os services:
 * import { apiClient, extractErrorMessage } from "@/lib/api"
 */

// Cliente principal
export {
  apiClient,
  axios,
  createCustomApiClient,
  publicApiClient,
} from "./client";
export type { AxiosInstance } from "./client";

// Interceptors e utilitários
export {
  extractErrorMessage,
  requestErrorInterceptor,
  responseErrorInterceptor,
  responseSuccessInterceptor,
  setupInterceptors,
} from "./interceptors";

// Tipos
export type { ApiConfig, ApiErrorResponse, InterceptorOptions } from "./types";
