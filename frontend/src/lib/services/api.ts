/**
 * Serviço de API para integração com o backend Nobile
 * Gerencia chamadas HTTP e conversões de dados
 */

import { ApiBrand, ApiError, ApiWatch } from "@/types/api";
import { Product } from "@/types/mock";

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
  return {
    id: apiWatch.id.toString(),
    brand: apiWatch.brand,
    model: apiWatch.model,
    description: apiWatch.description || "",
    price: apiWatch.price,
    images: apiWatch.images.length > 0 ? apiWatch.images : ["/placeholder-watch.jpg"],
    reference: apiWatch.referenceNumber || "",
    verified: !!apiWatch.seller?.name,
    year: apiWatch.year,
    gender: apiWatch.gender as "Masculino" | "Feminino" | "Unissex" | undefined,
    // @ts-ignore
    condition: mapCondition(apiWatch.condition),
    hasBox: true, // API não tem esse campo, assumir true por padrão
    hasDocuments: true, // API não tem esse campo, assumir true por padrão
    adCode: `AD${apiWatch.id}`,
    // @ts-ignore
    movement: apiWatch.movement,
    caliber: "", // API não tem esse campo
    powerReserve: undefined,
    caseMaterial: apiWatch.caseMaterial,
    diameter: apiWatch.caseDiameter,
    waterResistance: apiWatch.waterResistance,
    crystal: apiWatch.glassType,
    dialColor: apiWatch.dialColor,
    braceletMaterial: apiWatch.braceletMaterial,
    strapColor: apiWatch.braceletColor,
    availability: "Disponível",
    seller: apiWatch.seller
      ? {
          name: apiWatch.seller.name,
          verified: true,
        }
      : undefined,
  };
}

/**
 * Mapeia condição da API para o formato do frontend
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
 * Serviço principal da API
 */
export const apiService = {
  /**
   * Busca todos os relógios disponíveis
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
          errorData.error || "Erro ao buscar relógios",
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
      throw new ApiServiceError("Erro de conexão com o servidor", undefined, error);
    }
  },

  /**
   * Busca relógio por ID
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
          errorData.error || "Erro ao buscar relógio",
          response.status
        );
      }

      const apiWatch: ApiWatch = await response.json();
      return apiWatchToProduct(apiWatch);
    } catch (error) {
      if (error instanceof ApiServiceError) {
        throw error;
      }

      throw new ApiServiceError("Erro de conexão com o servidor", undefined, error);
    }
  },

  /**
   * Busca relógios por marca
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
   * Busca marcas disponíveis
   * Como a API não tem endpoint específico de marcas,
   * extraímos das marcas únicas dos relógios
   */
  async getBrands(): Promise<ApiBrand[]> {
    try {
      const watches = await this.getWatches();

      // Extrair marcas únicas
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
   * Busca relógios em destaque
   * Retorna os 4 relógios mais recentes
   */
  async getFeaturedWatches(limit: number = 4): Promise<Product[]> {
    try {
      const watches = await this.getWatches();

      // Ordenar por data de criação (mais recentes primeiro)
      const sortedWatches = watches.sort((a, b) => {
        // Se tiver createdAt no futuro quando implementado
        return 0; // Por enquanto mantém ordem da API
      });

      return sortedWatches.slice(0, limit);
    } catch (error) {
      throw error;
    }
  },
};
