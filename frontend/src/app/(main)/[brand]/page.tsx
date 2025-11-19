import { BrandPageClient } from "@/components/products/BrandPageClient";
import { Metadata } from "next";

interface BrandPageProps {
  params: Promise<{ brand: string }>;
}

/**
 * Converte slug da URL para nome de marca
 * Exemplo: "vacheron-constantin-(inspired)" -> "Vacheron Constantin (inspired)"
 */
function slugToBrandName(slug: string): string {
  if (slug === "all") return "all";

  // Converte hífens para espaços e capitaliza cada palavra
  return slug
    .split("-")
    .map(word => {
      // Mantém parênteses como estão
      if (word.startsWith("(") && word.endsWith(")")) {
        return word;
      }
      // Capitaliza primeira letra de cada palavra
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
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

  // Não validamos se a marca existe aqui - deixamos o BrandPageClient
  // buscar da API e mostrar mensagem apropriada se não houver produtos

  return <BrandPageClient brandName={brandName} />;
}
