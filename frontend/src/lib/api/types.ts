/**
 * Tipos compartilhados para integração com a API
 */

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  withCredentials?: boolean;
}

/**
 * Opções para configuração de interceptors
 */
export interface InterceptorOptions {
  enableAuth?: boolean;
  enable401Redirect?: boolean;
  redirectUrl?: string;
}
