/**
 * Hook para Feed Personalizado de Recomendações
 * Integrado com a nova API de recomendações do backend
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
 * - Se usuário autenticado: recomendações baseadas na wishlist (isPersonalized: true)
 * - Se não autenticado: relógios de marcas premium (isPersonalized: false)
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

  // Chave única para o cache do SWR
  // Muda quando usuário loga/desloga para forçar atualização
  const cacheKey = `recommendations-${isAuthenticated ? "auth" : "guest"}-${limit}`;

  // Fetcher para o SWR
  const fetcher = async () => {
    return await recommendationsService.getRecommendations(limit, token);
  };

  // Usar SWR para cache e revalidação automática
  const { data, error, isLoading, mutate } = useSWR(
    enableCache ? cacheKey : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache por 1 minuto
      // Revalidar mais frequentemente para usuários não autenticados
      revalidateIfStale: !isAuthenticated,
      // Fallback em caso de erro
      fallbackData: {
        recommendations: [],
        isPersonalized: false,
        count: 0,
      },
    }
  );

  return {
    products: data?.recommendations || [],
    isPersonalized: data?.isPersonalized || false,
    count: data?.count || 0,
    isLoading,
    isError: !!error,
    refresh: () => mutate(),
  };
}

/**
 * Hook variante que sempre busca dados frescos (sem cache)
 * Útil para componentes que precisam de dados sempre atualizados
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

  const fetcher = async () => {
    if (!token) {
      return { insights: null, message: "Não autenticado" };
    }
    return await recommendationsService.getUserInsights(token);
  };

  const { data, error, isLoading, mutate } = useSWR(
    isAuthenticated ? "user-insights" : null,
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
    isLoading,
    isError: !!error,
    refresh: () => mutate(),
  };
}
