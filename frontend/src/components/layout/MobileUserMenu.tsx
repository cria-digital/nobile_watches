"use client";

import { USER_MENU_ITEMS } from "@/lib/config/user-menu-items";
import { useAuth } from "@/lib/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "../ui/Button";
import { SearchBar } from "./SearchBar";

interface MobileUserMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export function MobileUserMenu({ isOpen, onClose }: MobileUserMenuProps) {
  const { isAuthenticated, mockLogout, logout } = useAuth();

  const gerenciamentoItems = USER_MENU_ITEMS.filter(
    (item) => item.section === "gerenciamento"
  );
  const meusDadosItems = USER_MENU_ITEMS.filter(
    (item) => item.section === "meusDados"
  );
  const opcoesItems = USER_MENU_ITEMS.filter(
    (item) => item.section === "opcoes"
  );

  const handleClick = (e: React.MouseEvent) => {
    onClose();

    e.preventDefault();
    useMockData ? mockLogout() : logout();
  };

  // Prevenir scroll do body quando o menu está aberto
  useEffect(() => {
    if (isOpen) {
      // Salvar a posição atual do scroll
      const scrollY = window.scrollY;

      // Adicionar classes para prevenir scroll
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      // Restaurar scroll quando fechar
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[9998] lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-0 bg-white z-[9999] md:hidden h-screen overflow-y-auto">
        {/* Header do menu */}
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/" onClick={onClose}>
            <Image
              src="/logo.svg"
              alt="Nobile"
              width={91}
              height={24}
              priority
            />
          </Link>

          <button
            onClick={onClose}
            className="w-auto h-auto flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Fechar menu"
          >
            <Image
              src="/icons/close-icon.svg"
              alt="Fechar"
              width={32}
              height={32}
            />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 pb-4">
          <SearchBar />
        </div>

        {/* Menu Content */}
        {isAuthenticated ? (
          <div className="px-5 mt-1">
            {/* Gerenciamento */}
            <div className="mb-6">
              <h3 className="font-lato text-sm font-normal text-[#141414] mb-4">
                Gerenciamento
              </h3>
              <div className="grid grid-cols-3 gap-2 min-w-0">
                {gerenciamentoItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className="flex flex-col items-center justify-center gap-2 sm:gap-2.5 p-3 sm:p-4 bg-[#F7F7F7] border border-[#EFEFEF] rounded-[12px] hover:bg-gray-100 transition-colors min-w-0"
                  >
                    <Image
                      src={item.icon}
                      alt={item.label}
                      width={24}
                      height={24}
                    />
                    <span className="font-lato text-xs font-medium text-[#141414] text-center leading-[148%] line-clamp-2">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Meus dados */}
            <div className="mb-6">
              <h3 className="font-lato text-sm font-normal text-[#141414] mb-4">
                Meus dados
              </h3>
              <div className="grid grid-cols-3 gap-2 min-w-0">
                {meusDadosItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-[#F7F7F7] border border-[#EFEFEF] rounded-[12px] hover:bg-gray-100 transition-colors min-w-0"
                  >
                    <Image
                      src={item.icon}
                      alt={item.label}
                      width={24}
                      height={24}
                    />
                    <span className="font-lato text-xs font-medium text-[#141414] text-center leading-[148%] line-clamp-2">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Opções */}
            <div>
              <h3 className="font-lato text-sm font-normal text-[#141414] mb-4">
                Opções
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 min-w-0">
                {opcoesItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={handleClick}
                    className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-[#F7F7F7] border border-[#EFEFEF] rounded-[12px] hover:bg-gray-100 transition-colors min-w-0"
                  >
                    <Image
                      src={item.icon}
                      alt={item.label}
                      width={24}
                      height={24}
                    />
                    <span className="font-lato text-xs font-medium text-red-600 text-center line-clamp-2">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Menu para usuário não autenticado
          <div className="px-5 pb-6 space-y-4">
            <Link
              href="/become-a-seller#duvidas-frequentes"
              onClick={onClose}
              className="block font-lato text-base font-medium text-gray-700 hover:text-gray-900 py-2"
            >
              Perguntas frequentes
            </Link>
            <Link
              href={isAuthenticated ? "/account/listings" : "/become-a-seller"}
              onClick={onClose}
              className="block font-lato text-base font-medium text-gray-700 hover:text-gray-900 py-2"
            >
              Vender meu relógio
            </Link>
            <div className="py-4">
              <Link href="/login">
                <Button
                  variant="gold"
                  size="default"
                  className="h-[56px] w-full font-bold leading-[150%] tracking-[0.02em] whitespace-nowrap mb-2.5"
                >
                  Login
                </Button>
              </Link>

              <Link href="/sign-up">
                <Button
                  variant="outline"
                  size="default"
                  className="h-[56px] w-full font-bold leading-[150%] tracking-[0.02em] whitespace-nowrap"
                >
                  Cadastro
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
