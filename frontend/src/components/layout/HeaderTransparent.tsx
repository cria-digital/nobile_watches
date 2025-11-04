"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/Button";
import { MobileUserMenu } from "./MobileUserMenu";
import { UserMenu } from "./UserMenu";

/**
 * HeaderTransparent
 *
 * Variante do Header para páginas que necessitam de um header transparente
 * sem search bar, como a página Vendedor.
 *
 * Características:
 * - Background transparente (absolute positioning)
 * - Sem SearchBar
 * - Logo e navegação adaptados para contraste sobre imagem
 */
export function HeaderTransparent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, mockLogin, mockLogout } = useAuth();

  return (
    <div className="relative z-50">
      {/* Header com posicionamento absoluto para ficar sobre o hero */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          {/* Linha única - Logo, Navigation e Auth Actions */}
          <div className="flex h-16 md:h-24 items-center justify-between gap-4">
            <div className="flex items-center md:gap-x-12">
              {/* Logo - usa logo branco para contraste */}
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo-white.svg"
                  alt="Nobile"
                  width={120}
                  height={30}
                  className="w-[91px] h-[24px] md:w-[120px] md:h-[30px]"
                  priority
                />
              </Link>

              {/* Desktop Navigation Links - texto branco para contraste */}
              <nav className="hidden lg:flex items-center space-x-8">
                <Link
                  href="/#"
                  className="font-lato text-md font-medium text-white/80 hover:text-white transition-colors"
                >
                  Perguntas frequentes
                </Link>
                <Link
                  href="/vendedor"
                  className="font-lato text-md font-medium text-white hover:text-white transition-colors"
                >
                  Vender meu relógio
                </Link>
              </nav>
            </div>

            {/* Desktop Auth Actions - sem SearchBar */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated && user ? (
                <UserMenu user={user} />
              ) : (
                <Link href="/login">
                  <Button
                    variant="gold"
                    size="default"
                    className="h-[48px] w-[122px] font-bold leading-[150%] tracking-[0.02em] whitespace-nowrap"
                  >
                    Acessar
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Auth Actions or Menu Toggle */}
            <div className="md:hidden flex items-center gap-3">
              {isAuthenticated && user ? (
                <Link href="/meu-perfil">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <span className="font-lato text-sm font-medium text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Link>
              ) : null}

              <button
                type="button"
                className="p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6 text-white" />
                ) : (
                  <Bars3Icon className="h-6 w-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileUserMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* DEV ONLY: Toggle para testar estados */}
      <div className="hidden md:block fixed bottom-4 right-4 z-[9999] bg-black/80 text-white p-3 rounded-lg text-sm">
        <button
          onClick={() => (isAuthenticated ? mockLogout() : mockLogin())}
          className="hover:underline"
        >
          {isAuthenticated ? "Simular Logout" : "Simular Login"}
        </button>
      </div>
    </div>
  );
}
