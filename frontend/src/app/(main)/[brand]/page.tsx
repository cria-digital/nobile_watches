import { BrandPageClient } from "@/components/products/BrandPageClient";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface BrandPageProps {
  params: Promise<{ brand: string }>;
}

const brandMap: Record<string, string> = {
  all: "all",
  rolex: "Rolex",
  "patek-philippe": "Patek Philippe",
  "audemars-piguet": "Audemars Piguet",
  omega: "Omega",
  hublot: "Hublot",
  breitling: "Breitling",
  "tag-heuer": "Tag Heuer",
  cartier: "Cartier",
  iwc: "IWC",
  seiko: "Seiko",
};

export async function generateMetadata(props: BrandPageProps): Promise<Metadata> {
  const params = await props.params;
  const brandName = brandMap[params.brand];

  if (!brandName) return { title: "Marca não encontrada" };

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
  const brandName = brandMap[params.brand];

  if (!brandName) notFound();

  return <BrandPageClient brandName={brandName} />;
}
