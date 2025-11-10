"use client";

import { User } from "@/lib/auth/auth";
import { USER_MENU_ITEMS } from "@/lib/config/user-menu-items";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface UserMenuProps {
  user: User;
  logout: () => void;
}

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  section: "gerenciamento" | "meusDados" | "opcoes";
}

export function UserMenu({ user, logout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const gerenciamentoItems = USER_MENU_ITEMS.filter(
    item => item.section === "gerenciamento"
  );
  const meusDadosItems = USER_MENU_ITEMS.filter(item => item.section === "meusDados");
  const opcoesItems = USER_MENU_ITEMS.filter(item => item.section === "opcoes");

  // Avatar padrão se não houver
  const avatarUrl = user.avatar || "/images/avatar-placeholder2.jpg";

  useEffect(() => {
    const handleLogoutRequest = () => logout();
    window.addEventListener("logout-request", handleLogoutRequest);
    return () => window.removeEventListener("logout-request", handleLogoutRequest);
  }, [logout]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        aria-label="Menu do usuário"
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
          <Image src={avatarUrl} alt={user.name} fill className="object-cover" />
        </div>

        {isOpen ? (
          <XMarkIcon className="h-6 w-6 text-gray-900" />
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-gray-900"
          >
            <path
              d="M3 12H21M3 6H21M3 18H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Full Width Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Menu Panel - Fixed positioning aligned with header */}
          <div className="absolute right-0 top-full z-50 bg-white shadow-lg w-screen max-w-7xl">
            <div className="bg-white mx-auto px-5 sm:px-6 lg:px-8">
              <div className="bg-white py-[48px] overflow-hidden">
                {/* Grid Layout */}
                <div className="grid grid-cols-[auto_1fr_auto] gap-3">
                  {/* Gerenciamento Section */}
                  <div className="min-w-0">
                    <div className="mb-3">
                      <h3 className="font-lato text-[14px] font-normal text-[#141414] leading-[148%] whitespace-nowrap">
                        Gerenciamento
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {gerenciamentoItems.map(item => (
                        <MenuItemButton
                          key={item.label}
                          item={item}
                          onClick={() => setIsOpen(false)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Meus Dados Section */}
                  <div className="min-w-0">
                    <div className="mb-3">
                      <h3 className="font-lato text-[14px] font-normal text-[#141414] leading-[148%] whitespace-nowrap">
                        Meus dados
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {meusDadosItems.map(item => (
                        <MenuItemButton
                          key={`meus-dados-${item.label}`}
                          item={item}
                          onClick={() => setIsOpen(false)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Opções Section */}
                  <div className="min-w-0">
                    <div className="mb-3">
                      <h3 className="font-lato text-[14px] font-normal text-[#141414] leading-[148%] whitespace-nowrap">
                        Opções
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {opcoesItems.map(item => (
                        <MenuItemButton
                          key={`opcoes-${item.label}-${item.href}`}
                          item={item}
                          onClick={() => setIsOpen(false)}
                          isLogout={item.label === "Sair"}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MenuItemButton({
  item,
  onClick,
  isLogout = false,
}: {
  item: MenuItem;
  onClick: () => void;
  isLogout?: boolean;
}) {
  const handleClick = (e: React.MouseEvent) => {
    onClick(); // Fecha o menu
    if (isLogout) {
      e.preventDefault(); // Impede a navegação automática do Link
      const event = new CustomEvent("logout-request");
      window.dispatchEvent(event);
    }
  };

  return (
    <Link
      href={item.href}
      onClick={handleClick}
      className={`flex flex-col items-center justify-center gap-2 border border-[#EFEFEF] rounded-[12px] px-8 py-6 bg-[#F7F7F7] hover:bg-gray-50 transition-colors min-w-[140px] ${
        isLogout ? "text-red-600 hover:bg-red-50" : "text-pb-500"
      }`}
    >
      <Image src={item.icon} alt={item.label} width={26} height={26} />
      <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
    </Link>
  );
}
