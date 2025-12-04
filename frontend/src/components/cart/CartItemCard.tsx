"use client";

import { formatCurrency } from "@/lib/utils/format";
import { CartItem } from "@/types/cart";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// Hook para detectar se é desktop
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

interface CartItemCardProps {
  item: CartItem;
  onRemove: (itemId: string) => void;
  onCheckout: (itemId: string) => void;
}

export function CartItemCard({ item, onRemove, onCheckout }: CartItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <div
      className="relative bg-[#F7F7F7] rounded-[12px] p-4 transition-all duration-300"
      onMouseEnter={() => !isDesktop && setIsHovered(true)}
      onMouseLeave={() => !isDesktop && setIsHovered(false)}
    >
      {/* Borda dourada com transição suave */}
      <div
        className={`
          absolute inset-0 border-2 border-[#D5A60A] rounded-[12px] pointer-events-none 
          transition-opacity duration-300 ease-in-out
          ${isHovered ? "opacity-100" : "opacity-0"}
        `}
      ></div>

      {/* Botão remover */}
      <button
        onClick={() => onRemove(item.id)}
        className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors z-10"
        aria-label="Remover item"
      >
        <X className="w-4 h-4 text-[#141414]" />
      </button>

      <div className="flex gap-4 mb-4">
        {/* Imagem do relógio */}
        <div className="w-[116px] h-[116px] relative bg-[#EFEFEF] rounded-[5px] overflow-hidden flex-shrink-0">
          <Image
            src={item.watch.image}
            alt={`${item.watch.brand} ${item.watch.model}`}
            fill
            className="object-cover"
            sizes="
    (max-width: 640px) 116px,
    (max-width: 1024px) 116px,
    116px
  "
          />
        </div>

        {/* Informações do produto */}
        <div className="flex-1 min-w-0 py-2.5">
          {/* Vendedor verificado */}
          <div className="flex items-center gap-1.5 mb-3 h-4">
            {item.seller.isVerified && (
              <div className="w-4 h-4 flex-shrink-0">
                <Image
                  src="/icons/verified-badge.svg"
                  alt="Verificado"
                  width={16}
                  height={16}
                  className="w-full h-full"
                />
              </div>
            )}
            <span className="font-erstoria text-sm text-[#D5A60A] leading-[140%] tracking-[-0.01em]">
              {item.seller.name}
            </span>
          </div>

          {/* Nome do relógio */}
          <h3 className="text-lg leading-[140%] tracking-[-0.01em] mb-1 truncate">
            {item.watch.brand} {item.watch.model}
          </h3>

          {/* Condição */}
          <p className="text-sm text-[#666666] leading-[140%] tracking-[-0.01em] mb-3 truncate">
            {item.watch.condition}
          </p>

          {/* Preço */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#666666]">Total:</span>
            <span className="text-lg font-semibold">{formatCurrency(item.price)}</span>
          </div>
        </div>
      </div>

      {/* Botão "Finalizar compra" com transição suave */}
      <button
        onClick={() => onCheckout(item.id)}
        className={`
          w-full py-3.5 bg-white border-2 border-[#141414] rounded-full text-base font-medium 
          transition-all duration-500 ease-in-out
          hover:bg-[#141414] hover:text-white
          ${isHovered || isDesktop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}
        `}
      >
        Finalizar compra
      </button>
    </div>
  );
}
