"use client";

import { Package } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ProductImageProps {
  src?: string | undefined;
  alt: string;
  sizes?: string;
  aspectRatio?: "square" | "landscape";
  isHovering?: boolean;
}

export function ProductImage({
  src,
  alt,
  sizes = "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw",
  aspectRatio = "square",
  isHovering = false,
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const hasImage = src && src.trim() !== "";
  const showFallback = !hasImage || imageError;

  const aspectClass = aspectRatio === "landscape" ? "aspect-video" : "aspect-square";

  return (
    <div className={`relative ${aspectClass} rounded-lg bg-[#EFEFEF] overflow-hidden`}>
      {!showFallback ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          onError={() => setImageError(true)}
          className={`object-cover transition-transform duration-500 ease-out ${
            isHovering ? "scale-105" : "scale-100"
          }`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#EFEFEF] to-[#E0E0E0]">
          <Package size={48} className="text-gray-300" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}
