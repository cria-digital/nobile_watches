import useSWR from "swr";

import { getAllProducts, getProductsByBrand } from "@/lib/data/mockProducts";
import nobileService from "../services/nobile.service";

const USE_API = process.env.NEXT_PUBLIC_USE_API === "true"; // controla se deve usar a API

/**
 * Hook para buscar produtos por marca ou todos os produtos
 * @param brandName - Nome da marca ou "all" para buscar todos os produtos
 * @returns Objeto contendo products, isLoading e isError
 */
export function useBrandProducts(brandName: string) {
  // Detecta se deve buscar todos os produtos
  const isAllProducts = brandName.toLowerCase() === "all";

  const { data, error, isLoading } = useSWR(
    USE_API ? (isAllProducts ? `/watches` : `/watches?brand=${brandName}`) : null,
    async () => {
      const allWatches = await nobileService.getWatches();

      // Se for "all", retorna todos os produtos
      if (isAllProducts) {
        return allWatches;
      }

      // Caso contrário, filtra pela marca específica
      return allWatches.filter(
        (watch: any) => watch.brand?.toLowerCase() === brandName.toLowerCase()
      );
    },
    {
      revalidateOnFocus: false,
    }
  );

  // Para mock data, usa a função apropriada baseado no contexto
  const mockData = !USE_API
    ? isAllProducts
      ? getAllProducts()
      : getProductsByBrand(brandName)
    : undefined;

  return {
    products: USE_API ? data || [] : mockData || [],
    isLoading: USE_API ? isLoading : false,
    isError: USE_API ? !!error : false,
  };
}
