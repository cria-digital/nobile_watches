"use client";

import Image from "next/image";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import { useEffect, useRef, useState } from "react";

interface ImageZoomProps {
  images: string[];
  selectedIndex: number;
  alt: string;
  onIndexChange?: (index: number) => void;
}

export function ImageZoom({ images, selectedIndex, alt, onIndexChange }: ImageZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<PhotoSwipeLightbox | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const lightbox = new PhotoSwipeLightbox({
      gallery: "#image-zoom-gallery",
      children: "a",
      pswpModule: () => import("photoswipe"),
      showHideAnimationType: "zoom",
      bgOpacity: 0.95,
      preload: [1, 2],
    });

    // Evento quando o índice muda no PhotoSwipe
    lightbox.on("change", () => {
      if (onIndexChange && lightbox.pswp) {
        onIndexChange(lightbox.pswp.currIndex);
      }
    });

    lightbox.init();
    lightboxRef.current = lightbox;

    return () => {
      lightbox.destroy();
      lightboxRef.current = null;
    };
  }, [onIndexChange]);

  // Atualiza a posição do mouse para o efeito de zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
  };

  return (
    <div
      id="image-zoom-gallery"
      ref={containerRef}
      className="relative w-full aspect-square rounded-[8px] lg:rounded-[15.69px] bg-[#efefef] overflow-hidden group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      {images.map((image, index) => {
        const isSelected = index === selectedIndex;

        return (
          <a
            key={index}
            href={image}
            data-pswp-width="1200"
            data-pswp-height="1200"
            target="_blank"
            rel="noreferrer"
            className={isSelected ? "block w-full h-full" : "hidden"}
            onClick={e => {
              e.preventDefault();
              if (lightboxRef.current) {
                lightboxRef.current.loadAndOpen(selectedIndex);
              }
            }}
          >
            <div className="relative w-full h-full cursor-zoom-in">
              <Image
                src={image}
                alt={`${alt} - Imagem ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className={`object-cover transition-transform duration-300 ${
                  isHovering ? "scale-150" : "scale-100"
                }`}
                style={{
                  transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                }}
                quality={75}
                priority={index === 0}
              />

              {/* Overlay de indicação de zoom */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 pointer-events-none" />

              {/* Ícone de zoom no canto */}
              <div className="absolute top-4 right-4 bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-700"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                  <path d="M11 8v6" />
                  <path d="M8 11h6" />
                </svg>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
