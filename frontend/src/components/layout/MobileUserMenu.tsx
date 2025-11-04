"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Heart,
  LogOut,
  ShoppingBag,
  ShoppingCart,
  Store,
  Tag,
  User,
  Watch,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/Button";
import { SearchBar } from "./SearchBar";

interface MobileUserMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  section: "gerenciamento" | "meusDados" | "opcoes";
}

const menuItems: MenuItem[] = [
  // Gerenciamento
  {
    icon: ShoppingCart,
    label: "Meu carrinho",
    href: "#",
    section: "gerenciamento",
  },
  {
    icon: ShoppingBag,
    label: "Minhas compras",
    href: "/minhas-compras",
    section: "gerenciamento",
  },
  {
    icon: Heart,
    label: "Lista de desejos",
    href: "#",
    section: "gerenciamento",
  },
  {
    icon: Watch,
    label: "Minha coleção",
    href: "/colecao",
    section: "gerenciamento",
  },
  // Meus dados
  {
    icon: User,
    label: "Meu perfil",
    href: "/perfil",
    section: "meusDados",
  },
  {
    icon: Store,
    label: "Vender",
    href: "/vendedor",
    section: "meusDados",
  },
  {
    icon: Tag,
    label: "Meus anúncios",
    href: "/meus-anuncios",
    section: "meusDados",
  },
  // Opções
  {
    icon: LogOut,
    label: "Sair",
    href: "#",
    section: "opcoes",
  },
];

export function MobileUserMenu({ isOpen, onClose }: MobileUserMenuProps) {
  const { isAuthenticated, mockLogin, mockLogout } = useAuth();

  const gerenciamentoItems = menuItems.filter(item => item.section === "gerenciamento");
  const meusDadosItems = menuItems.filter(item => item.section === "meusDados");
  const opcoesItems = menuItems.filter(item => item.section === "opcoes");

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
        <div className="flex h-16 items-center justify-between px-5 border-b border-gray-200">
          <Link href="/" onClick={onClose}>
            <Image
              src="/logo.svg"
              alt="Nobile"
              width={120}
              height={30}
              className="w-[91px] h-[24px]"
              priority
            />
          </Link>
          <button onClick={onClose} className="p-2 -mr-2" aria-label="Fechar menu">
            <XMarkIcon className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 py-4">
          <SearchBar />
        </div>

        {/* Menu Content */}
        {isAuthenticated ? (
          <div className="px-5 pb-6 mt-1">
            {/* Gerenciamento */}
            <div className="mb-6">
              <h3 className="font-lato text-sm font-normal text-[#141414] mb-4">
                Gerenciamento
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {gerenciamentoItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className="flex flex-col items-center justify-center gap-3 p-4 bg-[#F7F7F7] border border-[#EFEFEF] rounded-[12px] hover:bg-gray-100 transition-colors"
                    >
                      <Icon className="w-6 h-6 text-[#141414]" strokeWidth={1.5} />
                      <span className="font-lato text-xs font-medium text-[#141414] text-center leading-[148%]">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Meus dados */}
            <div className="mb-6">
              <h3 className="font-lato text-sm font-normal text-[#141414] mb-4">
                Meus dados
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {meusDadosItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className="flex flex-col items-center justify-center gap-3 p-4 bg-[#F7F7F7] border border-[#EFEFEF] rounded-[12px] hover:bg-gray-100 transition-colors"
                    >
                      <Icon className="w-6 h-6 text-[#141414]" strokeWidth={1.5} />
                      <span className="font-lato text-xs font-medium text-[#141414] text-center leading-[148%]">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Opções */}
            <div>
              <h3 className="font-lato text-sm font-normal text-[#141414] mb-4">
                Opções
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {opcoesItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className="flex flex-col items-center justify-center gap-3 p-4 bg-[#F7F7F7] border border-[#EFEFEF] rounded-[12px] hover:bg-gray-100 transition-colors"
                    >
                      <Icon className="w-6 h-6 text-red-600" strokeWidth={1.5} />
                      <span className="font-lato text-xs font-medium text-red-600 text-center">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* DEV ONLY: Simular Logout - apenas no mobile */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              {/* <button
                onClick={() => {
                  mockLogout();
                  onClose();
                }}
                className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                [DEV] Simular Logout
              </button> */}
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
