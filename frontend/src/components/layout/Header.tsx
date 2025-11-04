"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/Button";
import { MobileUserMenu } from "./MobileUserMenu";
import { SearchBar } from "./SearchBar";
import { UserMenu } from "./UserMenu";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, mockLogin, mockLogout } = useAuth();
  const pathname = usePathname();

  // Detecta se está na página vendedor
  const isVendedorPage = pathname === "/vendedor";

  return (
    <div className="relative inset-x-0 z-150 group">
      <header
        className={`relative mx-auto duration-200 ${
          // Mobile: transparente e absoluto na página vendedor
          // Desktop: sempre com fundo branco
          isVendedorPage
            ? "h-16 md:h-24 absolute lg:relative w-full bg-transparent lg:bg-white"
            : "h-[120px] md:h-24 bg-white"
        }`}
      >
        <div className="container mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          {/* Primeira linha - Logo, Navigation e Auth Actions */}
          <div className="flex h-16 md:h-24 items-center justify-between gap-4">
            <div className="flex items-center md:gap-x-12">
              {/* Logo */}
              <Link href="/" className="flex items-center">
                {/* Mobile da página vendedor: logo branco */}
                {isVendedorPage && (
                  <>
                    <Image
                      src="/logo-white.svg"
                      alt="Nobile"
                      width={120}
                      height={30}
                      className="w-[91px] h-[24px] md:w-[120px] md:h-[30px] lg:hidden"
                      priority
                    />
                    {/* Desktop: logo normal */}
                    <Image
                      src="/logo.svg"
                      alt="Nobile"
                      width={120}
                      height={30}
                      className="hidden lg:block w-[120px] h-[30px]"
                      priority
                    />
                  </>
                )}

                {/* Outras páginas: logo normal sempre */}
                {!isVendedorPage && (
                  <Image
                    src="/logo.svg"
                    alt="Nobile"
                    width={120}
                    height={30}
                    className="w-[91px] h-[24px] md:w-[120px] md:h-[30px]"
                    priority
                  />
                )}
              </Link>

              {/* Desktop Navigation Links */}
              <nav className="hidden lg:flex items-center space-x-8">
                <Link
                  href="/#"
                  className="font-lato text-md font-medium text-gray-400 hover:text-gray-900 transition-colors"
                >
                  Perguntas frequentes
                </Link>
                <Link
                  href="/vendedor"
                  className="font-lato text-md font-medium text-gray-400 hover:text-gray-900 transition-colors"
                >
                  Vender meu relógio
                </Link>
              </nav>
            </div>

            {/* Desktop Search and Auth Actions */}
            <div className="hidden md:flex items-center gap-4">
              {/* SearchBar sempre presente no desktop */}
              <SearchBar className="md:w-[420px]" />

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
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isVendedorPage
                        ? "bg-white/20 backdrop-blur-sm border border-white/30"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`font-lato text-sm font-medium ${
                        isVendedorPage ? "text-white" : "text-gray-700"
                      }`}
                    >
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
                  <XMarkIcon
                    className={`h-6 w-6 ${
                      isVendedorPage ? "text-white lg:text-gray-900" : "text-gray-900"
                    }`}
                  />
                ) : (
                  <Bars3Icon
                    className={`h-6 w-6 ${
                      isVendedorPage ? "text-white lg:text-gray-900" : "text-gray-900"
                    }`}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Segunda linha - Search Bar (apenas mobile E NÃO na página vendedor) */}
          {!isVendedorPage && (
            <div className="md:hidden pb-4">
              <SearchBar />
            </div>
          )}
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
