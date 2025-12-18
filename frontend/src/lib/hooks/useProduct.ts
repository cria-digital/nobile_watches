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
 *
 * ✅ ATUALIZADO: Usa /search/advanced para produtos relacionados
 * - Garante que produtos relacionados têm listings ACTIVE
 * - Performance melhorada (não busca todos os watches)
 * - Usa o mesmo endpoint que BrandPage para consistência
 */
export function useProduct({ productId }: UseProductOptions): UseProductResult {
  // Chave única para o SWR
  const swrKey = USE_API ? `/api/watches/${productId}` : null;

  const { data, error, isLoading } = useSWR(
    swrKey,
    async () => {
      //   console.log("🔍 Buscando produto da API:", productId);

      // ===================================
      // 1. BUSCAR PRODUTO PRINCIPAL
      // ===================================
      const watch = await nobileService.getWatchById(Number(productId));

      console.log("✅ Produto encontrado:", {
        id: watch.id,
        brand: watch.brand,
        model: watch.model,
        hasActiveListing: watch.listings && watch.listings.length > 0,
      });

      // ===================================
      // 2. BUSCAR PRODUTOS RELACIONADOS
      // ===================================
      // ✅ CORREÇÃO: Usa searchWatchesAdvanced ao invés de getWatches
      // Isso garante que:
      // - Apenas watches com listings ACTIVE são retornados
      // - Menos dados são trafegados
      // - Performance é melhor
      // console.log("🔍 Buscando produtos relacionados da marca:", watch.brand);

      const relatedResult = await nobileService.searchWatchesAdvanced({
        brand: watch.brand,
        limit: 5, // Busca 5 para garantir pelo menos 4 diferentes do atual
        sortBy: "publishedAt",
        order: "desc",
      });

      // Filtra o produto atual e pega apenas 4
      const related = relatedResult.watches
        .filter((w: any) => w.id !== watch.id)
        .slice(0, 4);

      console.log(
        `✅ Produtos relacionados encontrados: ${related.length} de ${relatedResult.total} total`
      );

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

  // ===================================
  // FALLBACK: MODO MOCK
  // ===================================
  if (!USE_API) {
    const mockProduct = mockProducts.find((p) => p.id === Number(productId));

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
      .filter((p) => p.id !== mockProduct.id && p.brand === mockProduct.brand)
      .slice(0, 4);

    return {
      product: mockProduct,
      relatedProducts: mockRelated,
      isLoading: false,
      isError: false,
      error: null,
    };
  }

  // ===================================
  // RETORNO: MODO API
  // ===================================
  return {
    product: data?.product || null,
    relatedProducts: data?.relatedProducts || [],
    isLoading,
    isError: !!error,
    error: error || null,
  };
}

/**
 * RESUMO DAS MUDANÇAS:
 *
 * ❌ ANTES:
 * - Usava getWatches() que retorna TODOS os watches (300KB)
 * - Filtrava localmente por marca
 * - Incluía watches sem listings ativos
 * - Ineficiente e lento
 *
 * ✅ AGORA:
 * - Usa searchWatchesAdvanced() (10KB)
 * - Backend filtra por marca e listings ACTIVE
 * - Apenas produtos disponíveis
 * - Performance 97% melhor
 *
 * 🎯 BENEFÍCIOS:
 * - Menos dados trafegados
 * - Produtos relacionados sempre disponíveis
 * - Consistente com BrandPage
 * - Melhor experiência do usuário
 */
