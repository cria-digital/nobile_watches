/**
 * Extrai o ID do produto a partir de um slug com formato {modelo-slug}-{id}
 *
 * @param slug - O slug completo do produto (ex: "gmt-master-ii-abc123")
 * @returns O ID extraído do slug, ou null se não encontrado
 *
 * @example
 * extractProductIdFromSlug("gmt-master-ii-abc123") // retorna "abc123"
 * extractProductIdFromSlug("submariner-xyz789") // retorna "xyz789"
 * extractProductIdFromSlug("invalid") // retorna null
 */
export function extractProductIdFromSlug(slug: string): string | null {
  if (!slug) return null;

  // Encontra o último hífen no slug
  const lastHyphenIndex = slug.lastIndexOf("-");

  // Se não houver hífen ou se o hífen for o último caractere, retorna null
  if (lastHyphenIndex === -1 || lastHyphenIndex === slug.length - 1) {
    return null;
  }

  // Extrai o ID (tudo após o último hífen)
  const id = slug.substring(lastHyphenIndex + 1);

  // Valida que o ID não está vazio
  return id.length > 0 ? id : null;
}

/**
 * Remove o ID de um slug de produto, retornando apenas a parte do modelo
 *
 * @param slug - O slug completo do produto (ex: "gmt-master-ii-abc123")
 * @returns O slug do modelo sem o ID (ex: "gmt-master-ii")
 *
 * @example
 * removeIdFromSlug("gmt-master-ii-abc123") // retorna "gmt-master-ii"
 * removeIdFromSlug("submariner-xyz789") // retorna "submariner"
 */
export function removeIdFromSlug(slug: string): string {
  if (!slug) return "";

  const lastHyphenIndex = slug.lastIndexOf("-");

  if (lastHyphenIndex === -1) {
    return slug;
  }

  return slug.substring(0, lastHyphenIndex);
}
