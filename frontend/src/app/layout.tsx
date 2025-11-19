import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { fontVariables, lato } from "@/lib/config/fonts";
import { metadata as siteMetadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthProvider } from "@/lib/context/AuthContext";
import "@/styles/globals.css";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

export const metadata: Metadata = siteMetadata;

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" className={fontVariables} suppressHydrationWarning>
      <body className={`${lato.className} antialiased`}>
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>

        {/* Portais para componentes que renderizam fora da hierarquia */}
      </body>
    </html>
  );
}
