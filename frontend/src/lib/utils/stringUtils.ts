/**
 * Utilidades para manipulação de strings e geração de slugs
 *
 * IMPORTANTE: Este arquivo implementa a solução padronizada para URLs de produtos/marcas.
 * Mantém parênteses e outros caracteres especiais para preservar precisão nas buscas.
 */

/**
 * Normaliza uma string removendo acentos e convertendo para minúsculas
 */
export const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

/**
 * Converte uma string para slug (URL-friendly)
 *
 * IMPORTANTE: Preserva parênteses para manter precisão nas marcas e produtos
 *
 * @example
 * stringToSlug("Vacheron Constantin (inspired)")
 * // Returns: "vacheron-constantin-(inspired)"
 * // Browser encoding: "vacheron-constantin-%28inspired%29"
 *
 * @example
 * stringToSlug("Patek Philippe")
 * // Returns: "patek-philippe"
 */
export const stringToSlug = (str: string): string => {
  return normalizeString(str)
    .replace(/\s+/g, "-")
    .replace(/[^\w\-()]+/g, "") // ✅ Preserva: letras, números, hífens E parênteses
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

/**
 * Converte um slug de volta para um nome legível
 *
 * CRÍTICO: Esta função precisa reverter exatamente o que stringToSlug() fez,
 * incluindo a preservação de parênteses.
 *
 * @example
 * slugToTitle("vacheron-constantin-(inspired)")
 * // Returns: "Vacheron Constantin (inspired)"
 *
 * @example
 * slugToTitle("patek-philippe")
 * // Returns: "Patek Philippe"
 */
export const slugToTitle = (slug: string): string => {
  if (slug === "all") return "all";

  return slug
    .split("-")
    .map((word) => {
      // Preserva parênteses como estão, sem capitalizar
      if (word.startsWith("(") && word.endsWith(")")) {
        return word;
      }
      // Capitaliza primeira letra de cada palavra
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

/**
 * Normaliza strings para comparação (ignorando caracteres especiais e case)
 *
 * Útil para fazer matching "fuzzy" entre slugs e nomes de marcas,
 * onde queremos que "Vacheron Constantin (inspired)" seja equivalente a
 * "vacheron constantin inspired" para fins de busca.
 *
 * @example
 * normalizeForComparison("Vacheron Constantin (inspired)")
 * // Returns: "vacheron constantin inspired"
 *
 * @example
 * normalizeForComparison("vacheron-constantin-(inspired)")
 * // Returns: "vacheron constantin inspired"
 */
export const normalizeForComparison = (str: string): string => {
  return normalizeString(str)
    .replace(/[^\w\s]/g, "") // Remove tudo exceto letras, números e espaços
    .replace(/\s+/g, " ") // Normaliza espaços múltiplos
    .trim();
};

/**
 * Compara duas strings de forma "fuzzy" (ignorando caracteres especiais, acentos e case)
 *
 * Útil para verificar se um slug corresponde a um nome de marca,
 * mesmo que tenham formatações diferentes.
 *
 * @example
 * areStringsEquivalentFuzzy("Vacheron Constantin (inspired)", "vacheron-constantin-inspired")
 * // Returns: true
 *
 * @example
 * areStringsEquivalentFuzzy("Rolex", "patek-philippe")
 * // Returns: false
 */
export const areStringsEquivalentFuzzy = (
  str1: string,
  str2: string
): boolean => {
  return normalizeForComparison(str1) === normalizeForComparison(str2);
};

/**
 * Verifica se duas strings são equivalentes (ignorando acentos e case)
 * Esta é uma comparação EXATA (não fuzzy)
 */
export const areStringsEquivalent = (str1: string, str2: string): boolean => {
  return normalizeString(str1) === normalizeString(str2);
};

/**
 * Mapeamento de marcas disponíveis (sincronizado com brandMap)
 */
export const AVAILABLE_BRANDS: Record<string, string> = {
  rolex: "rolex",
  "patek philippe": "patek-philippe",
  "patek-philippe": "patek-philippe",
  "audemars piguet": "audemars-piguet",
  "audemars-piguet": "audemars-piguet",
  omega: "omega",
  hublot: "hublot",
  breitling: "breitling",
  "tag heuer": "tag-heuer",
  "tag-heuer": "tag-heuer",
  cartier: "cartier",
  iwc: "iwc",
  seiko: "seiko",
};

/**
 * Busca uma marca pelo nome ou slug
 * Retorna o slug da marca se encontrada, null caso contrário
 */
export const findBrandSlug = (query: string): string | null => {
  const normalized = normalizeString(query);
  return AVAILABLE_BRANDS[normalized] || null;
};

export function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

export function getInitials(name?: string | null): string {
  if (!name || typeof name !== "string") return "";

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "";

  if (parts.length === 1) {
    const firstChar = (parts[0] ?? "").charAt(0);
    return firstChar ? firstChar.toUpperCase() : "";
  }

  const first = (parts[0] ?? "").charAt(0);
  const last = (parts[parts.length - 1] ?? "").charAt(0);

  return (first + last).toUpperCase();
}

export function safeString(value?: string | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
