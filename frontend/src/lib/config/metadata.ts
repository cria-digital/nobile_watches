import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const siteName = "Nobile";
const siteTitle = "Nobile - Marketplace de Relógios de Luxo";
const siteDescription =
  "Encontre vendedores certificados e descubra seu novo relógio de luxo.";

export const metadata: Metadata = {
  title: {
    template: `%s | ${siteName}`,
    default: siteTitle,
  },
  description: siteDescription,
  keywords: [
    "relógios",
    "luxo",
    "marketplace",
    "Rolex",
    "Patek Philippe",
    "relógios de luxo",
    "comprar relógios",
    "vender relógios",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  metadataBase: new URL(baseUrl),

  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: baseUrl,
    siteName,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${siteName} - Relógios de Luxo`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  verification: {
    // Adicione aqui quando tiver
    // google: "seu-codigo-google",
    // yandex: "seu-codigo-yandex",
  },
};
