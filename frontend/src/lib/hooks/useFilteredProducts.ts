import { filterProducts } from "@/lib/utils/filterUtils";
import { areStringsEquivalentFuzzy } from "@/lib/utils/stringUtils";
import { AppliedFilters } from "@/types/filters";
import { Product } from "@/types/product";
import useSWR from "swr";
import nobileService from "../services/nobile.service";
import { useBrandProducts } from "./useBrandProducts";

const USE_API = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "true";

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
 *
 * ✅ ATUALIZADO: Agora envia filtros para o backend ao invés de filtrar localmente
 *
 * MODO API:
 * - Usa endpoint /search/advanced com todos os filtros
 * - Backend faz a filtragem e retorna apenas resultados relevantes
 * - Melhor performance (menos dados trafegados)
 *
 * MODO MOCK:
 * - Usa filtragem local para desenvolvimento
 * - Mantém compatibilidade com dados de teste
 *
 * @param brandName - Nome da marca ou "all"
 * @param filters - Filtros aplicados pelo usuário
 * @param sortBy - Opção de ordenação
 *
 * @example
 * const { filteredProducts, totalCount, isLoading } = useFilteredProducts({
 *   brandName: "IWC",
 *   filters: {
 *     priceRange: { min: 10000, max: 50000 },
 *     conditions: ["Novo"],
 *     movements: ["Automático"]
 *   },
 *   sortBy: "price-asc"
 * });
 */
