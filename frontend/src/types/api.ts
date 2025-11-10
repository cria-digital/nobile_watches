/**
 * Tipos baseados na documentação da API do backend Nobile
 * Correspondem aos tipos retornados pelo backend em /api/watches
 */

export interface ApiWatch {
  id: number;
  brand: string;
  model: string;
  referenceNumber?: string;
  movement?: string;
  year?: number;
  condition: string;
  price: number;
  description?: string;
  images: string[];
  sellerId: number;
  createdAt: string;
  updatedAt: string;
  caseMaterial?: string;
  caseDiameter?: number;
  waterResistance?: string;
  glassType?: string;
  dialColor?: string;
  braceletMaterial?: string;
  braceletColor?: string;
  claspType?: string;
  gender?: string;
  seller?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ApiBrand {
  name: string;
  slug: string;
  logo?: string;
  watchCount?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}
