import { getAllProducts, getProductsByBrand } from "@/lib/data/mockProducts";
import { areStringsEquivalentFuzzy } from "@/lib/utils/stringUtils";
import useSWR from "swr";
import nobileService from "../services/nobile.service";

const USE_API = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "true";

/**
 * Hook para buscar produtos de uma marca específica
 *
 * ✅ ATUALIZADO: Agora usa o endpoint /search/advanced que:
 * - Filtra apenas watches com listings ACTIVE (disponíveis para compra)
 * - Retorna produtos prontos para exibição
 * - Suporta paginação e ordenação
 *
 * @param brandName - Nome da marca ou "all" para todos os produtos
 * @returns Produtos da marca, estado de loading e erro
 *
 * @example
 * // Buscar produtos da marca IWC
 * const { products, isLoading, isError } = useBrandProducts("IWC");
 *
 * @example
 * // Buscar todos os produtos disponíveis
 * const { products, isLoading, isError } = useBrandProducts("all");
 */
export function useBrandProducts(brandName: string) {
  const isAllProducts = brandName.toLowerCase() === "all";

  // Chave única para o SWR baseada na marca
  const swrKey = USE_API
    ? isAllProducts
      ? "/search/advanced?all=true&limit=100"
      : `/search/advanced?brand=${encodeURIComponent(brandName)}&limit=100`
    : null;

  const { data, error, isLoading } = useSWR(
    swrKey,
    async () => {
      console.log("🔍 Buscando produtos via /search/advanced:", {
        brandName,
        isAllProducts,
      });

      // ✅ USA ENDPOINT CORRETO: /search/advanced
      // Este endpoint já filtra por listings ACTIVE automaticamente

      // Constrói params condicionalmente para evitar passar undefined explicitamente
      // (TypeScript com exactOptionalPropertyTypes não aceita undefined explícito)
      const result = await nobileService.searchWatchesAdvanced({
        ...(isAllProducts ? {} : { brand: brandName }),
        limit: 100, // Busca até 100 produtos por vez
        sortBy: "publishedAt", // Ordena por data de publicação
        order: "desc", // Mais recentes primeiro
      });

      const watches = result.watches;

      console.log(
        `✅ Produtos encontrados: ${watches.length} de ${result.total} total`
      );

      // Se for "all", retorna todos os produtos
      if (isAllProducts) {
        return watches;
      }

      // ✅ Validação adicional: Garante que os produtos retornados são da marca correta
      // Isso é uma camada extra de segurança, o backend já deveria filtrar
      const filtered = watches.filter((watch: any) => {
        if (!watch.brand) return false;

        const matches = areStringsEquivalentFuzzy(watch.brand, brandName);

        if (!matches) {
          console.warn(
            `⚠️ Produto "${watch.brand}" não corresponde a "${brandName}" - será removido`
          );
        }

        return matches;
      });

      if (filtered.length !== watches.length) {
        console.warn(
          `⚠️ Filtro adicional aplicado: ${watches.length} → ${filtered.length} produtos`
        );
      }

      if (filtered.length === 0) {
        console.warn(
          `⚠️ Nenhum produto encontrado para marca "${brandName}". ` +
            `Verifique se o nome está correto ou se há produtos cadastrados.`
        );
      }

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
    const mockData = isAllProducts
      ? getAllProducts()
      : getProductsByBrand(brandName);

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
