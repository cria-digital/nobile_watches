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
    <div className="w-full rounded-2xl overflow-hidden lg:flex lg:rounded-none">
      {/* Imagem com navegação */}
      <div className="relative aspect-square bg-gradient-to-b from-transparent to-[#0D0D0D]/50 overflow-hidden lg:w-[50%] lg:h-[600px] lg:rounded-2xl">
        <Image
          src={watch.images[currentImageIndex] || "/images/placeholder-watch.jpg"}
          alt={`${watch.brand} ${watch.model}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />

        {/* Botões de navegação de imagem - apenas se houver múltiplas imagens */}
      </div>

      {/* Conteúdo */}
      <div className="py-6 lg:py-1 lg:px-8 lg:pt-[120px] lg:w-[41%]">
        {/* Header com marca e modelo */}

        <div className="mb-5">
          <h3 className="font-erstoria text-xl text-[#D5A60A] leading-[120%] mb-2">
            {watch.brand}
          </h3>
          <p className="font-erstoria text-xl lg:text-3xl leading-[120%]">
            {watch.model}
          </p>
        </div>

        {/* Preço e valorização */}
        <div className="mb-6">
          <div className="flex items-end justify-between h-5 mb-2">
            <p className="font-lato text-[18px]">
              R$ {displayPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            {priceChange && (
              <div className="flex items-center gap-6">
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
                <div className="flex items-center h-5 px-2.5 rounded-lg bg-[#edf8f0]">
                  <span className="text-xs text-[#17A83D]">
                    +{priceChange.percentage}%
                  </span>
                </div>
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
            className={`text-sm text-gray-400 leading-[160%] ${
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
