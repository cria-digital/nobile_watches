/**
 * src/lib/utils/filterUtils.ts
 * Utilitários para aplicar filtros aos produtos
 * Funciona tanto em modo mock quanto com API
 */

import { AppliedFilters } from "@/types/filters";
import { Product } from "@/types/product";

/**
 * Aplica filtros a uma lista de produtos (para modo mock)
 * @param products - Lista de produtos para filtrar
 * @param filters - Filtros aplicados
 * @param sortBy - Opção de ordenação (opcional)
 * @returns Produtos filtrados e ordenados
 */
export function filterProducts(
  products: Product[],
  filters: AppliedFilters,
  sortBy: string = "relevance"
): Product[] {
  let filtered = [...products];

  // Filtro 1: Faixa de preço
  if (filters.priceRange.min > 0 || filters.priceRange.max < Number.MAX_SAFE_INTEGER) {
    filtered = filtered.filter(
      p => p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
    );
  }

  // Filtro 2: Marcas
  if (filters.brands.length > 0) {
    filtered = filtered.filter(p => filters.brands.includes(p.brand));
  }

  // Filtro 3: Modelos
  if (filters.models.length > 0) {
    filtered = filtered.filter(p => filters.models.includes(p.model));
  }

  // Filtro 4: Material da caixa
  if (filters.caseMaterials.length > 0) {
    filtered = filtered.filter(
      p => p.caseMaterial && filters.caseMaterials.includes(p.caseMaterial)
    );
  }

  // Filtro 5: Material da pulseira
  if (filters.braceletMaterials.length > 0) {
    filtered = filtered.filter(
      p => p.braceletMaterial && filters.braceletMaterials.includes(p.braceletMaterial)
    );
  }

  // Filtro 6: Cores do mostrador
  if (filters.dialColors.length > 0) {
    filtered = filtered.filter(
      p => p.dialColor && filters.dialColors.includes(p.dialColor)
    );
  }

  // Filtro 7: Tipo de movimento
  if (filters.movements.length > 0) {
    filtered = filtered.filter(p => p.movement && filters.movements.includes(p.movement));
  }

  // Filtro 8: Condição do produto
  if (filters.conditions.length > 0) {
    filtered = filtered.filter(
      p => p.condition && filters.conditions.includes(p.condition)
    );
  }

  // Filtro 9: Gênero
  if (filters.gender && filters.gender.length > 0) {
    filtered = filtered.filter(p => p.gender && filters.gender!.includes(p.gender));
  }

  // Filtro 10: Apenas vendedores verificados
  // if (filters.verifiedSellersOnly) {
  //   filtered = filtered.filter(p => p.seller?.verified === true);
  // }

  // Filtro 11: Com caixa original
  if (filters.hasBoxOnly) {
    filtered = filtered.filter(p => p.hasBox === true);
  }

  // Filtro 12: Com documentação
  if (filters.hasDocumentsOnly) {
    filtered = filtered.filter(p => p.hasDocuments === true);
  }

  // Aplicar ordenação
  return sortProducts(filtered, sortBy);
}

/**
 * Ordena uma lista de produtos
 * @param products - Lista de produtos
 * @param sortBy - Tipo de ordenação
 * @returns Produtos ordenados
 */
export function sortProducts(
  products: Product[],
  sortBy: string = "relevance"
): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);

    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);

    case "newest":
      return sorted.sort((a, b) => {
        const dateA = new Date(b.createdAt || 0).getTime();
        const dateB = new Date(a.createdAt || 0).getTime();
        return dateA - dateB;
      });

    case "oldest":
      return sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateA - dateB;
      });

    case "relevance":
    default:
      // Manter ordem original (padrão do banco)
      return sorted;
  }
}

/**
 * Retorna sugestões de filtros baseado nos produtos atuais
 * Útil para atualizar opções de filtros dinâmicamente
 */
export function getAvailableFilterOptions(products: Product[]) {
  const extractUnique = (
    key: keyof Product,
    filter?: (val: any) => boolean
  ): string[] => {
    const values = products
      .map(p => p[key])
      .filter((v): v is string => typeof v === "string" && !!v);

    const unique = Array.from(new Set(values));
    return filter ? unique.filter(filter) : unique;
  };

  return {
    brands: extractUnique("brand"),
    models: extractUnique("model"),
    caseMaterials: extractUnique("caseMaterial"),
    braceletMaterials: extractUnique("braceletMaterial"),
    dialColors: extractUnique("dialColor"),
    movements: extractUnique("movement"),
    conditions: extractUnique("condition"),
    genders: extractUnique("gender"),
    priceRange: {
      min: Math.min(...products.map(p => p.price)),
      max: Math.max(...products.map(p => p.price)),
    },
  };
}

/**
 * Serializa filtros para URL (para compartilhamento/deep linking)
 */
export function serializeFilters(filters: AppliedFilters): string {
  const params = new URLSearchParams();

  if (filters.priceRange.min > 0) {
    params.set("priceMin", filters.priceRange.min.toString());
  }
  if (filters.priceRange.max < Number.MAX_SAFE_INTEGER) {
    params.set("priceMax", filters.priceRange.max.toString());
  }

  if (filters.brands.length > 0) {
    params.set("brands", filters.brands.join(","));
  }
  if (filters.models.length > 0) {
    params.set("models", filters.models.join(","));
  }
  if (filters.caseMaterials.length > 0) {
    params.set("caseMaterials", filters.caseMaterials.join(","));
  }
  if (filters.conditions.length > 0) {
    params.set("conditions", filters.conditions.join(","));
  }
  if (filters.movements.length > 0) {
    params.set("movements", filters.movements.join(","));
  }
  if (filters.verifiedSellersOnly) {
    params.set("verified", "true");
  }
  if (filters.hasBoxOnly) {
    params.set("hasBox", "true");
  }
  if (filters.hasDocumentsOnly) {
    params.set("hasDocs", "true");
  }

  return params.toString();
}

/**
 * Desserializa filtros de URL
 */
export function deserializeFilters(queryString: string): AppliedFilters {
  const params = new URLSearchParams(queryString);

  return {
    priceRange: {
      min: parseInt(params.get("priceMin") || "0"),
      max: parseInt(params.get("priceMax") || "1000000"),
    },
    brands: params.get("brands")?.split(",").filter(Boolean) || [],
    models: params.get("models")?.split(",").filter(Boolean) || [],
    caseMaterials: params.get("caseMaterials")?.split(",").filter(Boolean) || [],
    braceletMaterials: [],
    dialColors: [],
    movements: params.get("movements")?.split(",").filter(Boolean) || [],
    conditions: params.get("conditions")?.split(",").filter(Boolean) || [],
    verifiedSellersOnly: params.get("verified") === "true",
    hasBoxOnly: params.get("hasBox") === "true",
    hasDocumentsOnly: params.get("hasDocs") === "true",
  };
}
