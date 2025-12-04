"use client";

import { ProductCard } from "@/components/product";

import { usePersonalizedFeed } from "@/lib/hooks/usePersonalizedFeed";
import nobileService from "@/lib/services/nobile.service";
import { Product } from "@/types/product";
import { EmblaCarouselType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import { BrandCard } from "@/components/brand/BrandCard";
import { mockWatchBrands } from "@/data/mock/brands";
import { mockProducts } from "@/lib/data/mockProducts";
import { BrandsSkeleton } from "./BrandsSkeleton";
import { SuggestionsSkeleton } from "./SuggestionsSkeleton";

const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

const fetcher = async () => {
  try {
    const data = await nobileService.getWatches();
    return data as Product[];
  } catch (error) {
    console.error("Erro ao buscar relógios:", error);
    throw error;
  }
};

const brandsFetcher = async () => {
  try {
    const data = await nobileService.getBrands();
    return data;
  } catch (error) {
    console.error("Erro ao buscar marcas:", error);
    throw error;
  }
};

export function Hero() {
  const {
    data: watches,
    error,
    isLoading,
  } = useSWR(!useMockData ? "/watches" : null, fetcher, {
    revalidateOnFocus: false,
  });

  const {
    data: brandsFromAPI,
    error: brandsError,
    isLoading: brandsLoading,
  } = useSWR(!useMockData ? "/brands" : null, brandsFetcher, {
    revalidateOnFocus: false,
  });

  // Hook de feed personalizado
  const {
    products: personalizedProducts,
    isPersonalized,
    isLoading: isLoadingPersonalized,
    isError: personalizedError,
  } = usePersonalizedFeed({ limit: 4 });

  // Decide quais marcas usar (mock vs API)
  const brands = useMemo(() => {
    if (useMockData) return mockWatchBrands;
    return brandsFromAPI || [];
  }, [brandsFromAPI]);

  const initialProducts = [
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

  // Produtos sugeridos com fallback
  const suggestedProducts = useMemo(() => {
    let suggested: Product[] = [];

    if (useMockData) {
      return [
        mockProducts[0],
        mockProducts[16],
        mockProducts[17],
        mockProducts[14],
      ].filter((p): p is Product => p !== undefined);
    }

    // 1. Adiciona produtos personalizados (se houver)
    if (personalizedProducts && personalizedProducts.length > 0) {
      suggested = [...personalizedProducts];
    }

    // 2. Se temos menos de 4, completa com produtos da API
    if (suggested.length < 4 && watches && watches.length > 0) {
      const usedIds = new Set(suggested.map((p) => p.id));
      const availableWatches = watches
        .filter((w) => w.images?.length && !usedIds.has(w.id))
        .slice(0, 4 - suggested.length);

      suggested = [...suggested, ...availableWatches];
    }

    return suggested.slice(0, 4);
  }, [personalizedProducts, watches]);

  const autoplaySpeed = 5000;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: false,
    containScroll: "keepSnaps",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  // Efeito para o autoplay
  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", onSelect);
    emblaApi.off("scroll", onSelect);

    const autoplayInterval = setInterval(() => {
      emblaApi.scrollNext();
    }, autoplaySpeed);

    return () => {
      clearInterval(autoplayInterval);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect, autoplaySpeed]);

  // Função para navegar para um dot específico
  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  return (
    <div className="mt-5 sm:mt-12">
      <div className="mx-auto w-full max-w-7xl px-5 lg:px-8">
        {/* Slider */}
        <div className="relative h-[180px] md:h-[clamp(280px,40vw,350px)] lg:h-[518px] max-h-[518px]">
          <div className="relative h-[152px] md:h-[clamp(230px,35vw,340px)] lg:h-[482px] max-h-[482px] overflow-hidden">
            {/* Container do Viewport do Embla */}
            <div className="embla h-full" ref={emblaRef}>
              <div className="embla__container flex h-full relative">
                {initialProducts.map((product, index) => {
                  const isActive = index === selectedIndex;
                  return (
                    <div
                      key={index}
                      className={`absolute inset-0 flex items-start transition-opacity duration-800 ease-in-out
                                  ${isActive ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                      style={{
                        minWidth: "100%",
                        flex: "0 0 100%",
                      }}
                    >
                      {/* <Image
                        src={product.images?.[0] || "/placeholder-watch.jpg"}
                        alt={`${product.brand} ${product.model}`}
                        className="w-full object-cover rounded-[16px] md:rounded-[48px]"
                        fill
                        priority={index === 0}
                        sizes="(max-width: 768px) 100vw, 1280px"
                      /> */}
                      <Image
                        src={product.img}
                        alt={`${product.brand} ${product.model}`}
                        className="w-full object-cover rounded-[16px] lg:rounded-[48px]"
                        fill
                        priority={index === 0}
                        sizes="(max-width: 768px) 100vw, 1280px"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dots de Navegação */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-2 lg:space-x-4 z-20">
            {initialProducts.map((_, index) => (
              <button
                key={index}
                aria-label={`Ir para o slide ${index + 1}`}
                onClick={() => scrollTo(index)}
                className={`w-2 h-2 lg:w-3 lg:h-3  rounded-full transition-all duration-300 ${
                  index === selectedIndex ? "bg-pb-500" : "bg-[#d9d9d9]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Marcas */}
        {/* Carregando */}
        {!useMockData && brandsLoading && <BrandsSkeleton />}

        {/*  Sucesso - renderiza normalmente */}
        {(useMockData ||
          (!brandsLoading && !brandsError && brands?.length > 0)) && (
          <section
            aria-label="Marcas de relógios"
            className="pt-6 pb-5 lg:pt-12 lg:pb-8"
          >
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-[#f7f7f7] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-[#f7f7f7] to-transparent z-10 pointer-events-none" />

              <div
                className="overflow-x-auto scrollbar-hide"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <div className="h-[89px] md:h-[116px] flex items-center gap-1 md:gap-6 lg:gap-[30px] min-w-max">
                  {brands?.map((brand, index) => (
                    <BrandCard key={`${brand}-${index}`} name={brand} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/*Sugestões*/}
        {/* Carregando */}
        {!useMockData && isLoadingPersonalized && <SuggestionsSkeleton />}

        {/* Sucesso - renderiza normalmente */}
        {(useMockData ||
          (!isLoadingPersonalized &&
            !personalizedError &&
            suggestedProducts.length > 0)) && (
          <section aria-label="Sugestões de relógios" className="py-6 lg:py-12">
            <h2 className="text-2xl lg:text-[28px] mb-6 lg:mb-8">
              Sugestões para você
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {suggestedProducts.map((product, index) => (
                <div
                  key={product.id || index}
                  className="animate-fadeIn"
                  style={{
                    animationDelay: `${index * 20}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  <ProductCard product={product} viewMode="grid" />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
