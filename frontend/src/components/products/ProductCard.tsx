"use client";

import { stringToSlug } from "@/lib/utils/stringUtils";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ProductImage } from "./ProductImage";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

// Componente para o header com marca + botão favoritar (reutilizável)
function ProductHeader({
  product,
  isFavorited,
  onToggleFavorite,
  productUrl,
}: {
  product: Product;
  isFavorited: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  productUrl: string;
}) {
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <p className="font-erstoria text-base lg:text-lg text-[#D5A60A] leading-[22px] tracking-[-0.01em]">
          {product.brand}
        </p>
      </div>
      <Link href={productUrl}>
        <h3 className="font-erstoria text-xl lg:text-2xl leading-[31px] mb-2">
          {product.model}
        </h3>
        <p className="text-xs lg:text-base text-gray-400 leading-[22px] line-clamp-1">
          {product.description || "\u00A0"}
        </p>
      </Link>

      <button
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform"
        aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        onClick={onToggleFavorite}
      >
        <Image
          src={isFavorited ? "/icons/heart-filled.svg" : "/icons/heart-outline.svg"}
          alt={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          width={24}
          height={24}
        />
      </button>
    </>
  );
}

// Componente para o preço (reutilizável)
function ProductPrice({ price, productUrl }: { price: number; productUrl: string }) {
  return (
    <Link href={productUrl}>
      <p className="font-lato text-2xl md:text-3xl font-medium leading-[120%] text-[#141414]">
        R$ {price.toLocaleString("pt-BR")}
      </p>
    </Link>
  );
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const productUrl = `/${stringToSlug(product.brand)}/${stringToSlug(
    product.model
  )}-${product.id}`;

  // Layout em lista - desktop only
  if (viewMode === "list") {
    return (
      <>
        {/* Mobile: grid view */}
        <div
          className="lg:hidden group transition-all duration-300"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Link
            href={productUrl}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D5A60A] focus-visible:ring-offset-2 rounded-lg block mb-4"
          >
            <ProductImage
              src={product.images?.[0]}
              alt={`${product.brand} ${product.model}`}
              isHovering={isHovering}
            />
          </Link>

          <div className="relative min-h-[116px]">
            <ProductHeader
              product={product}
              isFavorited={isFavorited}
              onToggleFavorite={handleToggleFavorite}
              productUrl={productUrl}
            />
          </div>
        </div>

        {/* Desktop: list view */}
        <div
          className="hidden lg:block group transition-all duration-300 rounded-lg hover:shadow-md hover:border-gray-200 overflow-hidden"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="flex gap-6 p-0">
            {/* Image */}
            <Link
              href={productUrl}
              className="flex-shrink-0 w-[281px] h-[269px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D5A60A] focus-visible:ring-offset-2 rounded-lg"
            >
              <ProductImage
                src={product.images?.[0]}
                alt={`${product.brand} ${product.model}`}
                sizes="281px"
                isHovering={isHovering}
              />
            </Link>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between py-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <ProductHeader
                    product={product}
                    isFavorited={isFavorited}
                    onToggleFavorite={handleToggleFavorite}
                    productUrl={productUrl}
                  />
                </div>
              </div>

              {/* Price */}
              <div className="mt-4">
                <ProductPrice price={product.price} productUrl={productUrl} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Grid layout (padrão)
  return (
    <div
      className="group transition-all duration-300"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Link
        href={productUrl}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D5A60A] focus-visible:ring-offset-2 rounded-lg block mb-4"
      >
        <ProductImage
          src={product.images?.[0]}
          alt={`${product.brand} ${product.model}`}
          isHovering={isHovering}
        />
      </Link>

      <div className="relative min-h-[116px] max-h-[116px]">
        <div className="relative min-w-0">
          <Link href={productUrl}>
            <p className="font-erstoria text-sm lg:text-base text-[#D5A60A] mb-3 leading-[22px] tracking-[-0.01em]">
              {product.brand}
            </p>
            <div>
              <h3 className="text-lg lg:text-[22px] leading-6 truncate">
                {product.model}
              </h3>
              <p className="text-xs lg:text-base text-gray-400 leading-[22px] line-clamp-1">
                {product.description || "\u00A0"}
              </p>
            </div>

            <p className="text-lg lg:text-xl font-medium leading-[28px] text-pb-500 mt-2">
              R$ {product.price.toLocaleString("pt-BR")}
            </p>

            {/* Favorite button */}
            <button
              className="absolute right-0 bottom-1 flex-shrink-0 w-5 h-5 lg:w-auto lg:h-auto flex items-center justify-center hover:scale-110 transition-transform"
              aria-label={
                isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"
              }
              onClick={handleToggleFavorite}
            >
              <Image
                src={isFavorited ? "/icons/heart-filled.svg" : "/icons/heart-outline.svg"}
                alt={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                width={24}
                height={24}
              />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
