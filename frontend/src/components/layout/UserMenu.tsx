"use client";

import { User } from "@/lib/auth/auth";
import { USER_MENU_ITEMS } from "@/lib/config/user-menu-items";
import { getInitials } from "@/lib/utils/stringUtils";
import { X } from "lucide-react";
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
    (item) => item.section === "gerenciamento"
  );
  const meusDadosItems = USER_MENU_ITEMS.filter(
    (item) => item.section === "meusDados"
  );
  const opcoesItems = USER_MENU_ITEMS.filter(
    (item) => item.section === "opcoes"
  );

  useEffect(() => {
    const handleLogoutRequest = () => logout();
    window.addEventListener("logout-request", handleLogoutRequest);
    return () =>
      window.removeEventListener("logout-request", handleLogoutRequest);
  }, [logout]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity outline-none"
        aria-label="Menu do usuário"
      >
        <div className="relative flex items-center justify-center">
          <span className="relative inline-flex items-center justify-center align-middle overflow-hidden select-none w-10 h-10 rounded-full bg-[#D5A60A] p-0 border-0 transition-colors duration-200">
            <div className="font-lato text-[13px] leading-[133%] font-medium text-white">
              {getInitials(user?.name)}
            </div>
          </span>
        </div>
        {isOpen ? (
          <X className="size-8 text-pb-500" strokeWidth={1.5} />
        ) : (
          <Image src="/icons/menu.svg" alt="" width={32} height={32} />
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel - Ajustado para não cobrir a search bar */}
          <div className="absolute -right-8 top-full mt-6 z-50 bg-white shadow-lg w-screen max-w-7xl">
            <div className="bg-white mx-auto px-5 sm:px-6 lg:px-8 ">
              <div className="bg-white py-[48px] overflow-hidden">
                {/* Grid Layout */}
                <div className="grid grid-cols-[auto_1fr_auto] gap-4">
                  {/* Gerenciamento Section */}
                  <div className="min-w-0">
                    <div className="mb-3">
                      <h3 className="font-lato text-[14px] font-normal text-[#141414] leading-[148%] whitespace-nowrap">
                        Gerenciamento
                      </h3>
                    </div>
                    <div className="flex flex-nowrap gap-4">
                      {gerenciamentoItems.map((item) => (
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
                      <h3 className="font-lato text-[14px] font-normal leading-[148%] whitespace-nowrap">
                        Meus dados
                      </h3>
                    </div>
                    <div className="flex flex-nowrap gap-4">
                      {meusDadosItems.map((item) => (
                        <MenuItemButton
                          key={`meus-dados-${item.label}`}
                          item={item}
                          onClick={() => setIsOpen(false)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Opções Section */}
                  <div className="min-w-0 flex-shrink-0">
                    <div className="mb-3">
                      <h3 className="font-lato text-[14px] font-normal leading-[148%] whitespace-nowrap">
                        Opções
                      </h3>
                    </div>
                    <div className="flex flex-nowrap gap-4">
                      {opcoesItems.map((item) => (
                        <MenuItemButton
                          key={item.label}
                          item={item}
                          isLogout={item.label === "Sair"}
                          onClick={() => {
                            if (item.label === "Sair") {
                              logout();
                            }
                            setIsOpen(false);
                          }}
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

interface MenuItemButtonProps {
  item: MenuItem;
  onClick: () => void;
  isLogout?: boolean;
}

function MenuItemButton({ item, onClick, isLogout }: MenuItemButtonProps) {
  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-2 p-4 bg-[#F7F7F7] border border-[#EFEFEF] rounded-[12px] hover:bg-gray-100 transition-colors cursor-pointer h-[88px] ${isLogout ? "w-[120px]" : "w-[164px]"}`}
    >
      <Image src={item.icon} alt={item.label} width={24} height={24} />
      <span
        className={`font-lato text-xs font-medium text-center leading-[148%] ${isLogout ? "text-[#D23423]" : "text-[#141414]"}`}
      >
        {item.label}
      </span>
    </div>
  );

  if (isLogout) {
    return (
      <button onClick={onClick} className="text-left">
        {content}
      </button>
    );
  }

  return (
    <Link href={item.href} onClick={onClick}>
      {content}
    </Link>
  );
}
