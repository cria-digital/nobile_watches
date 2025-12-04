import { filterProducts } from "@/lib/utils/filterUtils";
import { AppliedFilters } from "@/types/filters";
import { Product } from "@/types/product";
import { useMemo } from "react";
import { useBrandProducts } from "./useBrandProducts";

interface UseFilteredProductsProps {
  brandName: string;
  filters: AppliedFilters;
  sortBy?: string;
}

interface UseFilteredProductsResult {
  filteredProducts: Product[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Hook que gerencia produtos filtrados
 * Integra com useBrandProducts e aplica filtros localmente (mock)
 * ou pode ser adaptado para chamar endpoint de filtros da API
 */
export function useFilteredProducts({
  brandName,
  filters,
  sortBy = "relevance",
}: UseFilteredProductsProps): UseFilteredProductsResult {
  const { products, isLoading, isError } = useBrandProducts(brandName);

  const isAllProducts = brandName.toLowerCase() === "all";

  const filteredProducts = useMemo(() => {
    const adjustedFilters: AppliedFilters = isAllProducts
      ? filters // Na página "all", mantém todos os filtros incluindo brands
      : {
          ...filters,
          brands: [], // Remove filtro de brands pois já está aplicado pelo useBrandProducts
        };

    return filterProducts(products, adjustedFilters, sortBy);
  }, [products, filters, sortBy, isAllProducts]);

  return {
    filteredProducts,
    totalCount: filteredProducts.length,
    isLoading,
    isError,
  };
}

/**
 * Versão alternativa que pode ser usada para chamar API de filtros
 * (descomente quando backend tiver endpoint de filtros)
 */
export function useFilteredProductsAPI({
  brandName,
  filters,
  sortBy = "relevance",
}: UseFilteredProductsProps): UseFilteredProductsResult {
  // TODO: Implementar quando houver endpoint de filtros na API
  // Usar SWR para cache e revalidação

  // Por enquanto, usar a versão local
  return useFilteredProducts({ brandName, filters, sortBy });
}
