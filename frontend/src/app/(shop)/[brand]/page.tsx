import { BrandPageClient } from "@/components/brand";
import { slugToTitle } from "@/lib/utils/stringUtils";
import { Metadata } from "next";

interface BrandPageProps {
  params: Promise<{ brand: string }>;
}

/**
 * Converte slug da URL para nome de marca
 * Exemplo: "vacheron-constantin-(inspired)" -> "Vacheron Constantin (inspired)"
 */
function slugToBrandName(slug: string): string {
  return slugToTitle(slug);
}

export async function generateMetadata(props: BrandPageProps): Promise<Metadata> {
  const params = await props.params;

  const brandName = slugToBrandName(params.brand);

  // Metadata especial para a página "all"
  if (params.brand === "all") {
    return {
      title: "Todos os Relógios de Luxo | Nobile",
      description:
        "Explore nossa coleção completa de relógios de luxo das melhores marcas do mundo.",
    };
  }

  return {
    title: `${brandName} - Relógios de Luxo | Nobile`,
    description: `Explore nossa coleção de relógios ${brandName}.`,
  };
}

export default async function BrandPage(props: BrandPageProps) {
  const params = await props.params;

  const brandName = slugToBrandName(params.brand);

  return <BrandPageClient brandName={brandName} />;
}
