"use client";

import { stringToSlug } from "@/lib/utils/stringUtils";
import { Product } from "@/types/product";
import { cva } from "class-variance-authority";
import Link from "next/link";
import { useState } from "react";
import { WishlistButton } from "../ui/Button/WishlistButton";
import { ProductImage } from "./ProductImage";

export const descriptionText = cva("text-gray-400 leading-[22px]", {
  variants: {
    mode: {
      grid: "text-xs lg:text-base line-clamp-1",
      listMobile: "text-xs lg:text-base line-clamp-1",
      listDesktop: "text-xs lg:text-base line-clamp-3",
    },
  },
  defaultVariants: {
    mode: "grid",
  },
});

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

// Header reutilizável
function ProductHeader({
  product,
  productUrl,
  descriptionMode,
}: {
  product: Product;
  productUrl: string;
  descriptionMode: "grid" | "listMobile" | "listDesktop";
}) {
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <p className="font-erstoria text-base lg:text-lg text-[#D5A60A] leading-[22px] tracking-[-0.01em] truncate">
          {product.brand}
        </p>
      </div>

      <Link href={productUrl}>
        <h3 className="font-erstoria text-xl lg:text-2xl leading-[31px] mb-2">
          {product.model}
        </h3>

        <p className={descriptionText({ mode: descriptionMode })}>
          {product?.customTitleSuffix || product?.description || "\u00A0"}
        </p>
      </Link>
    </>
  );
}

function ProductPrice({ price, productUrl }: { price: number; productUrl: string }) {
  return (
    <Link href={productUrl}>
      <p className="font-lato text-lg lg:text-3xl font-medium leading-[120%] text-[#141414]">
        R$ {price.toLocaleString("pt-BR")}
      </p>
    </Link>
  );
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const [isHovering, setIsHovering] = useState(false);

  const productUrl = `/${stringToSlug(product.brand)}/${stringToSlug(
    product.model
  )}-${product.id}`;

  // ========== LIST VIEW ==========
  if (viewMode === "list") {
    return (
      <>
        {/* Mobile: grid-like layout dentro do modo list */}
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
              productUrl={productUrl}
              descriptionMode="listMobile"
            />

            <div className="mt-2">
              <ProductPrice price={product.price} productUrl={productUrl} />
            </div>
          </div>
        </div>

        {/* Desktop: verdadeiro list view */}
        <div
          className="hidden lg:block group transition-all duration-300 rounded-lg hover:shadow-sm overflow-hidden max-h-[270px]"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="flex gap-6">
            {/* Imagem */}
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

            {/* Conteúdo */}
            <div className="flex-1 flex flex-col justify-between py-6 pr-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <ProductHeader
                    product={product}
                    productUrl={productUrl}
                    descriptionMode="listDesktop"
                  />
                </div>
              </div>

              <div className="mt-4">
                <ProductPrice price={product.price} productUrl={productUrl} />
              </div>

              {/* Wishlist absolute no desktop */}
              <WishlistButton
                watchId={product.id}
                size="large"
                className="absolute right-0 bottom-6 w-8 h-8"
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  // ========== GRID VIEW ==========
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
            <p className="font-erstoria text-sm lg:text-base text-[#D5A60A] mb-3 leading-[22px] tracking-[-0.01em] overflow-hidden text-ellipsis whitespace-nowrap">
              {product.brand}
            </p>

            <div>
              <h3 className="text-lg lg:text-[22px] leading-6 truncate">
                {product.model}
              </h3>

              <p className={descriptionText({ mode: "grid" })}>
                {product?.customTitleSuffix || product?.description || "\u00A0"}
              </p>
            </div>

            <p className="text-lg lg:text-xl font-medium leading-[28px] text-pb-500 mt-2">
              R$ {product.price.toLocaleString("pt-BR")}
            </p>
          </Link>

          <WishlistButton
            watchId={product.id}
            size="medium"
            className="absolute right-0 bottom-[6px] w-5 h-5 lg:w-6 lg:h-6"
          />
        </div>
      </div>
    </div>
  );
}
