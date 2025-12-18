"use client";

import {
  Breadcrumbs,
  Button,
  PageLoading,
  Toast,
  VerifiedBadge,
  WishlistButton,
} from "@/components/ui";
import { assuranceBadges } from "@/lib/constants";
import { useAuth } from "@/lib/context/AuthContext";
import { useProduct } from "@/lib/hooks/useProduct";
import { usePurchase } from "@/lib/hooks/usePurchase";
import { safeString, stringToSlug } from "@/lib/utils/stringUtils";
import { Product } from "@/types/product";
import { AlertCircle, Package, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import AuthWatchCard from "./AuthWatchCard";
import { ImageZoom } from "./ImageZoom";
import { ProductCard } from "./ProductCard";
import { ProductSpecs } from "./ProductSpecs";

const hasActiveListing = (product: Product | null): boolean => {
  if (!product?.listings || product.listings.length === 0) {
    return false;
  }
  return product.listings.some((listing) => listing.status === "ACTIVE");
};

interface ProductPageClientProps {
  productId: string | number;
}

const accessoriesMap = {
  BOX_AND_PAPERS: "Com a caixa original | Com os documentos originais",
  BOX_ONLY: "Possui Caixa",
  PAPERS_ONLY: "Possui Documentação",
  WATCH_ONLY: "Sem mais acessórios",
};

export function ProductPageClient({ productId }: ProductPageClientProps) {
  const router = useRouter();
  const { product, relatedProducts, isLoading, isError } = useProduct({
    productId,
  });
  const { user, isAuthenticated } = useAuth();

  const [selectedImage, setSelectedImage] = useState(0);

  const {
    isLoading: isPurchasing,
    message,
    addToCart,
    buyNow,
    clearMessage,
  } = usePurchase();

  // Estados para controle do slider de thumbnails
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);

  const isOwnProduct =
    (user && product && user.id === product?.sellerId) || false;
  const hasActiveListingAvailable = hasActiveListing(product); // ✅ ADICIONAR ESTA LINHA
  const isPurchaseDisabled =
    isPurchasing || isOwnProduct || !hasActiveListingAvailable;

  const handleAddToCart = async () => {
    if (!product) return;

    // Verificar autenticação
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isOwnProduct) {
      return;
    }

    // O segundo parâmetro 'true' faz redirecionar após adicionar
    await addToCart(product, true);
  };

  const handleBuyNow = async () => {
    if (!product) return;

    // Verificar autenticação
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isOwnProduct) {
      return;
    }

    await buyNow(product);
  };

  if (isLoading) {
    return <PageLoading text="Buscando informações do produto..." />;
  }

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

  const description =
    safeString(product.listings?.[0]?.titleSuffix) ?? product.description;

  const hasValidImages = product.images && product.images.length > 0;
  const images = hasValidImages ? product.images : [];

  // Verifica se pode scrollar nos thumbnails
  const checkScrollability = () => {
    const container = thumbnailsContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Handlers para navegação de imagens principais
  const handlePreviousImage = () => {
    if (!hasValidImages) return;
    setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    if (!hasValidImages) return;
    setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
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

  return (
    <>
      {/* ✅ Toast de feedback */}
      {message && (
        <Toast
          message={message.text}
          type={message.type}
          onClose={clearMessage}
          duration={3000}
        />
      )}
      <div className="min-h-screen bg-white">
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
              {/* Imagem principal com zoom PhotoSwipe ou fallback */}
              <div className="relative group">
                {hasValidImages ? (
                  <>
                    <ImageZoom
                      images={images}
                      selectedIndex={selectedImage}
                      alt={`${product.brand} ${product.model}`}
                      onIndexChange={setSelectedImage}
                    />

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
                  </>
                ) : (
                  // Fallback quando não há imagens
                  <div className="relative w-full aspect-square rounded-[8px] lg:rounded-[15.69px] bg-gradient-to-br from-[#EFEFEF] to-[#E0E0E0] flex items-center justify-center">
                    <Package
                      size={80}
                      className="text-gray-300"
                      strokeWidth={1.5}
                    />
                  </div>
                )}
              </div>

              {/* Thumbnails com slider - só renderiza se houver imagens */}
              {hasValidImages && images.length > 1 && (
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
                    {images.map((img, idx) => (
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
              )}
            </div>

            {/* Coluna Direita: Informações do Produto */}
            <div className="pt-2 lg:pt-12 lg:px-2 space-y-6 lg:space-y-[30px]">
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  {
                    label: product.brand,
                    href: `/${stringToSlug(product.brand)}`,
                  },
                  { label: product.model },
                ]}
                className="hidden lg:flex lg:mb-6.5"
              />

              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-center justify-between h-6 lg:h-[28px]">
                  <h3 className="text-base lg:text-[18px] text-[#D5A60A]">
                    {product.brand}
                  </h3>

                  <VerifiedBadge />
                </div>

                {/* Título do produto */}
                <div>
                  <h1 className="text-2xl lg:text-[32px] mb-2.5">
                    {product.model}
                  </h1>
                  <p className="text-sm lg:text-base text-gray-400 leading-[140%] mb-3 line-clamp-3">
                    {description}
                  </p>

                  {/* Referência e WebID */}
                  <div className="flex items-center gap-2 text-gray-400 leading-[22px] tracking-[-0.03em]">
                    {product.referenceNumber && (
                      <>
                        REF: {product.referenceNumber}
                        <span>|</span>
                      </>
                    )}
                    WEBID: {product.id}
                  </div>
                </div>

                {/* Preço */}
                <div className="flex items-center justify-between h-6 lg:h-[32px]">
                  <span className="text-2xl lg:text-[28px] font-bold leading-[140%]">
                    R$ {product.price.toLocaleString("pt-BR")}
                  </span>

                  {/* Wishlist button */}
                  <WishlistButton
                    watchId={product.id}
                    size="large"
                    // className="absolute right-0 bottom-[6px] w-5 h-5 lg:w-6 lg:h-6"
                  />
                </div>
              </div>

              {/* Botões de ação */}
              <div className="space-y-3">
                {/* Container dos botões de compra */}
                <div className="flex">
                  {/* Botão principal de comprar */}
                  <Button
                    onClick={handleBuyNow}
                    disabled={isPurchaseDisabled}
                    variant="gold"
                    className={`flex-1 h-[56px] font-bold py-3.5 px-6 rounded-full transition-colors ${
                      isPurchaseDisabled
                        ? "bg-gray-300 cursor-not-allowed"
                        : "disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                  >
                    {isPurchasing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processando...
                      </>
                    ) : isOwnProduct ? (
                      "Você não pode comprar seu próprio produto"
                    ) : !hasActiveListingAvailable ? (
                      "Produto indisponível"
                    ) : (
                      "Comprar"
                    )}
                  </Button>

                  {/* Botão de adicionar ao carrinho */}
                  <Button
                    onClick={handleAddToCart}
                    disabled={isPurchaseDisabled}
                    variant="gold"
                    className={`flex-shrink-0 h-[56px] w-[56px] rounded-full transition-colors ${
                      isPurchaseDisabled
                        ? "bg-gray-300 cursor-not-allowed"
                        : "hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                    aria-label="Adicionar ao carrinho"
                    title={
                      !hasActiveListingAvailable
                        ? "Produto indisponível"
                        : "Adicionar ao carrinho"
                    }
                  >
                    {isPurchasing ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ShoppingCart className="w-6 h-6" />
                    )}
                  </Button>
                </div>

                {isOwnProduct && (
                  <p className="text-sm text-gray-500 text-center">
                    Este produto foi anunciado por você
                  </p>
                )}
              </div>

              {/* Badges de Garantia */}
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-y-4 gap-x-6 mb-8">
                {assuranceBadges.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 min-w-0"
                  >
                    <Image
                      src={item.icon}
                      alt={item.label}
                      width={20}
                      height={20}
                      className="w-5 h-5 flex-shrink-0"
                    />
                    <span className="text-sm whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <AuthWatchCard />
            </div>
          </div>

          {/* Descrição Detalhada */}
          <div className="mb-6 lg:mb-12">
            <h2 className="font-erstoria text-xl text-pb-500 tracking-[-0.01em] mb-[16px]">
              Descrição
            </h2>

            {/* Product Status */}
            <div className="flex flex-wrap gap-[6px] mb-[16px]">
              {product.accessories && (
                <span className="px-2 py-[3px] bg-[#D9D9D9] rounded-[32px] text-sm tracking-[-0.01em]">
                  {accessoriesMap[product.accessories]}
                </span>
              )}

              {product.condition && (
                <span className="px-2 py-[3px] bg-[#D9D9D9] rounded-[32px] font-lato text-sm text-pb-500 tracking-[-0.01em]">
                  {product.condition}
                </span>
              )}
            </div>

            <div className="space-y-2 text-gray-400 tracking-[-0.01em] leading-normal">
              <p>{product?.description}</p>
            </div>
          </div>

          {/* Especificações Técnicas */}
          <ProductSpecs product={product} />

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
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>{" "}
    </>
  );
}
