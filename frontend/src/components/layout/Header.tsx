"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { getInitials } from "@/lib/utils/stringUtils";
import { SquareX } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/Button";
import { MobileUserMenu } from "./MobileUserMenu";
import { SearchBar } from "./SearchBar";
import { UserMenu } from "./UserMenu";

const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, mockLogout, logout } = useAuth();
  const pathname = usePathname();

  const isVendedorPage = pathname === "/vendedor";

  return (
    <div className="relative inset-x-0 z-120 group">
      <header
        className={`relative mx-auto duration-200 ${
          isVendedorPage
            ? "h-16 md:h-24 absolute lg:relative w-full bg-transparent lg:bg-white"
            : "h-[120px] md:h-24 bg-white"
        }`}
      >
        <div className="container mx-auto max-w-7xl px-5 lg:px-8">
          {/* Primeira linha - Logo, Navigation e Auth Actions */}
          <div className="flex h-16 md:h-24 items-center justify-between gap-4">
            <div className="flex items-center md:gap-x-12">
              {/* Logo */}
              <Link
                href="/"
                className="flex items-center w-[92px] h-[25px] md:w-[123px] md:h-[33px]"
              >
                {/* Mobile da página vendedor: logo branco */}
                {isVendedorPage && (
                  <>
                    <Image
                      src="/logo-white.svg"
                      alt="Nobile"
                      width={91}
                      height={24}
                      className="md:hidden"
                      priority
                    />
                    {/* Desktop: logo normal */}
                    <Image
                      src="/logo.svg"
                      alt="Nobile"
                      width={120}
                      height={30}
                      className="hidden md:block w-[120px] h-[30px]"
                      priority
                    />
                  </>
                )}

                {/* Outras páginas - Desktop */}
                {!isVendedorPage && (
                  <Image
                    src="/logo.svg"
                    alt="Nobile"
                    width={123}
                    height={33}
                    priority
                    className="hidden md:block"
                  />
                )}

                {/* Outras páginas - Mobile */}
                {!isVendedorPage && (
                  <Image
                    src="/logo-mobile.svg"
                    alt="Nobile"
                    width={92}
                    height={25}
                    priority
                    className="block md:hidden"
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
            <div className="hidden md:flex items-center gap-8">
              {/* SearchBar sempre presente no desktop */}
              <SearchBar className="md:w-[420px]" />

              {isAuthenticated && user ? (
                <UserMenu
                  user={user}
                  logout={useMockData ? mockLogout : logout}
                />
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
                <Link href="/account/profile">
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
                      {getInitials(user?.name)}
                    </span>
                  </div>
                </Link>
              ) : null}

              <button
                type="button"
                className="p-0"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <SquareX
                    className={`h-6 w-6 ${
                      isVendedorPage
                        ? "text-white lg:text-pb-500"
                        : "text-pb-500"
                    }`}
                  />
                ) : (
                  <svg
                    width="24"
                    height="18"
                    viewBox="0 0 24 18"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 ${
                      isVendedorPage
                        ? "text-white lg:text-pb-500"
                        : "text-pb-500"
                    }`}
                  >
                    <path
                      d="M24 9C24 9.26522 23.8946 9.51957 23.7071 9.70711C23.5196 9.89464 23.2652 10 23 10H1C0.734784 10 0.48043 9.89464 0.292893 9.70711C0.105357 9.51957 0 9.26522 0 9C0 8.73478 0.105357 8.48043 0.292893 8.29289C0.48043 8.10536 0.734784 8 1 8H23C23.2652 8 23.5196 8.10536 23.7071 8.29289C23.8946 8.48043 24 8.73478 24 9ZM1 2H23C23.2652 2 23.5196 1.89464 23.7071 1.70711C23.8946 1.51957 24 1.26522 24 1C24 0.734784 23.8946 0.48043 23.7071 0.292893C23.5196 0.105357 23.2652 0 23 0H1C0.734784 0 0.48043 0.105357 0.292893 0.292893C0.105357 0.48043 0 0.734784 0 1C0 1.26522 0.105357 1.51957 0.292893 1.70711C0.48043 1.89464 0.734784 2 1 2ZM23 16H1C0.734784 16 0.48043 16.1054 0.292893 16.2929C0.105357 16.4804 0 16.7348 0 17C0 17.2652 0.105357 17.5196 0.292893 17.7071C0.48043 17.8946 0.734784 18 1 18H23C23.2652 18 23.5196 17.8946 23.7071 17.7071C23.8946 17.5196 24 17.2652 24 17C24 16.7348 23.8946 16.4804 23.7071 16.2929C23.5196 16.1054 23.2652 16 23 16Z"
                      fill="currentColor"
                    />
                  </svg>
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
    </div>
  );
}
