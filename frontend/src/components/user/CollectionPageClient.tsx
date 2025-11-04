"use client";

import { useUserCollection } from "@/hooks/useUserCollection";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CollectionCard } from "./CollectionCard";

// Marcas disponíveis com seus ícones
const AVAILABLE_BRANDS = [
  { name: "Rolex", slug: "rolex", icon: "/images/brand/marca1.svg" },
  { name: "Patek Philippe", slug: "patek-philippe", icon: "/images/brand/marca5.svg" },
  { name: "Breitling", slug: "breitling", icon: "/images/brand/marca3.svg" },
  { name: "Audemars Piguet", slug: "audemars-piguet", icon: "/images/brand/marca4.svg" },
  { name: "TAG Heuer", slug: "tag-heuer", icon: "/images/brand/marca2.svg" },
  { name: "Breguet", slug: "breguet", icon: "/images/brand/marca6.svg" },
  { name: "Omega", slug: "omega", icon: "/images/brand/marca7.svg" },
  { name: "IWC", slug: "iwc", icon: "/images/brand/marca8.svg" },
];

export default function CollectionPageClient() {
  const {
    collection,
    allCollection,
    isLoading,
    error,
    selectedBrand,
    setSelectedBrand,
    getBrands,
  } = useUserCollection();

  const userBrands = getBrands();
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Sua coleção", href: "/colecao" },
  ];

  // Contar total de itens por marca
  const getBrandCount = (brandName: string) => {
    return allCollection.filter(item => item.watch.brand === brandName).length;
  };

  return (
    <div className="min-h-screen bg-white brand">
      <div className="container mx-auto max-w-7xl px-0 lg:px-8 pt-4 pb-18 lg:pt-8 lg:pb-30">
        {/* Mobile Header */}
        <div className="lg:hidden relative top-0 z-50 bg-white">
          <div className="flex items-center gap-3 px-5 h-14.5">
            <Link href="/" className="-ml-1">
              <ArrowLeft className="w-[26px] h-[26px] text-pb-500" strokeWidth={1.5} />
            </Link>
            <h1 className="font-erstoria text-[20px] text-pb-500 font-medium">
              Sua coleção
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="pt-6 lg:pt-0 pb-24 lg:pb-8">
          {/* Filtros de Marca */}
          <div className="px-4 lg:px-0 mb-4 lg:mb-8">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {AVAILABLE_BRANDS.map(brand => {
                const count = getBrandCount(brand.name);
                const isActive = selectedBrand === brand.name;
                const isDisabled = count === 0;

                return (
                  <button
                    key={brand.slug}
                    onClick={() => setSelectedBrand(isActive ? null : brand.name)}
                    disabled={isDisabled}
                    className={`flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 rounded-lg flex items-center justify-center transition-all relative ${
                      isActive
                        ? "bg-[#D5A60A]"
                        : isDisabled
                          ? "bg-white/5 opacity-30 cursor-not-allowed"
                          : "bg-white/5 hover:bg-white/10"
                    }`}
                    aria-label={`Filtrar por ${brand.name}`}
                  >
                    <Image
                      src={brand.icon}
                      alt={brand.name}
                      width={32}
                      height={32}
                      className={`w-8 h-8 object-contain ${isActive ? "brightness-0" : ""}`}
                    />
                    {count > 0 && (
                      <span className="absolute top-1 -right-1 w-5 h-5 bg-[#D5A60A] rounded-full flex items-center justify-center font-lato text-xs font-semibold text-[#0D0D0D]">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid de Relógios */}
          <div className="px-4 lg:px-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D5A60A]"></div>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="font-lato text-lg text-red-400">{error}</p>
              </div>
            ) : collection.length === 0 ? (
              <div className="text-center py-20">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto mb-4 opacity-30"
                >
                  <circle
                    cx="32"
                    cy="32"
                    r="30"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  <path
                    d="M32 20V44M20 32H44"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <h3 className="font-erstoria text-2xl mb-2">
                  {selectedBrand
                    ? `Nenhum relógio ${selectedBrand} na coleção`
                    : "Sua coleção está vazia"}
                </h3>
                <p className="font-lato text-base mb-6">
                  {selectedBrand
                    ? "Explore outros relógios ou remova o filtro"
                    : "Comece a adicionar seus relógios favoritos"}
                </p>
                {!selectedBrand && (
                  <Link
                    href="/produtos"
                    className="inline-flex h-12 px-8 bg-[#D5A60A] hover:bg-[#F0B90B] rounded-lg items-center justify-center font-lato text-base font-semibold text-[#0D0D0D] transition-colors"
                  >
                    Explorar relógios
                  </Link>
                )}
                {selectedBrand && (
                  <button
                    onClick={() => setSelectedBrand(null)}
                    className="inline-flex h-12 px-8 bg-[#D5A60A] hover:bg-[#F0B90B] rounded-lg items-center justify-center font-lato text-base font-semibold text-[#0D0D0D] transition-colors"
                  >
                    Ver toda coleção
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-y-4 lg:gap-y-8">
                {collection.map(item => (
                  <CollectionCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-white/10">
          <div className="flex items-center justify-around h-20 px-4">
            <Link href="/" className="flex flex-col items-center gap-1" aria-label="Home">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                  stroke="#D5A60A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="#D5A60A"
                />
              </svg>
            </Link>

            <Link
              href="#"
              className="flex flex-col items-center gap-1"
              aria-label="Buscar"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                  stroke="#141414"
                  strokeWidth="2"
                  strokeOpacity="0.6"
                />
                <path
                  d="M21 21L16.65 16.65"
                  stroke="#141414"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeOpacity="0.6"
                />
              </svg>
            </Link>

            <Link
              href="/minhas-compras"
              className="flex flex-col items-center gap-1"
              aria-label="Carrinho"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 2L7 7H20L18 2H9Z"
                  stroke="#141414"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.6"
                />
                <path
                  d="M7 7H20L22 17H5L7 7Z"
                  stroke="#141414"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.6"
                />
                <circle cx="9" cy="21" r="1" fill="#141414" fillOpacity="0.6" />
                <circle cx="18" cy="21" r="1" fill="#141414" fillOpacity="0.6" />
              </svg>
            </Link>

            <Link
              href="/meus-anuncios"
              className="flex flex-col items-center gap-1"
              aria-label="Relógios"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="#141414"
                  strokeWidth="2"
                  strokeOpacity="0.6"
                />
                <path
                  d="M12 6V12L16 14"
                  stroke="#141414"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeOpacity="0.6"
                />
              </svg>
            </Link>

            <Link
              href="#"
              className="flex flex-col items-center gap-1"
              aria-label="Favoritos"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22249 22.4518 8.5C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61V4.61Z"
                  stroke="#141414"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
