"use client";

import { Breadcrumbs, Toast } from "@/components/ui";
import { usePurchase } from "@/hooks/usePurchase";
import { useProduct } from "@/lib/hooks/useProduct";
import { stringToSlug } from "@/lib/utils/stringUtils";
import { AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MouseEvent, useEffect, useRef, useState } from "react";
import AuthWatchCard from "./AuthWatchCard";
import { PriceEvolutionChart } from "./PriceEvolutionChart";
import { ProductCard } from "./ProductCard";
import { ProductSpecs } from "./ProductSpecs";

interface ProductPageClientProps {
  productId: string | number;
}

export function ProductPageClient({ productId }: ProductPageClientProps) {
  // ✅ Busca produto usando hook refatorado
  const { product, relatedProducts, isLoading, isError } = useProduct({ productId });

  // Estados de UI
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);

  // Hook de compra
  const {
    isLoading: isPurchasing,
    message,
    addToCartAndRedirect,
    clearMessage,
  } = usePurchase();

  // Estados para controle do zoom
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Estados para controle do slider de thumbnails
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);

  // ✅ Estado de loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#D5A60A]"></div>
          <p className="mt-4 text-gray-600">Carregando produto...</p>
        </div>
      </div>
    );
  }

  // ✅ Estado de erro
  if (isError || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center px-6">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Produto não encontrado
          </h2>
          <p className="text-gray-500 mb-6">
            O produto que você está procurando não existe ou foi removido.
          </p>
          <div className="flex gap-4">
            <Link
              href="/all"
              className="px-6 py-3 bg-[#D5A60A] text-white rounded-lg hover:bg-[#C09609] transition-colors"
            >
              Ver todos os produtos
            </Link>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prepara array de imagens
  const images =
    product.images && product.images.length > 0
      ? product.images
      : ["/placeholder-watch.jpg"];

  // Dados mock para evolução do valor (TODO: buscar da API quando disponível)
  const priceEvolution = {
    current: product.price,
    change: 24938,
    percentChange: 2.4,
    history: [
      { date: "30/02/24", value: product.price - 24938 },
      { date: "30/05/24", value: product.price - 15000 },
      { date: "30/08/24", value: product.price - 10000 },
      { date: "30/11/24", value: product.price - 5000 },
      { date: "30/02/25", value: product.price },
    ],
  };

  // Handler do botão Comprar
  const handleBuyClick = () => {
    addToCartAndRedirect(product);
  };

  // Verifica se pode scrollar
  const checkScrollability = () => {
    const container = thumbnailsContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    setScrollPosition(scrollLeft);
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener("resize", checkScrollability);
    return () => window.removeEventListener("resize", checkScrollability);
  }, [images.length, showAllImages]);

  // Handlers para navegação de imagens principais
  const handlePreviousImage = () => {
    setSelectedImage(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImage(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  // Handlers para o slider de thumbnails
  const scrollThumbnails = (direction: "left" | "right") => {
    const container = thumbnailsContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const newScrollPosition =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollPosition,
      behavior: "smooth",
    });
  };

  // Handlers para o zoom
  const handleMouseEnter = () => {
    setIsZooming(true);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Toast de feedback */}
      {message && (
        <Toast message={message.text} type={message.type} onClose={clearMessage} />
      )}

      <div className="container mx-auto max-w-7xl px-4 lg:px-8 pt-5 lg:pt-[48px] pb-28">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: product.brand, href: `/${stringToSlug(product.brand)}` },
            { label: product.model },
          ]}
          className="flex lg:hidden mb-6"
        />

        {/* Layout principal - Grid 2 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(400px,_1fr)_minmax(400px,_510px)] gap-6 lg:gap-8 xl:gap-12 mb-6 lg:mb-16">
          {/* Coluna Esquerda: Galeria de Imagens */}
          <div className="space-y-3 lg:space-y-6">
            {/* Imagem principal com zoom e navegação */}
            <div className="relative group">
              <div
                ref={imageContainerRef}
                className="relative w-full aspect-square rounded-[8px] lg:rounded-[15.69px] bg-[#efefef] overflow-hidden cursor-crosshair"
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <Image
                  //@ts-ignore
                  src={images[selectedImage] || images[0]}
                  alt={`${product.brand} ${product.model}`}
                  fill
                  className="object-cover transition-opacity duration-200"
                  style={{
                    opacity: isZooming ? 0 : 1,
                  }}
                  priority
                />

                {/* Camada de zoom */}
                {isZooming && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `url(${images[selectedImage] || images[0]})`,
                      backgroundSize: "200%",
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                )}

                {/* Indicador de zoom (opcional - ícone de lupa) */}
                {isZooming && (
                  <div
                    className="absolute w-32 h-32 border-2 border-white rounded-full pointer-events-none shadow-lg"
                    style={{
                      left: `calc(${zoomPosition.x}% - 64px)`,
                      top: `calc(${zoomPosition.y}% - 64px)`,
                      boxShadow: "0 0 0 2px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    <div className="absolute inset-0 rounded-full border-2 border-[#D5A60A] opacity-50" />
                  </div>
                )}
              </div>

              {/* Botões de navegação - aparecem apenas se houver mais de 1 imagem */}
              {images.length > 1 && (
                <>
                  {/* Botão Anterior */}
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
                    aria-label="Imagem anterior"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15 18L9 12L15 6"
                        stroke="#141414"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Botão Próximo */}
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
                    aria-label="Próxima imagem"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 18L15 12L9 6"
                        stroke="#141414"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails com slider */}
            <div className="relative group">
              {/* Botão scroll esquerda */}
              {canScrollLeft && (
                <button
                  onClick={() => scrollThumbnails("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/95 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all z-10 opacity-0 group-hover:opacity-100"
                  aria-label="Scroll para esquerda"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="#141414"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}

              {/* Container de thumbnails */}
              <div
                ref={thumbnailsContainerRef}
                className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
                onScroll={checkScrollability}
              >
                {(showAllImages ? images : images.slice(0, 4)).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative flex-shrink-0 w-[100px] h-[90px] rounded-[8px] overflow-hidden transition-all ${
                      selectedImage === idx
                        ? "opacity-100"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.brand} ${product.model} - ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Botão scroll direita */}
              {canScrollRight && (
                <button
                  onClick={() => scrollThumbnails("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/95 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all z-10 opacity-0 group-hover:opacity-100"
                  aria-label="Scroll para direita"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="#141414"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Coluna Direita: Informações do Produto */}
          <div className="pt-2 lg:pt-12 space-y-6 lg:space-y-[30px]">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: product.brand, href: `/${stringToSlug(product.brand)}` },
                { label: product.model },
              ]}
              className="hidden lg:flex lg:mb-6"
            />

            <div className="space-y-4 lg:space-y-6">
              {/* Cabeçalho com marca */}
              <div className="flex items-center justify-between h-6 lg:h-[28px]">
                <span
                  className="font-erstoria text-base lg:text-[18px] text-[#D5A60A]"
                  style={{
                    lineHeight: "140%",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {product.brand}
                </span>
              </div>

              {/* Título do produto */}
              <div>
                <h1 className="text-2xl lg:text-[32px] mb-2.5">{product.model}</h1>
                <p className="text-sm lg:text-base text-gray-400 leading-[140%] mb-2.5">
                  {product?.customTitleSuffix || product.description}
                </p>

                {/* Referência e WebID */}
                <div className="flex items-center gap-2 text-gray-400 leading-[22px] tracking-[-0.03em]">
                  REF: {product.referenceNumber}
                  <span>|</span>
                  WEBID: {product.id}
                </div>
              </div>

              {/* Preço */}
              <div className="flex items-center justify-between h-6 lg:h-[32px]">
                <span className="text-2xl lg:text-[28px] font-bold leading-[140%]">
                  R$ {product.price.toLocaleString("pt-BR")}
                </span>

                <button className="w-8 h-8" aria-label="Adicionar aos favoritos">
                  <Image
                    src="/icons/heart-outline.svg"
                    alt="Favoritar"
                    width={32}
                    height={32}
                  />
                </button>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="">
              <button
                onClick={handleBuyClick}
                disabled={isLoading}
                className="w-full h-[56px] bg-[#D5A60A] hover:bg-[#C09509] text-white text-base font-bold py-3.5 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Processando...</span>
                  </>
                ) : (
                  "Comprar"
                )}
              </button>
            </div>

            {/* Badges de Garantia */}
            <div>
              <div className="flex gap-6 mb-[18px] flex-wrap">
                <div className="h-5 flex items-center gap-2">
                  <Image
                    src="/icons/shipping-box.svg"
                    alt="Safe delivery"
                    width={20}
                    height={20}
                  />
                  <span className="font-lato text-sm whitespace-nowrap text-pb-500">
                    Entrega Segura
                  </span>
                </div>
                <div className="h-5 flex items-center gap-2">
                  <Image
                    src="/icons/shield-check.svg"
                    alt="Authenticity guaranteed"
                    width={20}
                    height={20}
                  />
                  <span className="font-lato text-sm whitespace-nowrap text-pb-500">
                    Autenticidade Garantida
                  </span>
                </div>
                <div className="h-5 flex items-center gap-2">
                  <Image
                    src="/icons/badge-check.svg"
                    alt="Certified seller"
                    width={20}
                    height={20}
                  />
                  <span className="font-lato text-sm whitespace-nowrap text-pb-500">
                    Vendedor Certificado
                  </span>
                </div>
              </div>
              <div className="h-5 flex items-center gap-2">
                <Image
                  src="/icons/credit-card.svg"
                  alt="Secure payment"
                  width={20}
                  height={20}
                />
                <span className="font-lato text-sm whitespace-nowrap text-pb-500">
                  Pagamento Seguro
                </span>
              </div>
            </div>

            <AuthWatchCard />
          </div>
        </div>

        {/* Descrição Detalhada */}
        <div className="mb-6 lg:mb-12">
          <h2 className="font-erstoria text-xl text-pb-500 tracking-[-0.01em] mb-[16px]">
            Descrição
          </h2>

          {/* Status do produto */}
          <div className="flex flex-wrap gap-[6px] mb-[16px]">
            {product.hasBox && (
              <span className="px-2 py-[3px] bg-[#D9D9D9] rounded-[32px] font-lato text-sm text-pb-500 tracking-[-0.01em]">
                Possui Caixa
              </span>
            )}
            {product.hasDocuments && (
              <span className="px-2 py-[3px] bg-[#D9D9D9] rounded-[32px] font-lato text-sm text-pb-500 tracking-[-0.01em]">
                Possui Documentação
              </span>
            )}
            {product.condition && (
              <span className="px-2 py-[3px] bg-[#D9D9D9] rounded-[32px] font-lato text-sm text-pb-500 tracking-[-0.01em]">
                {product.condition}
              </span>
            )}
          </div>

          <div className="space-y-2 font-lato text-gray-400 tracking-[-0.01em] leading-normal">
            <p>
              With its limited production run, the Patek Philippe Perpetual Calendar
              Chronograph Ref. 5970P in platinum stands as an exceptional find for serious
              collectors. It is estimated that fewer than 400 pieces of this model were
              produced in platinum between 2009 and 2010. This watch features a
              substantial yet balanced case measuring 40mm in diameter, with sapphire
              crystals on both front and back. It is worn on a classic black leather strap
              and features an elegantly complex yet legible dial in black. Displayed on
              the dial are the day and month at 12 o'clock, 30-minute chronograph counter
              with leap year at 3, moon phase and date at 6, and a continuous seconds
              counter with 24-hour display at 9.
            </p>
            <p>
              This coveted timepiece is powered by the hand-wound CH 27-70 Q movement with
              a power reserve of approximately 60 hours.This pre-owned Patek Philippe
              Perpetual Calendar Chronograph Platinum Watch 5970P-001 is presented in the
              manufacturer's wooden box, inclusive of papers and a bifold leather wallet.
            </p>
          </div>
        </div>

        {/* Especificações Técnicas */}
        <ProductSpecs product={product} />

        {/* Seção Evolução do Valor - Grid 2 colunas */}
        <div className="mb-[48px] lg:mb-16">
          <h2 className="text-[28px] lg:text-[24px] font-medium mb-6">
            Evolução do valor
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(400px,_1fr)_minmax(400px,_550px)] gap-6 lg:gap-8">
            {/* Coluna Esquerda: Gráfico */}
            <div>
              <PriceEvolutionChart
                data={priceEvolution.history}
                currentPrice={priceEvolution.current}
                change={priceEvolution.change}
                percentChange={priceEvolution.percentChange}
              />
            </div>

            {/* Coluna Direita: Card do Produto */}
            <div className="bg-[#F7F7F7] rounded-lg p-4 lg:p-8 lg:h-[458px]">
              <div className="flex gap-4 lg:gap-8 h-[178px] lg:h-[302px]">
                {/* Imagem do produto */}
                <div className="relative flex-1 flex-shrink-0 rounded-[13.62px] overflow-hidden">
                  <Image
                    //@ts-ignore
                    src={images[0]}
                    alt={`${product.brand} ${product.model}`}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Informações do produto */}
                <div className="flex-1 min-w-0 py-2.5 lg:py-8">
                  {/* Marca */}
                  <div className="mb-2 lg:mb-5">
                    <p className="text-sm tracking-[-0.01em] mb-2 lg:mb-3">
                      {product.brand}
                    </p>
                    <div className="lg:h-[88px]">
                      <h3 className="text-[18px] lg:text-[22px] font-medium truncate tracking-[-0.01em] mb-1">
                        {product.model}
                        {product.model}
                        {product.model}
                      </h3>
                      <p className="text-sm font-light">{product?.referenceNumber}</p>
                    </div>
                  </div>

                  {/* Especificações */}
                  <div className="space-y-2 lg:space-y-4">
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="font-lato text-sm">Caixa:</span>
                      <span className="font-lato text-sm">
                        {product.caseMaterial || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="font-lato text-sm">Mostrador:</span>
                      <span className="font-lato text-sm">
                        {product.dialColor || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="font-lato text-sm">Estado:</span>
                      <span className="font-lato text-sm">
                        {product.condition || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Botão Adicionar a coleção */}
              <button className="w-full h-[56px] mt-5 lg:mt-8 py-3 border-1 border-[#141414] rounded-full font-lato font-bold text-[#141414] hover:bg-[#141414] hover:text-white transition-colors duration-200">
                Adicionar a coleção
              </button>
            </div>
          </div>
        </div>

        {/* Produtos Relacionados / Sugestões */}
        {relatedProducts.length > 0 && (
          <div className="lg:mb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-erstoria text-[22px] lg:text-[28px] text-[#141414]">
                Sugestões para você
              </h2>
              <Link
                href={`/${stringToSlug(product.brand)}`}
                className="font-lato text-sm text-[#D5A60A] hover:underline"
              >
                Ver tudo
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CSS para esconder scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
