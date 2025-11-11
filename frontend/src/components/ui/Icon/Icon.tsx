"use client";

import Image from "next/image";

import { cn } from "@/lib/utils/cn";
import { useTheme } from "next-themes";

interface IconProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  hoverSrc?: string; // opcional → troca ícone no hover
  darkSrc?: string; // opcional → ícone alternativo no dark mode
  disabled?: boolean;
}

export function Icon({
  src,
  alt,
  size = 24,
  className,
  hoverSrc,
  darkSrc,
  disabled = false,
}: IconProps) {
  const { theme } = useTheme();

  const iconSrc = theme === "dark" && darkSrc ? darkSrc : src;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={iconSrc}
        alt={alt}
        width={size}
        height={size}
        style={{ height: "auto" }}
        className={cn(
          "object-contain transition-transform duration-200",
          hoverSrc && "group-hover:opacity-0"
        )}
        priority={false}
      />

      {hoverSrc && (
        <Image
          src={hoverSrc}
          alt={`${alt}-hover`}
          width={size}
          height={size}
          style={{ height: "auto" }}
          className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />
      )}
    </div>
  );
}
