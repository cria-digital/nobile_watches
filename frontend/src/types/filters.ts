/**
 * src/types/filters.ts
 * Tipos e interfaces para gerenciamento de filtros
 */

/**
 * Estado completo dos filtros aplicados pelo usuário
 */
export interface AppliedFilters {
  // Faixa de preço (em centavos, ou reais conforme convenção do projeto)
  priceRange: {
    min: number;
    max: number;
  };

  // Seleções múltiplas
  brands: string[];
  models: string[];
  caseMaterials: string[];
  braceletMaterials: string[];
  dialColors: string[];
  movements: string[];
  conditions: string[];

  // Filtros adicionais
  verifiedSellersOnly: boolean;
  hasBoxOnly: boolean;
  hasDocumentsOnly: boolean;

  // Gênero/Tipo
  gender?: string[];
}

/**
 * Filtro como exibido para o usuário
 * Mantém track de qual e quantos filtros estão ativos
 */
export interface FilterSummary {
  activeCount: number;
  hasActiveFilters: boolean;
  summary: string[];
}

/**
 * Payload para aplicar filtros (enviado ao backend ou usado na filtragem mock)
 */
export interface FilterPayload {
  brandName: string; // Marca atual (da rota)
  filters: AppliedFilters;
  sortBy?: string;
  page?: number;
  limit?: number;
}

/**
 * Resposta do backend com produtos filtrados
 */
export interface FilteredProductsResponse {
  products: any[]; // Product[]
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  appliedFilters: AppliedFilters;
}
