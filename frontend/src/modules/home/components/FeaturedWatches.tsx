"use client";

import { useFeaturedWatches } from "@/lib/hooks/useFeaturedWatches";
import { Product } from "@/types/product";
import type { EmblaCarouselType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

/**
 * Gera o link do produto no formato correto
 */
function generateProductLink(product: Product): string {
  const brandSlug = product.brand.toLowerCase().replace(/\s+/g, "-");
  const modelSlug = product.model.toLowerCase().replace(/\s+/g, "-");
  return `/${brandSlug}/${modelSlug}-${product.id}`;
}

/**
 * Formata o preço para exibição
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(price);
}

export function FeaturedWatches() {
  const { watches, isLoading } = useFeaturedWatches({ limit: 5 });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // Atualiza o índice selecionado quando o carrossel muda
  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  // Navega para o próximo slide
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Navega para o slide anterior
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  // Navega para um slide específico
  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  // Setup do Embla
  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Loading state
  if (isLoading) {
    return (
      <section className="w-full bg-[#141414] py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-center justify-center mb-8 lg:mb-12">
            <h2 className="font-erstoria text-xl lg:text-[26px] text-center text-[#D5A60A] font-normal uppercase tracking-wider">
              Relógios em destaque
            </h2>
          </div>
          <div className="h-[400px] lg:h-[600px] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#D5A60A] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!watches || watches.length === 0) {
    return null;
  }

  const currentWatch = watches[selectedIndex];

  return (
    <section className="w-full bg-[#141414] py-12 lg:py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        {/* Título */}
        <div className="hidden lg:flex items-center justify-center relative w-[363px] h-[41px] mx-auto mb-8 lg:mb-12">
          <Image
            src="/images/hero/destaques.svg"
            alt="Relógios em destaque"
            fill
            className="object-cover"
            sizes="363px"
          />
          <h2 className="font-lato text-xs lg:text-[26px] text-center text-[#D5A60A] font-bold uppercase">
            Relógios em destaque
          </h2>
        </div>
        <div className="flex lg:hidden items-center justify-center relative w-[182px] h-[21px] mx-auto mb-8 lg:mb-12">
          <Image
            src="/images/hero/destaques.svg"
            alt="Relógios em destaque"
            fill
            className="object-cover"
            sizes="182px"
          />
          <h2 className="font-lato text-xs lg:text-[26px] text-center text-[#D5A60A] font-bold uppercase">
            Relógios em destaque
          </h2>
        </div>
        {/* Container do Carrossel */}
        <div className="relative">
          {/* Linha horizontal decorativa (desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-1/2 pointer-events-none" />

          {/* Carrossel */}
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {watches.map((watch, index) => {
                  const isActive = index === selectedIndex;

                  return (
                    <div
                      key={watch.id}
                      className="flex-[0_0_100%] min-w-0 lg:flex-[0_0_33.333%] relative px-4 lg:px-8"
                    >
                      <Link
                        href={generateProductLink(watch)}
                        className="block group"
                      >
                        <motion.div
                          className="relative"
                          initial={{ scale: 0.85, opacity: 0.6 }}
                          animate={{
                            scale: isActive ? 1 : 0.85,
                            opacity: isActive ? 1 : 0.6,
                          }}
                          transition={{
                            duration: 0.4,
                            ease: "easeOut",
                          }}
                        >
                          {/* Container da imagem */}
                          <div className="relative aspect-square w-full max-w-[320px] lg:max-w-[400px] mx-auto">
                            <Image
                              src={watch.images[0] || "/placeholder-watch.jpg"}
                              alt={`${watch.brand} ${watch.model}`}
                              fill
                              className="object-contain transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 768px) 320px, 400px"
                              priority={index === 0}
                            />
                          </div>
                        </motion.div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botões de navegação (Desktop) */}
            <div className="hidden lg:flex">
              <button
                onClick={scrollPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 flex items-center justify-center group z-10"
                aria-label="Relógio anterior"
              >
                <svg
                  className="w-6 h-6 text-white group-hover:text-[#D5A60A] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onClick={scrollNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 flex items-center justify-center group z-10"
                aria-label="Próximo relógio"
              >
                <svg
                  className="w-6 h-6 text-white group-hover:text-[#D5A60A] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Informações do relógio atual */}
          <AnimatePresence mode="wait">
            <motion.div
              //@ts-ignore
              key={currentWatch.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center mt-6 lg:mt-8"
            >
              <h3 className="text-2xl lg:text-3xl text-white mb-2">
                {/* @ts-ignore */}
                {currentWatch.model}
              </h3>
              <p className="text-lg lg:text-xl font-light text-white">
                {/* @ts-ignore */}
                {formatPrice(currentWatch.price)}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Indicadores (Dots) */}
          <div className="flex justify-center items-center gap-2 mt-6 lg:mt-8">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === selectedIndex
                    ? "w-8 bg-[#D5A60A]"
                    : "w-2 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Ir para o relógio ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Botões de navegação (Mobile) */}
      <div className="flex lg:hidden justify-center gap-4 mt-8">
        <button
          onClick={scrollPrev}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
          aria-label="Relógio anterior"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={scrollNext}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
          aria-label="Próximo relógio"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
