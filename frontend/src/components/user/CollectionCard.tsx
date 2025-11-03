"use client";

import { stringToSlug } from "@/lib/utils/stringUtils";
import { CollectionItem } from "@/types/collection";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/Button";

interface CollectionCardProps {
  item: CollectionItem;
  onRemove?: (watchId: number) => void;
}

export function CollectionCard({ item, onRemove }: CollectionCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const { watch, estimatedValue, priceChange } = item;
  const displayPrice = estimatedValue || watch.price;

  const productUrl = `/${stringToSlug(watch.brand)}/${stringToSlug(watch.model)}-${watch.id}`;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev === 0 ? watch.images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev === watch.images.length - 1 ? 0 : prev + 1));
  };

  const specs = [
    watch.caseMaterial,
    watch.glassType,
    watch.caseDiameter ? `${watch.caseDiameter}mm` : null,
  ].filter(Boolean);

  return (
    <div className="w-full bg-[#f7f7f7] rounded-2xl overflow-hidden lg:flex">
      {/* Imagem com navegação */}
      <div className="relative aspect-square bg-gradient-to-b from-transparent to-[#0D0D0D]/50 overflow-hidden lg:w-[50%] lg:h-[600px]">
        <Image
          src={watch.images[currentImageIndex] || "/images/placeholder-watch.jpg"}
          alt={`${watch.brand} ${watch.model}`}
          fill
          className="object-cover"
        />

        {/* Botões de navegação de imagem - apenas se houver múltiplas imagens */}
        {watch.images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
              aria-label="Imagem anterior"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="#141414"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
              aria-label="Próxima imagem"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="#141414"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Indicadores de imagem */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {watch.images.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all ${
                    index === currentImageIndex ? "w-6 bg-[#D5A60A]" : "w-1 bg-white/30"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-6 lg:p-8 lg:w-[41%]">
        {/* Header com marca e modelo */}
        <div className="mb-4">
          <Link href={productUrl}>
            <h3 className="font-erstoria text-2xl lg:text-[32px] leading-[120%] mb-2">
              {watch.brand}
            </h3>
            <p className="font-erstoria text-xl lg:text-2xl leading-[120%]">
              {watch.model}
            </p>
          </Link>
        </div>

        {/* Preço e valorização */}
        <div className="mb-6">
          <div className="flex items-end gap-3 mb-2">
            <p className="font-lato text-[18px] font-semibold">
              R$ {displayPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            {priceChange && (
              <div className="flex items-center gap-2">
                {/* Mini gráfico de tendência */}
                <svg
                  width="32"
                  height="16"
                  viewBox="0 0 32 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0"
                >
                  <path
                    d="M0 16L8 8L16 12L24 4L32 6"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-lato text-base font-semibold text-[#10B981]">
                  +{priceChange.percentage}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Especificações */}
        <div className="flex gap-4 mb-6">
          {specs.map((spec, index) => (
            <div key={index} className="px-4 py-2 bg-white/5 rounded-lg backdrop-blur-sm">
              <p className="font-lato text-sm">{spec}</p>
            </div>
          ))}
        </div>

        {/* Descrição */}
        <div className="mb-6">
          <p
            className={`font-lato text-sm lg:text-base leading-[160%] ${
              !showFullDescription ? "line-clamp-3" : ""
            }`}
          >
            {watch.description}
          </p>
          {watch.description && watch.description.length > 200 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="font-lato text-sm text-[#D5A60A] hover:text-[#F0B90B] transition-colors mt-2"
            >
              {showFullDescription ? "Ver menos" : "Ver mais"}
            </button>
          )}
        </div>

        {/* Botão de ação */}
        <Link href={productUrl} className="w-full">
          <Button variant="gold" className="w-full">
            Ver detalhes
          </Button>
        </Link>
      </div>
    </div>
  );
}