export function useFilteredProducts({
  brandName,
  filters,
  sortBy = "relevance",
}: UseFilteredProductsProps): UseFilteredProductsResult {
  const isAllProducts = brandName.toLowerCase() === "all";

  // ===================================
  // MAPEAMENTO DE ORDENAÇÃO
  // ===================================
  // Converte valores do frontend para campos aceitos pelo backend
  const sortMapping: Record<string, { field: string; order: "asc" | "desc" }> =
    {
      relevance: { field: "publishedAt", order: "desc" }, // Mais recentes
      "price-asc": { field: "price", order: "asc" }, // Menor preço
      "price-desc": { field: "price", order: "desc" }, // Maior preço
      newest: { field: "createdAt", order: "desc" }, // Mais novos
      oldest: { field: "createdAt", order: "asc" }, // Mais antigos
    };

  // Garante que sort nunca será undefined
  //@ts-ignore
  const sort: { field: string; order: "asc" | "desc" } =
    sortMapping[sortBy] ?? sortMapping.relevance;

  // ===================================
  // CONSTRUÇÃO DOS PARÂMETROS
  // ===================================
  // Monta objeto com filtros para enviar ao backend
  // ⚠️ IMPORTANTE: Não incluir propriedades undefined (TypeScript exactOptionalPropertyTypes)

  const searchParams: Record<string, any> = {
    // Ordenação (sempre presente)
    sortBy: sort.field,
    order: sort.order,
    limit: 100,
  };

  // Adiciona marca apenas se não for "all"
  if (!isAllProducts) {
    searchParams.brand = brandName;
  }

  // Faixa de preço
  if (filters.priceRange.min > 0) {
    searchParams.minPrice = filters.priceRange.min;
  }
  if (filters.priceRange.max < Number.MAX_SAFE_INTEGER) {
    searchParams.maxPrice = filters.priceRange.max;
  }

  // ⚠️ LIMITAÇÃO DO BACKEND: Aceita apenas 1 valor por filtro
  // Se o usuário selecionar múltiplos, enviamos apenas o primeiro
  // TODO: Futuramente, backend poderia aceitar arrays
  if (filters.conditions.length > 0) {
    searchParams.condition = filters.conditions[0];
  }
  if (filters.movements.length > 0) {
    searchParams.movement = filters.movements[0];
  }
  if (filters.caseMaterials.length > 0) {
    searchParams.caseMaterial = filters.caseMaterials[0];
  }
  if (filters.braceletMaterials.length > 0) {
    searchParams.braceletMaterial = filters.braceletMaterials[0];
  }
  if (filters.dialColors.length > 0) {
    searchParams.dialColor = filters.dialColors[0];
  }
  if (filters.gender && filters.gender.length > 0) {
    searchParams.gender = filters.gender[0];
  }

  // ===================================
  // CHAVE DO SWR
  // ===================================
  // Cria uma chave única baseada nos parâmetros de busca
  const swrKey = USE_API
    ? `/search/advanced?${new URLSearchParams(searchParams).toString()}`
    : null;

  // ===================================
  // BUSCA COM SWR
  // ===================================
  const { data, error, isLoading } = useSWR(
    swrKey,
    async () => {
      console.log("🔍 Buscando produtos filtrados via API:", {
        brandName,
        filters: searchParams,
      });

      // Chama o endpoint de busca avançada
      const result = await nobileService.searchWatchesAdvanced(searchParams);

      console.log(`✅ Resultados filtrados: ${result.watches.length} produtos`);

      // ===================================
      // FILTRO ESPECIAL: Múltiplas marcas
      // ===================================
      // Backend aceita apenas 1 marca por vez via query param "brand"
      // Se estivermos na página "all" E houver filtro de múltiplas marcas,
      // aplicamos esse filtro localmente
      if (isAllProducts && filters.brands.length > 0) {
        console.log(
          "🔍 Aplicando filtro de múltiplas marcas localmente:",
          filters.brands
        );

        const filtered = result.watches.filter((w) =>
          filters.brands.some((brand) =>
            areStringsEquivalentFuzzy(w.brand, brand)
          )
        );

        console.log(
          `✅ Após filtro de marcas: ${filtered.length} de ${result.watches.length} produtos`
        );

        return {
          watches: filtered,
          total: filtered.length,
          page: result.page,
          totalPages: Math.ceil(filtered.length / (searchParams.limit || 20)),
        };
      }

      // ===================================
      // FILTROS MÚLTIPLOS (FALLBACK LOCAL)
      // ===================================
      // Se o usuário selecionou múltiplos valores em um filtro,
      // o backend só aplicou o primeiro. Aplicamos os demais localmente.
      let watches = result.watches;

      // Filtro múltiplo: Condições
      if (filters.conditions.length > 1) {
        watches = watches.filter((w) =>
          filters.conditions.includes(w.condition || "")
        );
      }

      // Filtro múltiplo: Movimentos
      if (filters.movements.length > 1) {
        watches = watches.filter((w) =>
          filters.movements.includes(w.movement || "")
        );
      }

      // Filtro múltiplo: Materiais da caixa
      if (filters.caseMaterials.length > 1) {
        watches = watches.filter((w) =>
          filters.caseMaterials.includes(w.caseMaterial || "")
        );
      }

      // Filtro múltiplo: Materiais da pulseira
      if (filters.braceletMaterials.length > 1) {
        watches = watches.filter((w) =>
          filters.braceletMaterials.includes(w.braceletMaterial || "")
        );
      }

      // Filtro múltiplo: Cores do mostrador
      if (filters.dialColors.length > 1) {
        watches = watches.filter((w) =>
          filters.dialColors.includes(w.dialColor || "")
        );
      }

      // Filtro múltiplo: Gênero
      if (filters.gender && filters.gender.length > 1) {
        watches = watches.filter((w) =>
          filters.gender!.includes(w.gender || "")
        );
      }

      return {
        watches,
        total: watches.length,
        page: result.page,
        totalPages: Math.ceil(watches.length / (searchParams.limit || 20)),
      };
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  // ===================================
  // FALLBACK: MODO MOCK
  // ===================================
  // Quando a API não está disponível, usa filtragem local com dados mock
  if (!USE_API) {
    console.log("📊 Usando filtragem local (modo mock)");

    const { products, isLoading, isError } = useBrandProducts(brandName);

    // Remove filtro de brands se não for página "all"
    // (useBrandProducts já filtrou por marca)
    const adjustedFilters: AppliedFilters = isAllProducts
      ? filters
      : { ...filters, brands: [] };

    const filtered = filterProducts(products, adjustedFilters, sortBy);

    return {
      filteredProducts: filtered,
      totalCount: filtered.length,
      isLoading,
      isError,
    };
  }

  // ===================================
  // RETORNO: MODO API
  // ===================================
  return {
    filteredProducts: (data?.watches as Product[]) || [],
    totalCount: data?.total || 0,
    isLoading,
    isError: !!error,
  };
}

/**
 * RESUMO DAS MUDANÇAS:
 *
 * ❌ ANTES:
 * 1. Buscava TODOS os produtos
 * 2. Aplicava filtros localmente (no frontend)
 * 3. Trafegava muitos dados desnecessários
 * 4. Performance ruim para grandes volumes
 *
 * ✅ AGORA:
 * 1. Envia filtros para o backend via /search/advanced
 * 2. Backend filtra e retorna apenas resultados relevantes
 * 3. Menos dados trafegados
 * 4. Melhor performance
 * 5. Apenas produtos com listings ACTIVE
 *
 * 🎯 PRÓXIMOS PASSOS:
 * - Backend aceitar arrays em filtros (múltiplos valores)
 * - Implementar paginação real (page/limit)
 * - Adicionar cache mais agressivo
 */
