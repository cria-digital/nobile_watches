import { mockProducts } from "@/lib/data/mockProducts";
import nobileService from "@/lib/services/nobile.service";
import { Product } from "@/types/product";
import useSWR from "swr";

const USE_API = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "true";

interface UseFeaturedWatchesOptions {
  limit?: number;
}

interface UseFeaturedWatchesResult {
  watches: Product[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Hook para buscar relógios em destaque
 * Busca os relógios mais recentes e disponíveis para a homepage
 */
export function useFeaturedWatches({
  limit = 5,
}: UseFeaturedWatchesOptions = {}): UseFeaturedWatchesResult {
  const swrKey = USE_API ? `/api/watches/featured?limit=${limit}` : null;

  const { data, error, isLoading } = useSWR(
    swrKey,
    async () => {
      console.log("🔍 Buscando relógios em destaque da API");

      // Busca relógios usando o endpoint de busca avançada
      // Ordena por mais recentes e pega apenas os disponíveis
      const result = await nobileService.searchWatchesAdvanced({
        limit,
        sortBy: "publishedAt",
        order: "desc",
      });

      const watches = result.watches;

      console.log(`✅ ${watches.length} relógios em destaque encontrados`);

      return watches;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // Cache de 30 segundos
    }
  );

  // Fallback para dados mock quando API não está disponível
  if (!USE_API) {
    console.log("📊 Usando dados mock para relógios em destaque");

    // Seleciona os primeiros N relógios do mock
    const mockWatches = mockProducts.slice(0, limit);

    return {
      watches: mockWatches,
      isLoading: false,
      isError: false,
      error: null,
    };
  }

  return {
    watches: data || [],
    isLoading,
    isError: !!error,
    error: error || null,
  };
}
