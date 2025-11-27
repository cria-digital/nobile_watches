/**
 * Serviço de Recomendações Personalizadas
 * Integração com API de recomendações do backend
 */

import { apiClient } from "@/lib/api/client";
import { Product } from "@/types/product";

/**
 * Resposta da API de recomendações
 */
interface RecommendationsResponse {
  recommendations: Product[];
  isPersonalized: boolean;
  count: number;
}

/**
 * Insights das preferências do usuário baseado na wishlist
 */
export interface UserInsights {
  totalWishlistItems: number;
  favoriteBrands: string[];
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
  preferredMaterials: string[];
  preferredMovements: string[];
  preferredColors: string[];
  mostCommonCondition: string;
  averageYear: number;
}

interface InsightsResponse {
  insights: UserInsights | null;
  message: string;
}

class RecommendationsService {
  /**
   * Busca recomendações personalizadas
   * - Se autenticado: retorna recomendações baseadas na wishlist do usuário
   * - Se não autenticado: retorna relógios de marcas premium
   *
   * @param limit - Número de recomendações (1-50, padrão 12)
   * @param token - Token de autenticação (opcional)
   * @returns Objeto com recommendations, isPersonalized e count
   */
  async getRecommendations(
    limit: number = 12,
    token?: string | null
  ): Promise<RecommendationsResponse> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await apiClient.get<RecommendationsResponse>("/recommendations", {
        params: { limit },
        headers,
      });

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar recomendações:", error);
      // Retornar fallback em caso de erro
      return {
        recommendations: [],
        isPersonalized: false,
        count: 0,
      };
    }
  }

  /**
   * Busca insights das preferências do usuário
   * Requer autenticação
   *
   * @param token - Token de autenticação (obrigatório)
   * @returns Insights baseados na wishlist ou null se não autenticado
   */
  async getUserInsights(token: string): Promise<InsightsResponse> {
    try {
      const response = await apiClient.get<InsightsResponse>(
        "/recommendations/insights",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Erro ao buscar insights:", error);

      // Se não autenticado (401), retornar resposta vazia
      if (error?.response?.status === 401) {
        return {
          insights: null,
          message: "Autenticação necessária",
        };
      }

      // Outros erros
      throw error;
    }
  }

  /**
   * Método legado para compatibilidade com código existente
   * @deprecated Use getRecommendations() diretamente
   */
  async getPersonalizedFeed(params: {
    limit?: number;
    userId?: number | null;
    excludeIds?: number[];
  }): Promise<Product[]> {
    const { limit = 4 } = params;

    try {
      const response = await this.getRecommendations(limit);
      return response.recommendations;
    } catch (error) {
      console.error("Erro ao buscar feed personalizado:", error);
      return [];
    }
  }
}

// Exporta instância única
export const recommendationsService = new RecommendationsService();
