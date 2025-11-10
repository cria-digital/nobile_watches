import { ProductPageClient } from "@/components/products/ProductPageClient";
import { mockProducts } from "@/lib/data/mockProducts";
import { extractProductIdFromSlug } from "@/lib/utils/productUrlUtils";
import { stringToSlug } from "@/lib/utils/stringUtils";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{
    brand: string;
    slug: string;
  }>;
}

export async function generateMetadata(props: ProductPageProps): Promise<Metadata> {
  const params = await props.params;

  // Extrai o ID do slug (ex: "gmt-master-ii-abc123" -> "abc123")
  const productId = extractProductIdFromSlug(params.slug);

  // Encontra o produto pelo ID
  const product = productId ? mockProducts.find(p => p.id === Number(productId)) : null;

  if (!product) {
    return {
      title: "Produto não encontrado",
    };
  }

  return {
    title: `${product.brand} ${product.model} - Nobile`,
    description:
      product.description ||
      `${product.brand} ${product.model} - ${product.referenceNumber}`,
    openGraph: {
      title: `${product.brand} ${product.model}`,
      description: product.description || "",
      images: product.images || [],
    },
  };
}

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params;

  // Extrai o ID do slug
  const productId = extractProductIdFromSlug(params.slug);

  if (!productId) {
    notFound();
  }

  // Busca o produto pelo ID
  // Busca o produto pelo ID
  const product = mockProducts.find(p => p.id === Number(productId));

  // Valida se o produto existe e se a marca corresponde
  if (!product || stringToSlug(product.brand) !== params.brand) {
    notFound();
  }

  // Busca produtos relacionados (mesma marca ou similares)
  const relatedProducts = mockProducts
    .filter(p => p.id !== product.id && p.brand === product.brand)
    .slice(0, 4);

  return <ProductPageClient product={product} relatedProducts={relatedProducts} />;
}
