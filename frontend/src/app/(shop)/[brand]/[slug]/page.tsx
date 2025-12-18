import { ProductPageClient } from "@/components/product";
import { extractProductIdFromSlug } from "@/lib/utils/productUrlUtils";
import { Watch } from "@/types/nobile";
import { Metadata } from "next";
import { notFound } from "next/navigation";

// ✅ Força renderização dinâmica (SSR)
export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{
    brand: string;
    slug: string;
  }>;
}

// URL do backend - usa variável de ambiente
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Busca produto da API usando fetch direto
 * ✅ Funciona em Server Components (usa fetch do Node.js)
 */
async function fetchProduct(productId: string): Promise<Watch | null> {
  try {
    const url = `${API_URL}/watches/${productId}`;
    console.log("🔍 Buscando produto:", url);

    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache por 60 segundos
    });

    if (!response.ok) {
      console.error(`❌ Erro ao buscar produto: ${response.status}`);
      return null;
    }

    const product = await response.json();
    console.log(
      "✅ Produto encontrado:",
      product.id,
      product.brand,
      product.model
    );
    return product;
  } catch (error) {
    console.error("❌ Erro ao buscar produto:", error);
    return null;
  }
}

async function fetchRelatedProducts(
  brand: string,
  excludeId: number
): Promise<Watch[]> {
  try {
    const url = `${API_URL}/search/advanced?brand=${encodeURIComponent(brand)}&limit=5`;
    console.log("🔍 Buscando produtos relacionados:", url);

    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache por 5 minutos
    });

    if (!response.ok) {
      console.error(`❌ Erro ao buscar relacionados: ${response.status}`);
      return [];
    }

    const data = await response.json();

    // Filtra o produto atual e retorna no máximo 4
    const related = data.watches
      .filter((w: Watch) => w.id !== excludeId)
      .slice(0, 4);

    console.log(`✅ ${related.length} produtos relacionados encontrados`);
    return related;
  } catch (error) {
    console.error("❌ Erro ao buscar produtos relacionados:", error);
    return [];
  }
}

export async function generateMetadata(
  props: ProductPageProps
): Promise<Metadata> {
  const params = await props.params;
  const productId = extractProductIdFromSlug(params.slug);

  if (!productId) {
    return {
      title: "Produto não encontrado",
    };
  }

  // Busca produto para gerar metadata
  const product = await fetchProduct(productId);

  if (!product) {
    return {
      title: "Produto não encontrado",
    };
  }

  return {
    title: `${product.brand} ${product.model} - Nobile`,
    description:
      product.description ||
      `${product.brand} ${product.model} - ${product.referenceNumber || ""}`,
    openGraph: {
      title: `${product.brand} ${product.model}`,
      description: product.description || "",
      images: product.images || [],
    },
  };
}

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params;
  const productId = extractProductIdFromSlug(params.slug);

  if (!productId) {
    console.log("❌ ProductId inválido, retornando 404");
    notFound();
  }

  // Busca produto da API
  const product = await fetchProduct(productId);
  console.log("product", product);
  if (!product) {
    console.log("❌ Produto não encontrado, retornando 404");
    notFound();
  }

  // Valida se a marca corresponde ao slug da URL
  const brandSlug = params.brand.toLowerCase();
  const productBrandSlug = product.brand.toLowerCase().replace(/\s+/g, "-");

  console.log(
    "🔍 Validando marca - URL:",
    brandSlug,
    "| Produto:",
    productBrandSlug
  );

  if (productBrandSlug !== brandSlug) {
    console.log("❌ Marca não corresponde, retornando 404");
    notFound();
  }

  // Busca produtos relacionados (opcional, não bloqueia a renderização)
  // const relatedProducts = await fetchRelatedProducts(product.brand, product.id);

  console.log("✅ Renderizando ProductPageClient com productId:", productId);

  // Passa productId para o componente client buscar via hook
  return <ProductPageClient productId={productId} />;
}
