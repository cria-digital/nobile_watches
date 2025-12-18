import { VendedorHero } from "@/modules/seller";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seja um Vendedor",
  description:
    "Venda seus relógios de luxo na Nobile. Conectamos colecionadores e entusiastas ao redor do mundo com compradores confiáveis.",
  keywords: [
    "vender relógio",
    "marketplace relógios",
    "vender Rolex",
    "vender Patek Philippe",
    "vendedor certificado",
  ],
  openGraph: {
    title: "Seja um Vendedor - Nobile",
    description: "Venda seus relógios de luxo com segurança na Nobile",
    type: "website",
  },
};

export default function BecomeASellerPage() {
  return <VendedorHero />;
}
