import { ProductPageClient } from "@/components/product";
import nobileService from "@/lib/services/nobile.service";
import { extractProductIdFromSlug } from "@/lib/utils/productUrlUtils";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{
    brand: string;
    slug: string;
  }>;
}

const USE_API = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "true";

/**
 * Busca produto da API usando nobileService
 */
async function fetchProduct(productId: string) {
  try {
    const product = await nobileService.getWatchById(Number(productId));
    return product;
  } catch (error) {
    console.error("Erro ao buscar produto da API:", error);
    return null;
  }
}

async function fetchRelatedProducts(brand: string, excludeId: number) {
  try {
    // ✅ Usa nobileService ao invés de fetch direto
    const allProducts = await nobileService.getWatches();

    // Filtra produtos da mesma marca, excluindo o produto atual
    return allProducts
      .filter(
        (p: any) => p.id !== excludeId && p.brand?.toLowerCase() === brand?.toLowerCase()
      )
      .slice(0, 4);
  } catch (error) {
    console.error("Erro ao buscar produtos relacionados:", error);
    return [];
  }
}

export async function generateMetadata(props: ProductPageProps): Promise<Metadata> {
  const params = await props.params;
  const productId = extractProductIdFromSlug(params.slug);

  if (!productId) {
    return {
      title: "Produto não encontrado",
    };
  }

  // ✅ Só busca produto da API se USE_API for true
  if (!USE_API) {
    return {
      title: "Produto - Nobile",
      description: "Relógio de luxo disponível na Nobile",
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
    notFound();
  }

  let product = null;
  let relatedProducts: any[] = [];

  if (USE_API) {
    product = await fetchProduct(productId);

    if (!product) {
      notFound();
    }

    // Valida se a marca corresponde ao slug da URL
    const brandSlug = params.brand.toLowerCase();
    const productBrandSlug = product.brand.toLowerCase().replace(/\s+/g, "-");

    if (productBrandSlug !== brandSlug) {
      notFound();
    }

    // Busca produtos relacionados
    relatedProducts = await fetchRelatedProducts(product.brand, product.id);
  }

  // Passa productId para o componente client buscar via hook
  // Isso permite que o componente client gerencie loading/error states
  return <ProductPageClient productId={productId} />;
}
