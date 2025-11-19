import { mockProducts } from "@/lib/data/mockProducts";
import { Product } from "@/types/product";
import useSWR from "swr";
import nobileService from "../services/nobile.service";

// Flag para alternar entre API real e dados mock
const USE_API = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "true";

interface UseProductOptions {
  productId: string | number;
}

interface UseProductResult {
  product: Product | null;
  relatedProducts: Product[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Hook para buscar detalhes de um produto específico
 * Busca o produto por ID e também produtos relacionados da mesma marca
 */
export function useProduct({ productId }: UseProductOptions): UseProductResult {
  // Chave única para o SWR
  const swrKey = USE_API ? `/api/watches/${productId}` : null;

  const { data, error, isLoading } = useSWR(
    swrKey,
    async () => {
      console.log("🔍 Buscando produto da API:", productId);

      // Busca o produto específico
      const watch = await nobileService.getWatchById(Number(productId));
      console.log("✅ Produto encontrado:", watch);

      // Busca todos os relógios para filtrar produtos relacionados
      const allWatches = await nobileService.getWatches();

      // Filtra produtos relacionados (mesma marca, excluindo o produto atual)
      const related = allWatches
        .filter(
          (w: any) =>
            w.id !== watch.id && w.brand?.toLowerCase() === watch.brand?.toLowerCase()
        )
        .slice(0, 4); // Apenas 4 produtos relacionados

      console.log("✅ Produtos relacionados encontrados:", related.length);

      return {
        product: watch,
        relatedProducts: related,
      };
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // Cache de 10 segundos
    }
  );

  // Fallback para mock data quando API não está disponível
  if (!USE_API) {
    console.log("📊 Usando dados mock");
    const mockProduct = mockProducts.find(p => p.id === Number(productId));

    if (!mockProduct) {
      return {
        product: null,
        relatedProducts: [],
        isLoading: false,
        isError: true,
        error: new Error("Produto não encontrado"),
      };
    }

    // Busca produtos relacionados (mesma marca)
    const mockRelated = mockProducts
      .filter(p => p.id !== mockProduct.id && p.brand === mockProduct.brand)
      .slice(0, 4);

    return {
      product: mockProduct,
      relatedProducts: mockRelated,
      isLoading: false,
      isError: false,
      error: null,
    };
  }

  // Retorna dados da API
  return {
    product: data?.product || null,
    relatedProducts: data?.relatedProducts || [],
    isLoading,
    isError: !!error,
    error: error || null,
  };
}
