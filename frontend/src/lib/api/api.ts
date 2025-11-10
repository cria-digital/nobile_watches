/**
 * ServiÃ§o de API para integraÃ§Ã£o com o backend Nobile
 * Gerencia chamadas HTTP e conversÃµes de dados
 */

import { ApiBrand, ApiError, ApiWatch } from "@/types/api";
import { Product } from "@/types/product";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

/**
 * Classe de erro personalizada para erros da API
 */
export class ApiServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "ApiServiceError";
  }
}

/**
 * Converte um Watch da API para o formato Product do frontend
 */
export function apiWatchToProduct(apiWatch: ApiWatch): Product {
  //@ts-ignore
  return {
    id: apiWatch.id,
    brand: apiWatch.brand,
    model: apiWatch.model,
    description: apiWatch.description || "",
    price: apiWatch.price,
    images: apiWatch.images.length > 0 ? apiWatch.images : ["/placeholder-watch.jpg"],
    referenceNumber: apiWatch.referenceNumber || "",
    //   verified: !!apiWatch.seller?.name,
    year: apiWatch.year,
    gender: apiWatch.gender as "Masculino" | "Feminino" | "Unissex" | undefined,
    // @ts-ignore
    condition: mapCondition(apiWatch.condition),
    hasBox: true, // API nÃ£o tem esse campo, assumir true por padrÃ£o
    hasDocuments: true, // API nÃ£o tem esse campo, assumir true por padrÃ£o
    // @ts-ignore
    movement: apiWatch.movement,
    caseMaterial: apiWatch.caseMaterial,
    caseDiameter: apiWatch.caseDiameter,
    waterResistance: apiWatch.waterResistance,
    glassType: apiWatch.glassType,
    dialColor: apiWatch.dialColor,
    braceletMaterial: apiWatch.braceletMaterial,
    braceletColor: apiWatch.braceletColor,
    sellerId: apiWatch.sellerId,
    createdAt: apiWatch.createdAt,
    updatedAt: apiWatch.updatedAt,
    seller: apiWatch.seller
      ? {
          name: apiWatch.seller.name,
          email: apiWatch.seller.email,
          id: apiWatch.seller.id,
        }
      : undefined,
  };
}

/**
 * Mapeia condiÃ§Ã£o da API para o formato do frontend
 */
function mapCondition(apiCondition: string): "Novo" | "Muito bom" | "Usado" | "Seminovo" {
  const conditionLower = apiCondition.toLowerCase();

  if (conditionLower.includes("novo")) return "Novo";
  if (conditionLower.includes("seminovo")) return "Seminovo";
  if (conditionLower.includes("muito bom") || conditionLower.includes("excelente"))
    return "Muito bom";
  return "Usado";
}

/**
 * ServiÃ§o principal da API
 */
export const apiService = {
  /**
   * Busca todos os relÃ³gios disponÃ­veis
   */
  async getWatches(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/watches`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Desabilitar cache para sempre pegar dados frescos
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: "Erro desconhecido",
        }));
        throw new ApiServiceError(
          errorData.error || "Erro ao buscar relÃ³gios",
          response.status
        );
      }

      const apiWatches: ApiWatch[] = await response.json();
      return apiWatches.map(apiWatchToProduct);
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw error;
      }

      // Erro de rede ou parsing
      throw new ApiServiceError("Erro de conexÃ£o com o servidor", undefined, error);
    }
  },

  /**
   * Busca relÃ³gio por ID
   */
  async getWatchById(id: number | string): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/watches/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: "Erro desconhecido",
        }));
        throw new ApiServiceError(
          errorData.error || "Erro ao buscar relÃ³gio",
          response.status
        );
      }

      const apiWatch: ApiWatch = await response.json();
      return apiWatchToProduct(apiWatch);
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw error;
      }

      throw new ApiServiceError("Erro de conexÃ£o com o servidor", undefined, error);
    }
  },

  /**
   * Busca relÃ³gios por marca
   */
  async getWatchesByBrand(brand: string): Promise<Product[]> {
    try {
      const watches = await this.getWatches();
      return watches.filter(watch => watch.brand.toLowerCase() === brand.toLowerCase());
    } catch (error) {
      throw error;
    }
  },

  /**
   * Busca marcas disponÃ­veis
   * Como a API nÃ£o tem endpoint especÃ­fico de marcas,
   * extraÃ­mos das marcas Ãºnicas dos relÃ³gios
   */
  async getBrands(): Promise<ApiBrand[]> {
    try {
      const watches = await this.getWatches();

      // Extrair marcas Ãºnicas
      const brandMap = new Map<string, { count: number }>();

      watches.forEach(watch => {
        const brandLower = watch.brand.toLowerCase();
        if (brandMap.has(brandLower)) {
          brandMap.get(brandLower)!.count++;
        } else {
          brandMap.set(brandLower, { count: 1 });
        }
      });

      // Converter para array de ApiBrand
      const brands: ApiBrand[] = Array.from(brandMap.entries()).map(([brand, data]) => ({
        name: watches.find(w => w.brand.toLowerCase() === brand)!.brand,
        slug: brand.replace(/\s+/g, "-"),
        watchCount: data.count,
      }));

      return brands.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw error;
      }

      throw new ApiServiceError("Erro ao buscar marcas", undefined, error);
    }
  },

  /**
   * Busca relÃ³gios em destaque
   * Retorna os 4 relÃ³gios mais recentes
   */
  async getFeaturedWatches(limit: number = 4): Promise<Product[]> {
    try {
      const watches = await this.getWatches();

      // Ordenar por data de criaÃ§Ã£o (mais recentes primeiro)
      const sortedWatches = watches.sort((a, b) => {
        // Se tiver createdAt no futuro quando implementado
        return 0; // Por enquanto mantÃ©m ordem da API
      });

      return sortedWatches.slice(0, limit);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Busca relógios por query
   * Filtra por marca, modelo, número de referência e descrição
   */
  async searchWatches(query: string, limit: number = 10): Promise<Product[]> {
    try {
      const watches = await this.getWatches();
      const queryLower = query.toLowerCase().trim();

      if (!queryLower) {
        return [];
      }

      // Filtrar relógios que correspondem à query
      const filteredWatches = watches.filter(watch => {
        const brandMatch = watch.brand.toLowerCase().includes(queryLower);
        const modelMatch = watch.model.toLowerCase().includes(queryLower);
        const referenceMatch = watch.referenceNumber?.toLowerCase().includes(queryLower);
        const descriptionMatch = watch.description?.toLowerCase().includes(queryLower);

        return brandMatch || modelMatch || referenceMatch || descriptionMatch;
      });

      // Ordenar por relevância (marca exata > modelo exato > contém)
      const sortedResults = filteredWatches.sort((a, b) => {
        const aBrandExact = a.brand.toLowerCase() === queryLower;
        const bBrandExact = b.brand.toLowerCase() === queryLower;
        const aModelExact = a.model.toLowerCase() === queryLower;
        const bModelExact = b.model.toLowerCase() === queryLower;

        if (aBrandExact && !bBrandExact) return -1;
        if (!aBrandExact && bBrandExact) return 1;
        if (aModelExact && !bModelExact) return -1;
        if (!aModelExact && bModelExact) return 1;

        return 0;
      });

      return sortedResults.slice(0, limit);
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw error;
      }

      throw new ApiServiceError("Erro ao buscar relógios", undefined, error);
    }
  },
};
