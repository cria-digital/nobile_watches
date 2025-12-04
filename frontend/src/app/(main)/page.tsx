import {
  BecomeSeller,
  BuyerProtection,
  // FeaturedWatches,
  // FeaturedWatchesDesktop,
  Hero,
  HowItWorks,
  SellerSpotlight,
} from "@/modules/home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nobile - Relógios de Luxo Autênticos",
  description:
    "Descubra relógios de luxo autênticos com garantia de autenticidade. Marketplace seguro para comprar e vender Rolex, Omega, Patek Philippe e muito mais.",
  keywords: [
    "relógios de luxo",
    "Rolex",
    "Omega",
    "Patek Philippe",
    "marketplace",
    "autenticidade garantida",
    "comprar relógio",
    "vender relógio",
  ],
  openGraph: {
    title: "Nobile - Relógios de Luxo Autênticos",
    description:
      "Marketplace seguro para comprar e vender relógios de luxo com garantia de autenticidade",
    type: "website",
    locale: "pt_BR",
    url: "https://nobile.watches",
    images: [
      {
        url: "/assets/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "Nobile - Relógios de Luxo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nobile - Relógios de Luxo Autênticos",
    description: "Marketplace seguro para comprar e vender relógios de luxo",
    images: ["/assets/og-home.jpg"],
  },
  alternates: {
    canonical: "https://nobile.watches",
  },
};

export default async function Home(props: {
  params: Promise<{ countryCode: string }>;
}) {
  return (
    <>
      <Hero />

      {/* Seguro do Comprador */}
      <BuyerProtection />

      {/* Relógios em Destaque */}
      {/* <div className="block lg:hidden">
        <FeaturedWatches />
      </div>

      <div className="hidden lg:block">
        <FeaturedWatchesDesktop />
      </div> */}

      {/* Vendedores Destaque */}
      <SellerSpotlight />

      {/* Torne-se um Vendedor */}
      <BecomeSeller />

      {/* Como Funciona */}
      <HowItWorks />
    </>
  );
}
