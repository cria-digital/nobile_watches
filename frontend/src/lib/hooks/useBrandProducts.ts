import { getAllProducts, getProductsByBrand } from "@/lib/data/mockProducts";
import useSWR from "swr";
import nobileService from "../services/nobile.service";

// Flag para alternar entre API real e dados mock
const USE_API = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "true";

export function useBrandProducts(brandName: string) {
  // Detecta se deve buscar todos os produtos
  const isAllProducts = brandName.toLowerCase() === "all";

  // Chave única para o SWR baseada na marca
  const swrKey = USE_API
    ? isAllProducts
      ? "/api/watches/all"
      : `/api/watches/brand/${brandName}`
    : null;

  const { data, error, isLoading } = useSWR(
    swrKey,
    async () => {
      console.log("🔍 Buscando produtos da API:", { brandName, isAllProducts });

      // Busca todos os relógios da API
      const watches = await nobileService.getWatches();

      // Se for "all", retorna todos os produtos
      if (isAllProducts) {
        console.log("✅ Retornando todos os produtos:", watches.length);
        return watches;
      }

      // Caso contrário, filtra pela marca específica
      const filtered = watches.filter(
        (watch: any) => watch.brand?.toLowerCase() === brandName.toLowerCase()
      );

      console.log(`✅ Retornando produtos da marca ${brandName}:`, filtered.length);
      return filtered;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Cache de 5 segundos
    }
  );

  // Fallback para mock data quando API não está disponível
  if (!USE_API) {
    console.log("📊 Usando dados mock");
    const mockData = isAllProducts ? getAllProducts() : getProductsByBrand(brandName);

    return {
      products: mockData || [],
      isLoading: false,
      isError: false,
    };
  }

  return {
    products: data || [],
    isLoading,
    isError: !!error,
  };
}
