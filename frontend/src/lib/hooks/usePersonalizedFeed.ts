/**
 * Hook para Feed Personalizado de Recomendações
 * Integrado com a nova API de recomendações do backend
 *
 * ✅ CORREÇÃO: Agora respeita o modo mock e não faz requisições quando NEXT_PUBLIC_USE_MOCK_DATA=true
 */

import { useAuth } from "@/lib/context/AuthContext";
import { authService } from "@/lib/services/auth.service";
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

/**
 * Hook que busca feed personalizado de relógios
 *
 * Comportamento:
 * - **MODO MOCK (NEXT_PUBLIC_USE_MOCK_DATA=true)**: Não faz requisições, retorna array vazio
 * - **MODO REAL**:
 *   - Se usuário autenticado: recomendações baseadas na wishlist (isPersonalized: true)
 *   - Se não autenticado: relógios de marcas premium (isPersonalized: false)
 * - Cache automático com SWR
 * - Atualiza quando usuário faz login/logout
 *
 * @example
 * ```tsx
 * const { products, isPersonalized, isLoading } = usePersonalizedFeed({ limit: 12 });
 *
 * if (isLoading) return <LoadingSpinner />;
 *
 * return (
 *   <div>
 *     <h2>{isPersonalized ? 'Recomendado para você' : 'Em Destaque'}</h2>
 *     {products.map(product => <ProductCard key={product.id} product={product} />)}
 *   </div>
 * );
 * ```
 */
export function usePersonalizedFeed(
  options: UsePersonalizedFeedOptions = {}
): UsePersonalizedFeedResult {
  const { limit = 12, enableCache = true } = options;
  const { isAuthenticated } = useAuth();

  // Obtém o token do authService
  const token = authService.getToken();

  // 🔒 Verificar se está em modo mock
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  // Chave única para o cache do SWR
  // Muda quando usuário loga/desloga para forçar atualização
  // 🚫 Se estiver em modo mock, a chave é null para não fazer requisições
  const cacheKey = useMockData
    ? null
    : enableCache
      ? `recommendations-${isAuthenticated ? "auth" : "guest"}-${limit}`
      : null;

  // Fetcher para o SWR
  const fetcher = async () => {
    return await recommendationsService.getRecommendations(limit, token);
  };

  // Usar SWR para cache e revalidação automática
  const { data, error, isLoading, mutate } = useSWR(cacheKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // Cache por 1 minuto
    // Revalidar mais frequentemente para usuários não autenticados
    revalidateIfStale: !isAuthenticated,
    // Fallback em caso de erro ou modo mock
    fallbackData: {
      recommendations: [],
      isPersonalized: false,
      count: 0,
    },
  });

  return {
    products: data?.recommendations || [],
    isPersonalized: data?.isPersonalized || false,
    count: data?.count || 0,
    isLoading: useMockData ? false : isLoading, // Em modo mock, nunca está carregando
    isError: useMockData ? false : !!error, // Em modo mock, nunca há erro
    refresh: () => mutate(),
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
export function usePersonalizedFeedFresh(limit: number = 12): UsePersonalizedFeedResult {
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

  // Obtém o token do authService
  const token = authService.getToken();

  // 🔒 Verificar se está em modo mock
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  const fetcher = async () => {
    if (!token) {
      return { insights: null, message: "Não autenticado" };
    }
    return await recommendationsService.getUserInsights(token);
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
