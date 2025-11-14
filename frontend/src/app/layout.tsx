import { MockAuthSync } from "@/components/auth/MockAuthSync";
import { AuthProvider } from "@/lib/context/AuthContext";
import type { Metadata } from "next";
import { Lato } from "next/font/google";
import localFont from "next/font/local";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "styles/globals.css";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-lato",
});

const erstoria = localFont({
  src: "../../public/fonts/erstoria.otf",
  variable: "--font-erstoria",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Nobile",
    default: "Nobile - Marketplace de Relógios de Luxo",
  },
  description:
    "Encontre vendedores certificados e descubra seu novo relógio de luxo. Mais de 564 mil relógios autênticos.",
  keywords: ["relógios", "luxo", "marketplace", "Rolex", "Patek Philippe"],
  authors: [{ name: "Nobile" }],
  creator: "Nobile",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://nobile.com.br",
    siteName: "Nobile",
    title: "Nobile - Marketplace de Relógios de Luxo",
    description: "Encontre vendedores certificados e descubra seu novo relógio de luxo.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Nobile - Relógios de Luxo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nobile - Marketplace de Relógios de Luxo",
    description: "Encontre vendedores certificados e descubra seu novo relógio de luxo.",
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
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" className={`${lato.variable} ${erstoria.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#f97316" />
      </head>
      <body className={`${lato.className} antialiased`}>
        <AuthProvider>
          <MockAuthSync />
          {children}
          {/* <SimulateLoginButton /> */}
        </AuthProvider>
        {/* Portais para modais */}
        <div id="modal-root" />
        <div id="tooltip-root" />
      </body>
    </html>
  );
}
