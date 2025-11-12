/**
 * Hooks SWR customizados para integração com a API
 * Incluem fallback automático para dados mock quando a API não está disponível
 */

import { mockProducts } from "@/lib/data/mockProducts";
import { Product } from "@/types/product";
import useSWR, { SWRConfiguration } from "swr";

import { ApiBrand } from "@/types/api";
import { apiService, ApiServiceError } from "../services/api.service";

/**
 * Verifica se o modo mock está ativo via variável de ambiente
 */
const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" ||
  (typeof window !== "undefined" && localStorage.getItem("nobile_use_mock") === "true");

/**
 * Configuração padrão do SWR
 */
const defaultSWRConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  shouldRetryOnError: true,
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Não retentar se for erro 404
    if (error instanceof ApiServiceError && error.statusCode === 404) {
      return;
    }

    // Não retentar mais de 3 vezes
    if (retryCount >= 3) return;

    // Retry após 5 segundos
    setTimeout(() => revalidate({ retryCount }), 5000);
  },
};

/**
 * Hook para buscar todos os relógios
 */
export function useWatches() {
  const { data, error, isLoading, mutate } = useSWR<Product[], Error>(
    USE_MOCK_DATA ? null : "/api/watches",
    async () => {
      if (USE_MOCK_DATA) {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockProducts;
      }

      try {
        return await apiService.getWatches();
      } catch (err) {
        console.warn("Erro ao buscar relógios da API, usando dados mock:", err);
        // Fallback para dados mock em caso de erro
        return mockProducts;
      }
    },
    {
      ...defaultSWRConfig,
      fallbackData: mockProducts,
    }
  );

  return {
    watches: data || mockProducts,
    isLoading,
    error,
    refetch: mutate,
  };
}

/**
 * Hook para buscar relógios de uma marca específica
 */
export function useWatchesByBrand(brand: string) {
  const { data, error, isLoading, mutate } = useSWR<Product[], Error>(
    USE_MOCK_DATA ? null : `/api/watches/brand/${brand}`,
    async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockProducts.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
      }

      try {
        return await apiService.getWatchesByBrand(brand);
      } catch (err) {
        console.warn(
          `Erro ao buscar relógios da marca ${brand}, usando dados mock:`,
          err
        );
        return mockProducts.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
      }
    },
    {
      ...defaultSWRConfig,
      fallbackData: mockProducts.filter(
        p => p.brand.toLowerCase() === brand.toLowerCase()
      ),
    }
  );

  return {
    watches: data || [],
    isLoading,
    error,
    refetch: mutate,
  };
}

/**
 * Hook para buscar marcas disponíveis
 */
export function useBrands() {
  const { data, error, isLoading, mutate } = useSWR<ApiBrand[], Error>(
    USE_MOCK_DATA ? null : "/api/brands",
    async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));

        // Extrair marcas únicas dos produtos mock
        const uniqueBrands = Array.from(new Set(mockProducts.map(p => p.brand)));

        return uniqueBrands.map(brand => ({
          name: brand,
          slug: brand.toLowerCase().replace(/\s+/g, "-"),
          watchCount: mockProducts.filter(p => p.brand === brand).length,
        }));
      }

      try {
        return await apiService.getBrands();
      } catch (err) {
        console.warn("Erro ao buscar marcas da API, usando dados mock:", err);

        // Fallback para extrair marcas dos produtos mock
        const uniqueBrands = Array.from(new Set(mockProducts.map(p => p.brand)));

        return uniqueBrands.map(brand => ({
          name: brand,
          slug: brand.toLowerCase().replace(/\s+/g, "-"),
          watchCount: mockProducts.filter(p => p.brand === brand).length,
        }));
      }
    },
    defaultSWRConfig
  );

  return {
    brands: data || [],
    isLoading,
    error,
    refetch: mutate,
  };
}

/**
 * Hook para buscar relógios em destaque
 */
export function useFeaturedWatches(limit: number = 4) {
  const { data, error, isLoading, mutate } = useSWR<Product[], Error>(
    USE_MOCK_DATA ? null : `/api/watches/featured?limit=${limit}`,
    async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockProducts.slice(0, limit);
      }

      try {
        return await apiService.getFeaturedWatches(limit);
      } catch (err) {
        console.warn("Erro ao buscar relógios em destaque, usando dados mock:", err);
        return mockProducts.slice(0, limit);
      }
    },
    {
      ...defaultSWRConfig,
      fallbackData: mockProducts.slice(0, limit),
    }
  );

  return {
    featuredWatches: data || mockProducts.slice(0, limit),
    isLoading,
    error,
    refetch: mutate,
  };
}

/**
 * Hook para buscar um relógio específico por ID
 */
export function useWatch(id: string | number) {
  const { data, error, isLoading, mutate } = useSWR<Product, Error>(
    USE_MOCK_DATA ? null : `/api/watches/${id}`,
    async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const product = mockProducts.find(p => p.id === id.toString());
        if (!product) {
          throw new Error("Produto não encontrado");
        }
        return product;
      }

      try {
        return await apiService.getWatchById(id);
      } catch (err) {
        console.warn(`Erro ao buscar relógio ${id}, usando dados mock:`, err);
        const product = mockProducts.find(p => p.id === id.toString());
        if (!product) {
          throw new Error("Produto não encontrado");
        }
        return product;
      }
    },
    defaultSWRConfig
  );

  return {
    watch: data,
    isLoading,
    error,
    refetch: mutate,
  };
}

/**
 * Utilitário para alternar entre modo mock e API
 * (útil para desenvolvimento)
 */
export function toggleMockMode(useMock: boolean) {
  if (typeof window !== "undefined") {
    localStorage.setItem("nobile_use_mock", useMock.toString());
    window.location.reload();
  }
}

/**
 * Verifica se o modo mock está ativo
 */
export function isMockMode(): boolean {
  return USE_MOCK_DATA;
}
