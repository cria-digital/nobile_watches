/**
 * src/lib/hooks/useSearch.ts
 * Hook para busca de relógios com suporte a API e Mock
 */

import { apiService } from "@/lib/api/api";
import { mockProducts } from "@/lib/data/mockProducts";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";

// Flag para alternar entre mock e API real
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

interface UseSearchOptions {
  query: string;
  limit?: number;
  debounceMs?: number;
  minChars?: number;
}

interface UseSearchResult {
  results: Product[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Hook para busca de relógios
 * Suporta modo API e mock com debounce
 */
export function useSearch({
  query,
  limit = 10,
  debounceMs = 300,
  minChars = 2,
}: UseSearchOptions): UseSearchResult {
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Resetar resultados se query for muito curta
    if (query.trim().length < minChars) {
      setResults([]);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      return;
    }

    // Debounce da busca
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        let searchResults: Product[];

        if (USE_MOCK_DATA) {
          // Busca em dados mock
          searchResults = searchMockProducts(query, limit);
        } else {
          // Busca via API com fallback para mock
          try {
            searchResults = await apiService.searchWatches(query, limit);
          } catch (apiError) {
            console.warn("Erro na API, usando dados mock:", apiError);
            searchResults = searchMockProducts(query, limit);
          }
        }

        setResults(searchResults);
      } catch (err) {
        console.error("Erro ao buscar relógios:", err);
        setIsError(true);
        setError(err instanceof Error ? err : new Error("Erro desconhecido"));
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, limit, debounceMs, minChars]);

  return {
    results,
    isLoading,
    isError,
    error,
  };
}

/**
 * Busca em produtos mock
 * Mantém a mesma lógica da busca na API
 */
function searchMockProducts(query: string, limit: number): Product[] {
  const queryLower = query.toLowerCase().trim();

  if (!queryLower) {
    return [];
  }

  // Filtrar produtos que correspondem à query
  const filteredProducts = mockProducts.filter(product => {
    const brandMatch = product.brand.toLowerCase().includes(queryLower);
    const modelMatch = product.model.toLowerCase().includes(queryLower);
    const referenceMatch = product.referenceNumber?.toLowerCase().includes(queryLower);
    const descriptionMatch = product.description?.toLowerCase().includes(queryLower);

    return brandMatch || modelMatch || referenceMatch || descriptionMatch;
  });

  // Ordenar por relevância (marca exata > modelo exato > contém)
  const sortedResults = filteredProducts.sort((a, b) => {
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
}
