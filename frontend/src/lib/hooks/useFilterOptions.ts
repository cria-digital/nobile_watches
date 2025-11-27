/**
 * Hook para buscar opções de filtros da API
 *
 * Este hook busca os filtros disponíveis do endpoint /search/filters
 * e os mantém em cache com SWR
 */

import { SearchFilterOptions } from "@/types/nobile";
import useSWR from "swr";
import nobileService from "../services/nobile.service";

interface UseFilterOptionsResult {
  filterOptions: SearchFilterOptions | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Hook para buscar as opções de filtros disponíveis
 *
 * @returns {UseFilterOptionsResult} Objeto com os filtros e estados de loading/erro
 *
 * @example
 * const { filterOptions, isLoading, isError } = useFilterOptions();
 */
export function useFilterOptions(): UseFilterOptionsResult {
  const { data, error, isLoading } = useSWR<SearchFilterOptions>(
    "/search/filters",
    () => nobileService.getFilterOptions(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      // Cache por 5 minutos
      dedupingInterval: 300000,
      // Não revalidar automaticamente
      refreshInterval: 0,
    }
  );

  return {
    filterOptions: data || null,
    isLoading,
    isError: !!error,
    error: error || null,
  };
}
