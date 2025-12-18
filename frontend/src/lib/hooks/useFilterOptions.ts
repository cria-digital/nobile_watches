/**
 * Hook para buscar opções de filtros da API
 *
 * Este hook busca os filtros disponíveis do endpoint /search/filters
 * e os mantém em cache com SWR
 *
 * ✅ Suporta modo mock para desenvolvimento
 */

import { SearchFilterOptions } from "@/types/nobile";
import useSWR from "swr";
import nobileService from "../services/nobile.service";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

interface UseFilterOptionsResult {
  filterOptions: SearchFilterOptions | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Dados mockados de opções de filtros para desenvolvimento
 * ⚠️ Deve corresponder exatamente à interface SearchFilterOptions
 */
const mockFilterOptions: SearchFilterOptions = {
  brands: [
    "Rolex",
    "Patek Philippe",
    "Audemars Piguet",
    "Omega",
    "IWC",
    "Cartier",
    "Breitling",
    "Tag Heuer",
    "Hublot",
    "Vacheron Constantin",
  ],
  conditions: [
    "Novo",
    "Seminovo - excelente estado",
    "Seminovo - bom estado",
    "Usado",
  ],
  caseMaterials: [
    "Ouro amarelo",
    "Ouro rosa",
    "Ouro branco",
    "Platina",
    "Aço inoxidável",
    "Titânio",
    "Cerâmica",
    "Bronze",
  ],
  braceletMaterials: [
    "Ouro amarelo",
    "Ouro rosa",
    "Ouro branco",
    "Aço inoxidável",
    "Titânio",
    "Couro",
    "Borracha",
    "Tecido",
  ],
  dialColors: [
    "Preto",
    "Branco",
    "Azul",
    "Verde",
    "Cinza",
    "Marrom",
    "Dourado",
    "Prata",
    "Laranja",
    "Vermelho",
  ],
  movements: ["Automático", "Corda manual", "Quartzo"],
  genders: ["Masculino", "Feminino", "Unissex"],
  priceRange: {
    min: 0,
    max: 500000,
  },
  yearRange: {
    min: 1950,
    max: 2024,
  },
  diameterRange: {
    min: 20,
    max: 50,
  },
};

/**
 * Hook para buscar as opções de filtros disponíveis
 *
 * @returns {UseFilterOptionsResult} Objeto com os filtros e estados de loading/erro
 *
 * @example
 * const { filterOptions, isLoading, isError } = useFilterOptions();
 */
export function useFilterOptions(): UseFilterOptionsResult {
  // ===================================
  // MODO MOCK
  // ===================================
  // Se estiver em modo mock, retorna dados mockados diretamente
  if (USE_MOCK_DATA) {
    return {
      filterOptions: mockFilterOptions,
      isLoading: false,
      isError: false,
      error: null,
    };
  }

  // ===================================
  // MODO API
  // ===================================
  // Busca opções de filtros da API real
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
