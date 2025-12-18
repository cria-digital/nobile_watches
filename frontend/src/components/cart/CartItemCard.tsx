// src/components/cart/CartItemCard.tsx
"use client";

import { Button } from "@/components/ui/Button";
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

export function CartItemCard({
  item,
  onRemove,
  onCheckout,
}: CartItemCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemove(item.id);
    // O estado será resetado quando o componente for desmontado
  };

  const hasImage = item?.watch?.image && item.watch?.image?.length > 0;

  return (
    <div className="relative border border-[#EFEFEF] rounded-[12px] p-4 transition-all hover:shadow-sm">
      {/* Overlay de loading ao remover */}
      <div
        className={`
          absolute inset-0 bg-white/80 rounded-[12px] z-20
          flex items-center justify-center
          transition-opacity duration-200
          ${isRemoving ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-[#D5A60A] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-600">Removendo...</span>
        </div>
      </div>

      {/* Botão remover */}
      <button
        onClick={handleRemove}
        disabled={isRemoving}
        className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors z-10 disabled:opacity-50"
        aria-label="Remover item"
      >
        <X className="w-4 h-4 text-[#141414]" />
      </button>

      <div className="flex gap-4 mb-4 pr-8">
        {/* Imagem do relógio */}
        <div className="w-[116px] h-[116px] relative bg-[#EFEFEF] rounded-[5px] overflow-hidden flex-shrink-0">
          {hasImage ? (
            <Image
              src={item.watch.image}
              alt={`${item.watch.brand} ${item.watch.model}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 116px, (max-width: 1024px) 116px, 116px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-sm">Sem imagem</span>
            </div>
          )}
        </div>

        {/* Informações do produto */}
        <div className="flex-1 min-w-0 py-2.5">
          {/* Vendedor verificado */}
          <div className="flex items-center gap-1.5 mb-3 h-4 min-w-0">
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
            <span className="font-erstoria text-sm text-[#D5A60A] leading-[140%] tracking-[-0.01em] truncate">
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
            <span className="text-lg font-semibold">
              {formatCurrency(item.price)}
            </span>
          </div>
        </div>
      </div>

      {item?.listing.status === "ACTIVE" && (
        <Button
          onClick={() => onCheckout(item.id)}
          variant="stroke"
          className="w-full"
          disabled={isRemoving}
        >
          Finalizar compra
        </Button>
      )}
    </div>
  );
}
