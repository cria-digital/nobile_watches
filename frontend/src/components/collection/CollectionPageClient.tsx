"use client";

import { useUserCollection } from "@/hooks/useUserCollection";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileBackHeader } from "../layout/MobileBackHeader";
import { Breadcrumbs, Button } from "../ui";
import { UserNav } from "../user/UserNav";
import { CollectionCard } from "./CollectionCard";

export function CollectionPageClient() {
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
  const [currentWatchIndex, setCurrentWatchIndex] = useState(0);

  // Selecionar primeira marca automaticamente ao carregar
  useEffect(() => {
    if (!isLoading && allCollection.length > 0 && !selectedBrand) {
      const firstBrand = userBrands[0]?.name;
      if (firstBrand) {
        setSelectedBrand(firstBrand);
      }
    }
  }, [
    isLoading,
    allCollection.length,
    selectedBrand,
    userBrands,
    setSelectedBrand,
  ]);

  // Resetar index quando trocar de marca
  useEffect(() => {
    setCurrentWatchIndex(0);
  }, [selectedBrand]);

  // Funções de navegação entre relógios
  const handlePrevWatch = () => {
    setCurrentWatchIndex((prev) =>
      prev === 0 ? collection.length - 1 : prev - 1
    );
  };

  const handleNextWatch = () => {
    setCurrentWatchIndex((prev) =>
      prev === collection.length - 1 ? 0 : prev + 1
    );
  };

  // Relógio atual para exibir no desktop
  const currentWatch = collection[currentWatchIndex];

  // Contar total de itens por marca
  const getBrandCount = (brandName: string) => {
    return allCollection.filter((item) => item.watch.brand === brandName)
      .length;
  };

  return (
    <div className="min-h-screen bg-white lg:py-8">
      <MobileBackHeader title="Minha coleção" />

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between max-w-7xl mx-auto px-8">
        <div>
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Minha coleção" }]}
          />
          <h1 className="text-[32px] leading-[100%]">Minha coleção</h1>
        </div>
        <UserNav />
      </div>

      <div className="mx-auto max-w-7xl px-5 lg:px-8 pt-5 lg:pt-[48px] pb-28">
        {/* Content */}
        <div className="pt-0 lg:pt-0 pb-24 lg:pb-8">
          {/* Filtros de Marca */}
          <div className="block lg:hidden mb-6.5">
            <div className="flex h-8 gap-2.5 overflow-x-auto scrollbar-hide">
              {userBrands.map((brand) => {
                const count = getBrandCount(brand.name);
                const isActive = selectedBrand === brand.name;
                const isDisabled = count === 0;

                return (
                  <button
                    key={brand.slug}
                    onClick={() =>
                      setSelectedBrand(isActive ? null : brand.name)
                    }
                    disabled={isDisabled}
                    className={`flex-shrink-0 w-auto h-8 lg:w-14 lg:h-14 rounded-sm px-3 flex items-center justify-center transition-all relative ${
                      isActive
                        ? "bg-[#D5A60A] text-white font-bold border-2 border-[#D5A60A]"
                        : "bg-white/5 hover:bg-white/10 border border-[#D9D9D9]"
                    }`}
                    aria-label={`Filtrar por ${brand.name}`}
                  >
                    <span className="text-sm">{brand.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid de Relógios */}
          <div className="lg:px-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D5A60A]"></div>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="font-lato text-lg text-red-400">{error}</p>
              </div>
            ) : collection.length === 0 ? (
              <div className="bg-[#F7F7F7] rounded-xl p-8 lg:p-12 text-center">
                <div className="max-w-md mx-auto">
                  <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="font-lato text-lg font-medium text-pb-500 mb-2">
                    {selectedBrand
                      ? `Nenhum relógio ${selectedBrand} na coleção`
                      : "Sua coleção está vazia"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    {selectedBrand
                      ? "Explore outros relógios ou remova o filtro"
                      : "Comece a adicionar seus relógios favoritos"}
                  </p>
                  <Link href="/all">
                    <Button variant="gold" className="w-[220px] mx-auto">
                      Explorar Relógios
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid lg:hidden grid-cols-1 gap-y-4 lg:gap-y-8">
                  <h3 className="text-2xl">{selectedBrand}</h3>
                  {collection.map((item) => (
                    <CollectionCard key={item.id} item={item} />
                  ))}
                </div>

                <div className="hidden lg:block relative">
                  <div className="absolute left-[50%] top-0 w-[41%] pt-1 px-8 z-20">
                    <Breadcrumbs
                      items={[
                        { label: "Home", href: "/" },
                        { label: "Sua coleção" },
                      ]}
                    />

                    <div className="flex h-8 gap-4 mt-9 overflow-x-auto scrollbar-hide">
                      {userBrands.map((brand) => {
                        const count = getBrandCount(brand.name);
                        const isActive = selectedBrand === brand.name;
                        const isDisabled = count === 0;

                        return (
                          <button
                            key={brand.slug}
                            onClick={() =>
                              setSelectedBrand(isActive ? null : brand.name)
                            }
                            disabled={isDisabled}
                            className={`flex-shrink-0 w-auto h-8 rounded-sm px-3 flex items-center justify-center transition-all relative ${
                              isActive
                                ? "bg-[#D5A60A] text-white font-bold border-2 border-[#D5A60A]"
                                : "bg-white/5 hover:bg-white/10 border border-[#D9D9D9]"
                            }`}
                            aria-label={`Filtrar por ${brand.name}`}
                          >
                            <span className="text-sm">{brand.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {currentWatch && (
                    <div className="relative">
                      {/* Seta esquerda - só mostrar se houver mais de 1 relógio */}
                      {collection.length > 1 && (
                        <button
                          onClick={handlePrevWatch}
                          className="group absolute left-[-80px] top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all z-10 hover:shadow-[0_10px_25px_rgba(0,0,0,0.15)]"
                          aria-label="Relógio anterior"
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
                              className="transition-colors group-hover:stroke-[#D5A60A]"
                            />
                          </svg>
                        </button>
                      )}

                      <CollectionCard item={currentWatch} />

                      {/* Seta direita - só mostrar se houver mais de 1 relógio */}
                      {collection.length > 1 && (
                        <button
                          onClick={handleNextWatch}
                          className="group absolute right-[-80px] top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all z-10 hover:shadow-[0_10px_25px_rgba(0,0,0,0.15)]"
                          aria-label="Próximo relógio"
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
                              className="transition-colors group-hover:stroke-[#D5A60A]"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-white/10">
          <div className="flex items-center justify-around h-20 px-4">
            <Link
              href="/"
              className="flex flex-col items-center gap-1"
              aria-label="Home"
            >
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
              href="/account/purchases"
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
                <circle
                  cx="18"
                  cy="21"
                  r="1"
                  fill="#141414"
                  fillOpacity="0.6"
                />
              </svg>
            </Link>

            <Link
              href="/account/listings"
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
