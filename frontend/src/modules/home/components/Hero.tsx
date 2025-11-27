"use client";

import { ProductCard } from "@/components/product";
import { mockProducts } from "@/lib/data/mockProducts";

import { BrandCard } from "@/components/brand/BrandCard";
import { Brand, mockBrands } from "@/lib/data/mockBrands";
import { usePersonalizedFeed } from "@/lib/hooks/usePersonalizedFeed";
import nobileService from "@/lib/services/nobile.service";
import { Product } from "@/types/product";
import Image from "next/image";
import { useMemo } from "react";
import Slider from "react-slick";
import useSWR from "swr";

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

  const { data: brandsFromAPI, error: brandsError } = useSWR(
    !useMockData ? "/brands" : null,
    brandsFetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const {
    products: personalizedProducts,
    isPersonalized,
    count,
    isLoading: isLoadingPersonalized,
  } = usePersonalizedFeed({ limit: 4 });

  const brands: Brand[] = useMemo(() => {
    // Modo mock: usa marcas mockadas
    if (useMockData) {
      return mockBrands;
    }

    if (brandsFromAPI && brandsFromAPI.length > 0) {
      return brandsFromAPI.map((brand: string, i: number) => ({
        nome: brand,
        href: `/${brand.toLowerCase().replace(/\s+/g, "-")}`,
        img: `/images/brand/marca${(i % 10) + 1}.svg`,
      }));
    }

    // Em produção sem dados da API: retorna array vazio (não mostra nada)
    return [];
  }, [brandsFromAPI]);

  const bannerSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    autoplay: true,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    cssEase: "cubic-bezier(0.4, 0, 0.2, 1)",
    dotsClass: "slick-dots banner-dots",
  } as const;

  const initialProducts = [
    { img: "/images/hero/banner1.svg", nome: "Rolex Deepsea", href: "/rolex/deepsea-12" },
    {
      img: "/images/hero/banner2.svg",
      nome: "Rolex Oyster-Perpetual",
      href: "/rolex/oyster-perpetual-9",
    },
    {
      img: "/images/hero/banner3.svg",
      nome: "Patek Philippe",
      href: "/patek-philippe/nautilus-14",
    },
    {
      img: "/images/hero/banner4.svg",
      nome: "Breitling Superocean Heritage",
      href: "/breitling/superocean-heritage-15",
    },
  ];

  const suggestedProducts: Product[] = useMemo(() => {
    // Modo mock: retorna sempre 4 produtos mockados
    if (useMockData) {
      return [
        mockProducts[0],
        mockProducts[19],
        mockProducts[20],
        mockProducts[14],
      ].filter((p): p is Product => p !== undefined);
    }

    // 🚫 PRODUÇÃO: NUNCA usa dados mock
    let suggested: Product[] = [];

    // 1. Adiciona produtos personalizados (se houver)
    if (personalizedProducts && personalizedProducts.length > 0) {
      suggested = [...personalizedProducts];
    }

    // 2. Se temos menos de 4, completa com produtos da API
    if (suggested.length < 4 && watches && watches.length > 0) {
      const usedIds = new Set(suggested.map(p => p.id));
      const availableWatches = watches
        .filter(w => w.images?.length && !usedIds.has(w.id))
        .slice(0, 4 - suggested.length);

      suggested = [...suggested, ...availableWatches];
    }

    return suggested.slice(0, 4);
  }, [personalizedProducts, watches]);

  return (
    <div className="mt-5 sm:mt-12">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Slider */}
        <div className="relative">
          <div className="h-[180px] md:h-[350px] lg:h-[518px] overflow-hidden rounded-[16px] md:rounded-[48px]">
            <Slider {...bannerSettings}>
              {initialProducts.map((product, index) => {
                return (
                  <div
                    key={index}
                    className="h-full relative rounded-[16px] md:rounded-[48px]"
                  >
                    <div className="block h-full remove-ef">
                      <Image
                        src={product.img}
                        alt={product.nome}
                        className="w-full h-[152px] md:h-full object-cover rounded-[16px] md:rounded-[48px]"
                        width={1200}
                        height={518}
                        priority
                      />
                    </div>
                    {/* <button className="hidden absolute bottom-8 left-5 md:bottom-32 md:left-22 bg-white hover:bg-gray-50 font-lato text-[#141414] rounded-full lg:flex items-center justify-center gap-2 text-[12px] lg:text-[16px] font-normal md:font-bold transition-colors w-[128px] h-[32px] md:w-[200px] md:h-[56px]">
                      Garanta o seu
                      <svg
                        className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#D5A60A"
                        strokeWidth="2"
                      >
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </button> */}
                  </div>
                );
              })}
            </Slider>
          </div>
        </div>

        {/* Marcas */}
        <section aria-label="Marcas de relógios" className="py-6 lg:py-12">
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
              <div className="h-auto md:h-[116px] flex items-center gap-4 md:gap-6 lg:gap-[30px] px-4 md:px-8 min-w-max">
                {brands?.map(brand => (
                  <BrandCard
                    key={brand.nome}
                    href={brand.href}
                    name={brand.nome}
                    image={brand.img}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sugestões */}
        <section
          aria-label="Sugestões de relógios"
          className="mb-8 md:mb-12 mt-[22px] md:mt-0"
        >
          <div className="flex items-center justify-between mb-6 md:mb-8">
            {/* 🆕 Título dinâmico baseado em isPersonalized */}
            <h2 className="font-erstoria text-2xl md:text-[28px] text-slate-900">
              {isPersonalized ? "Recomendado para você" : "Sugestões para você"}
            </h2>
          </div>

          {/* Loading state */}
          {isLoadingPersonalized && !useMockData && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {/* Products grid */}
          {!isLoadingPersonalized && (
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
          )}
        </section>
      </div>
    </div>
  );
}
