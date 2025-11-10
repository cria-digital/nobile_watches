/**
 * src/lib/hooks/useProductFilters.ts
 * Hook para gerenciar estado e lÃ³gica de filtros de produtos
 */

import { AppliedFilters, FilterSummary } from "@/types/filters";
import { useCallback, useMemo, useState } from "react";

const INITIAL_FILTERS: AppliedFilters = {
  priceRange: { min: 0, max: 1000000 },
  brands: [],
  models: [],
  caseMaterials: [],
  braceletMaterials: [],
  dialColors: [],
  movements: [],
  conditions: [],
  verifiedSellersOnly: false,
  hasBoxOnly: false,
  hasDocumentsOnly: false,
  gender: [],
};

interface UseProductFiltersProps {
  initialFilters?: Partial<AppliedFilters>;
}

export function useProductFilters(props?: UseProductFiltersProps) {
  const [filters, setFilters] = useState<AppliedFilters>({
    ...INITIAL_FILTERS,
    ...props?.initialFilters,
  });

  /**
   * Atualiza um filtro especÃ­fico
   */
  const updateFilter = useCallback(
    <K extends keyof AppliedFilters>(key: K, value: AppliedFilters[K]) => {
      setFilters(prev => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  /**
   * Adiciona um valor a um filtro de array
   */
  const addToArrayFilter = useCallback((key: keyof AppliedFilters, value: any) => {
    setFilters(prev => {
      const current = prev[key];
      if (!Array.isArray(current)) return prev;

      return {
        ...prev,
        [key]: [...current, value],
      };
    });
  }, []);

  /**
   * Remove um valor de um filtro de array
   */
  const removeFromArrayFilter = useCallback((key: keyof AppliedFilters, value: any) => {
    setFilters(prev => {
      const current = prev[key];
      if (!Array.isArray(current)) return prev;

      return {
        ...prev,
        [key]: current.filter(item => item !== value),
      };
    });
  }, []);

  /**
   * Toggle de um valor em filtro de array
   */
  const toggleArrayFilter = useCallback((key: keyof AppliedFilters, value: any) => {
    setFilters(prev => {
      const current = prev[key];
      if (!Array.isArray(current)) return prev;

      if (current.includes(value)) {
        return {
          ...prev,
          [key]: current.filter(item => item !== value),
        };
      } else {
        return {
          ...prev,
          [key]: [...current, value],
        };
      }
    });
  }, []);

  /**
   * Atualiza a faixa de preÃ§o
   */
  const updatePriceRange = useCallback((min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      priceRange: { min, max },
    }));
  }, []);

  /**
   * Limpa todos os filtros
   */
  const clearAllFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  /**
   * Limpa um filtro especÃ­fico
   */
  const clearFilter = useCallback((key: keyof AppliedFilters) => {
    setFilters(prev => ({
      ...prev,
      [key]:
        key === "priceRange"
          ? INITIAL_FILTERS.priceRange
          : key === "verifiedSellersOnly" ||
              key === "hasBoxOnly" ||
              key === "hasDocumentsOnly"
            ? false
            : [],
    }));
  }, []);

  /**
   * Atualiza todos os filtros de uma vez
   */
  const setAllFilters = useCallback((newFilters: Partial<AppliedFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  /**
   * Retorna um resumo dos filtros ativos
   */
  const summary = useMemo<FilterSummary>(() => {
    const summaryItems: string[] = [];
    let count = 0;

    if (filters.brands.length > 0) {
      summaryItems.push(`${filters.brands.length} marca(s)`);
      count += filters.brands.length;
    }

    if (filters.priceRange.min > 0 || filters.priceRange.max < 1000000) {
      summaryItems.push(
        `R$ ${filters.priceRange.min.toLocaleString("pt-BR")} - R$ ${filters.priceRange.max.toLocaleString("pt-BR")}`
      );
      count++;
    }

    if (filters.conditions.length > 0) {
      summaryItems.push(`${filters.conditions.length} condiÃ§Ã£o(Ãµes)`);
      count += filters.conditions.length;
    }

    if (filters.caseMaterials.length > 0) {
      summaryItems.push(`${filters.caseMaterials.length} material(is)`);
      count += filters.caseMaterials.length;
    }

    if (filters.movements.length > 0) {
      summaryItems.push(`${filters.movements.length} movimento(s)`);
      count += filters.movements.length;
    }

    if (filters.dialColors.length > 0) {
      summaryItems.push(`${filters.dialColors.length} cor(es)`);
      count += filters.dialColors.length;
    }

    if (filters.verifiedSellersOnly) {
      summaryItems.push("Apenas vendedores verificados");
      count++;
    }

    if (filters.hasBoxOnly) {
      summaryItems.push("Com caixa original");
      count++;
    }

    if (filters.hasDocumentsOnly) {
      summaryItems.push("Com documentaÃ§Ã£o");
      count++;
    }

    return {
      activeCount: count,
      hasActiveFilters: count > 0,
      summary: summaryItems,
    };
  }, [filters]);

  return {
    filters,
    updateFilter,
    addToArrayFilter,
    removeFromArrayFilter,
    toggleArrayFilter,
    updatePriceRange,
    clearAllFilters,
    clearFilter,
    setAllFilters,
    summary,
  };
}
