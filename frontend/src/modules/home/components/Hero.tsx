"use client";

import { usePersonalizedFeed } from "@/lib/hooks/usePersonalizedFeed";
import nobileService from "@/lib/services/nobile.service";

import { BrandCard } from "@/components/brand/BrandCard";

import { mockWatchBrands } from "@/data/mock/brands";
import { mockProducts } from "@/lib/data/mockProducts";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import type { EmblaCarouselType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";

import { ProductCard } from "@/components/product";
import { BrandsSkeleton } from "./BrandsSkeleton";
import { SuggestionsSkeleton } from "./SuggestionsSkeleton";

const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

const fetchBrands = async () => {
  const data = await nobileService.getBrands();
  return data;
};

const heroSlides = [
  {
    img: "/images/hero/banner1.svg",
    brand: "Rolex",
    model: "Rolex Deepsea",
    href: "/rolex/deepsea-12",
  },
  {
    img: "/images/hero/banner2.svg",
    brand: "Rolex",
    model: "Oyster Perpetual",
    href: "/rolex/oyster-perpetual-9",
  },
  {
    img: "/images/hero/banner3.svg",
    brand: "Patek Philippe",
    model: "Nautilus",
    href: "/patek-philippe/nautilus-14",
  },
  {
    img: "/images/hero/banner4.svg",
    brand: "Breitling",
    model: "Superocean Heritage",
    href: "/breitling/superocean-heritage-15",
  },
];

export function Hero() {
  // SWR Brands
  const {
    data: brandsAPI,
    isLoading: brandsLoading,
    error: brandsError,
  } = useSWR(!useMockData ? "/brands" : null, fetchBrands, {
    revalidateOnFocus: false,
  });

  const brands = useMemo(() => {
    if (useMockData) return mockWatchBrands;
    return brandsAPI || [];
  }, [brandsAPI]);

  // Personalized feed
  const {
    products: personalizedProducts,
    isLoading: loadingPersonalized,
    isError: errorPersonalized,
  } = usePersonalizedFeed({ limit: 4 });

  // Suggestions
  const suggestedProducts = useMemo(() => {
    if (useMockData) {
      return [
        mockProducts[0],
        mockProducts[16],
        mockProducts[17],
        mockProducts[14],
      ].filter((p): p is (typeof mockProducts)[0] => p !== undefined);
    }

    return personalizedProducts?.slice(0, 4) || [];
  }, [personalizedProducts]);

  // Embla
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = (api: EmblaCarouselType) => {
      setIndex(api.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);

    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5500);

    return () => {
      clearInterval(interval);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="mt-5 lg:mt-8">
      <div className="mx-auto w-full max-w-7xl px-5 lg:px-8">
        {/* ---- HERO SLIDER ---- */}
        <div className="relative h-[176px] md:h-[280px] lg:h-[518px]">
          {/* <div className="relative h-[518px] md:h-[clamp(280px,40vw,350px)] lg:h-[518px]"> */}
          <div
            ref={emblaRef}
            className="overflow-hidden h-[152px] md:h-[260px] lg:h-[480px] rounded-[16px] lg:rounded-[48px] mx-auto"
          >
            <div className="flex h-full">
              {heroSlides.map((slide, i) => (
                <div key={i} className="relative flex-[0_0_100%] h-full">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: index === i ? 1 : 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="relative h-full flex items-center justify-center"
                  >
                    <div className="relative w-full h-[152px] md:h-[260px] lg:h-[480px]">
                      <Image
                        src={slide.img}
                        alt={`${slide.brand} ${slide.model}`}
                        fill
                        priority={i === 0}
                        className="object-cover rounded-[16px] lg:rounded-[48px]"
                        sizes="(max-width: 768px) 100vw,
       (max-width: 1024px) 100vw,
       (max-width: 1280px) 100vw,
       1280px"
                      />
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="w-full flex items-center justify-center h-[38px] lg:h-[38px]">
            {/* Dots posicionados no espaço abaixo da imagem */}
            <div className="flex gap-2 lg:gap-3">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full transition-all duration-200 ${
                    index === i ? "bg-pb-500" : "bg-neutral-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ---- BRANDS ---- */}
        {!useMockData && brandsLoading && <BrandsSkeleton />}

        {(useMockData || (!brandsLoading && !brandsError)) && (
          <section className="pt-6 pb-5 lg:pt-12 lg:pb-8">
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-[#f7f7f7] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-[#f7f7f7] to-transparent z-10 pointer-events-none" />

              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-3 md:gap-6 lg:gap-7.5 min-w-max items-center lg:justify-center h-[89px] md:h-[116px]">
                  {brands?.map((brand, i) => (
                    <BrandCard key={`${brand}-${i}`} name={brand} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ---- SUGGESTED PRODUCTS ---- */}
        {!useMockData && loadingPersonalized && <SuggestionsSkeleton />}

        {(useMockData ||
          (!loadingPersonalized &&
            !errorPersonalized &&
            suggestedProducts.length > 0)) && (
          <section className="py-6 lg:py-12">
            <h2 className="text-2xl lg:text-[28px] mb-6">
              Sugestões para você
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {suggestedProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProductCard product={p} viewMode="grid" />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
