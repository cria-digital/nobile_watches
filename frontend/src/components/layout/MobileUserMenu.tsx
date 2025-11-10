"use client";

import { USER_MENU_ITEMS } from "@/config/user-menu-items";
import { useAuth } from "@/lib/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/Button";
import { SearchBar } from "./SearchBar";

interface MobileUserMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileUserMenu({ isOpen, onClose }: MobileUserMenuProps) {
  const { isAuthenticated, mockLogin, mockLogout } = useAuth();

  const gerenciamentoItems = USER_MENU_ITEMS.filter(
    item => item.section === "gerenciamento"
  );
  const meusDadosItems = USER_MENU_ITEMS.filter(item => item.section === "meusDados");
  const opcoesItems = USER_MENU_ITEMS.filter(item => item.section === "opcoes");

  const handleClick = (e: React.MouseEvent) => {
    onClose(); // fecha o menu

    e.preventDefault(); // impede redirecionamento
    mockLogout(); // executa logout
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[9998] md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 right-0 bg-white z-[9999] overflow-y-auto md:hidden">
        {/* Header do menu */}
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/" onClick={onClose}>
            <Image src="/logo.svg" alt="Nobile" width={91} height={24} priority />
          </Link>

          <button
            onClick={onClose}
            className="w-auto h-auto flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Fechar menu"
          >
            <Image src="/icons/XSquare.svg" alt="Fechar" width={32} height={32} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 py-4">
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
                {gerenciamentoItems.map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className="flex flex-col items-center justify-center gap-2 sm:gap-2.5 p-3 sm:p-4 bg-[#F7F7F7] border border-[#EFEFEF] rounded-[12px] hover:bg-gray-100 transition-colors min-w-0"
                  >
                    <Image src={item.icon} alt={item.label} width={24} height={24} />
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
                {meusDadosItems.map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-[#F7F7F7] border border-[#EFEFEF] rounded-[12px] hover:bg-gray-100 transition-colors min-w-0"
                  >
                    <Image src={item.icon} alt={item.label} width={24} height={24} />
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
                {opcoesItems.map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={handleClick}
                    className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-[#F7F7F7] border border-[#EFEFEF] rounded-[12px] hover:bg-gray-100 transition-colors min-w-0"
                  >
                    <Image src={item.icon} alt={item.label} width={24} height={24} />
                    <span className="font-lato text-xs font-medium text-red-600 text-center line-clamp-2">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* DEV ONLY: Simular Logout - apenas no mobile */}
            <div className="mt-6 py-6 border-t border-gray-200">
              <button
                onClick={() => {
                  mockLogout();
                  onClose();
                }}
                className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                [DEV] Simular Logout
              </button>
            </div>
          </div>
        ) : (
          // Menu para usuário não autenticado
          <div className="px-5 pb-6 space-y-4">
            <Link
              href="/#"
              onClick={onClose}
              className="block font-lato text-base font-medium text-gray-700 hover:text-gray-900 py-2"
            >
              Perguntas frequentes
            </Link>
            <Link
              href="/vendedor"
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

              <Link href="/cadastro">
                <Button
                  variant="outline"
                  size="default"
                  className="h-[56px] w-full font-bold leading-[150%] tracking-[0.02em] whitespace-nowrap"
                >
                  Cadastro
                </Button>
              </Link>
            </div>
            {/* DEV ONLY: Simular Login */}
            <div className="pt-4 space-y-3">
              <button
                onClick={() => {
                  mockLogin();
                  onClose();
                }}
                className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                [DEV] Simular Login
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
