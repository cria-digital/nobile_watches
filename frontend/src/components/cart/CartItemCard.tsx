"use client";

import { formatCurrency } from "@/lib/utils/format";
import { CartItem } from "@/types/cart";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface CartItemCardProps {
  item: CartItem;
  onRemove: (itemId: string) => void;
  onCheckout: (itemId: string) => void;
}

export function CartItemCard({ item, onRemove, onCheckout }: CartItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative bg-[#F7F7F7] rounded-[12px] p-4 transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Borda dourada no hover */}
      {isHovered && (
        <div className="absolute inset-0 border-2 border-[#D5A60A] rounded-[12px] pointer-events-none" />
      )}

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
            className="object-contain p-2"
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

      {/* Botão "Finalizar compra" que aparece no hover */}
      {isHovered && (
        <button
          onClick={() => onCheckout(item.id)}
          className="w-full py-3.5 bg-white border-2 border-[#141414] rounded-full text-base font-medium transition-all hover:bg-[#141414] hover:text-white"
        >
          Finalizar compra
        </button>
      )}
    </div>
  );
}
