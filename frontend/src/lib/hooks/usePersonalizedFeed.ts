import { useAuth } from "@/lib/context/AuthContext";
import { recommendationsService } from "@/lib/services/recommendations.service";
import { Product } from "@/types/product";
import useSWR from "swr";

interface UsePersonalizedFeedOptions {
  limit?: number;
  enableCache?: boolean;
}

interface UsePersonalizedFeedResult {
  products: Product[];
  isPersonalized: boolean;
  count: number;
  isLoading: boolean;
  isError: boolean;
  refresh: () => void;
}

export function usePersonalizedFeed(
  options: UsePersonalizedFeedOptions = {}
): UsePersonalizedFeedResult {
  const { limit = 12, enableCache = true } = options;
  const { isAuthenticated } = useAuth();

  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  const cacheKey = useMockData
    ? null
    : enableCache
      ? `recommendations-${isAuthenticated ? "auth" : "guest"}-${limit}`
      : null;

  // Fetcher para o SWR
  const fetcher = async () => {
    const response = await recommendationsService.getRecommendations(limit);
    return response;
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    cacheKey,
    fetcher,
    {
      keepPreviousData: true,

      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      // Cache por 5 minutos
      dedupingInterval: 300000,

      // Retry apenas em erros de rede (não em 401, 404, etc)
      shouldRetryOnError: (error) => {
        const status = error?.response?.status;
        return !status || status >= 500;
      },

      // Sem fallbackData - deixa o SWR gerenciar o estado
      onError: (err) => {
        console.error(
          "❌ [usePersonalizedFeed] Erro ao buscar recomendações:",
          err
        );
      },

      // onSuccess: (data) => {
      //   console.log("✅ [usePersonalizedFeed] Dados carregados com sucesso:", {
      //     count: data?.count || 0,
      //     isPersonalized: data?.isPersonalized || false,
      //     hasRecommendations: (data?.recommendations?.length || 0) > 0,
      //   });
      // },
    }
  );

  const products = useMockData ? [] : data?.recommendations || [];

  const isPersonalized = data?.isPersonalized || false;
  const count = data?.count || 0;

  return {
    products,
    isPersonalized,
    count,
    isLoading: useMockData ? false : isLoading,
    isError: useMockData ? false : !!error,
    refresh: () => {
      console.log("🔄 [usePersonalizedFeed] Refresh manual disparado");
      mutate();
    },
  };
}

/**
 * Hook variante que sempre busca dados frescos (sem cache)
 * Útil para componentes que precisam de dados sempre atualizados
 *
 * ⚠️ Em modo mock, se comporta igual ao hook principal (não faz requisições)
 *
 * @example
 * ```tsx
 * const { products, isPersonalized, refresh } = usePersonalizedFeedFresh(8);
 * ```
 */
export function usePersonalizedFeedFresh(
  limit: number = 12
): UsePersonalizedFeedResult {
  return usePersonalizedFeed({ limit, enableCache: false });
}

/**
 * Hook para buscar insights das preferências do usuário
 * Requer autenticação
 *
 * ⚠️ Em modo mock, retorna null e não faz requisições
 *
 * @example
 * ```tsx
 * const { insights, isLoading } = useUserInsights();
 *
 * if (!insights) return null;
 *
 * return (
 *   <div>
 *     <h3>Suas preferências:</h3>
 *     <p>Marcas favoritas: {insights.favoriteBrands.join(', ')}</p>
 *     <p>Faixa de preço: R$ {insights.priceRange.min} - R$ {insights.priceRange.max}</p>
 *   </div>
 * );
 * ```
 */
export function useUserInsights() {
  const { isAuthenticated } = useAuth();

  // 🔒 Verificar se está em modo mock
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  // Fetcher para o SWR
  // ✅ Não passa token - cookies são enviados automaticamente
  const fetcher = async () => {
    if (!isAuthenticated) {
      return { insights: null, message: "Não autenticado" };
    }
    return await recommendationsService.getUserInsights();
  };

  const { data, error, isLoading, mutate } = useSWR(
    // 🚫 Se estiver em modo mock, não faz requisição
    useMockData ? null : isAuthenticated ? "user-insights" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 120000, // Cache por 2 minutos
    }
  );

  return {
    insights: data?.insights || null,
    message: data?.message || "",
    isLoading: useMockData ? false : isLoading,
    isError: useMockData ? false : !!error,
    refresh: () => mutate(),
  };
}
