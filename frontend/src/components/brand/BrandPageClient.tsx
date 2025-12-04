"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { useBrandProducts } from "@/lib/hooks/useBrandProducts";
import { useFilteredProducts } from "@/lib/hooks/useFilteredProducts";
import { useFilterOptions } from "@/lib/hooks/useFilterOptions";
import { useProductFilters } from "@/lib/hooks/useProductFilters";
import { pluralize } from "@/lib/utils/stringUtils";
import { AppliedFilters } from "@/types/filters";
import { AlertCircle, ArrowDownUp } from "lucide-react";
import { useEffect, useState } from "react";
import { ErrorState, PageLoading } from "../ui";
import { Breadcrumbs } from "../ui/Breadcrumbs/Breadcrumbs";
import { FilterModal } from "./FilterModal";

type ViewMode = "grid" | "list";

interface BrandPageClientProps {
  brandName: string;
}

export function BrandPageClient({ brandName }: BrandPageClientProps) {
  const isAllProducts = brandName.toLowerCase() === "all";

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const {
    products: brandProducts,
    isLoading,
    isError,
  } = useBrandProducts(brandName);

  const { filterOptions, isLoading: isLoadingFilters } = useFilterOptions();

  //@ts-ignore
  const initialFilters: AppliedFilters = isAllProducts
    ? {}
    : { brands: [brandName] };

  // Hook para gerenciar filtros
  const {
    filters,
    toggleArrayFilter,
    updatePriceRange,
    clearAllFilters,
    setAllFilters,
    summary,
  } = useProductFilters({
    initialFilters,
  });

  const {
    filteredProducts,
    totalCount,
    isLoading: isFilteringLoading,
  } = useFilteredProducts({ brandName, filters, sortBy });

  const sortOptions = [
    { value: "relevance", label: "Mais relevantes" },
    { value: "price-asc", label: "Menor preço" },
    { value: "price-desc", label: "Maior preço" },
    { value: "newest", label: "Mais recentes" },
    { value: "oldest", label: "Mais antigos" },
  ];

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setIsSortDropdownOpen(false);
  };

  const handleApplyFilters = (newFilters: AppliedFilters) => {
    setAllFilters(newFilters);
  };

  // Fechar dropdown ao pressionar ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSortDropdownOpen(false);
      }
    };
    if (isSortDropdownOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isSortDropdownOpen]);

  useEffect(() => {
    //@ts-ignore
    const newInitialFilters: AppliedFilters = isAllProducts
      ? {}
      : { brands: [brandName] };

    setAllFilters(newInitialFilters);
  }, [brandName, isAllProducts, setAllFilters]);

  // Se ainda está carregando filtros ou produtos iniciais
  /// const isInitialLoading = isLoading || isLoadingFilters;

  if (isLoading) {
    return <PageLoading text="Carregando produtos..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Erro ao carregar produtos"
        description="Não foi possível conectar ao servidor. Tente novamente mais tarde."
      />
    );
  }

  if (!isAllProducts && brandProducts.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto max-w-7xl px-5 lg:px-10 pt-4 pb-18 lg:pt-8 lg:pb-30">
          <div className="mb-6 lg:mb-8">
            <Breadcrumbs
              items={[{ label: "Home", href: "/" }, { label: brandName }]}
            />
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="font-lato text-2xl font-semibold text-gray-800 mb-2">
              Nenhum produto encontrado
            </h2>
            <p className="text-gray-500 mb-6">
              Não encontramos produtos da marca {brandName} no momento.
            </p>
            <a
              href="/all"
              className="px-6 py-3 bg-[#D5A60A] text-white rounded-lg hover:bg-[#C09609] transition-colors"
            >
              Ver todos os produtos
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white brand">
        <div className="container mx-auto max-w-7xl px-5 lg:px-10 pt-4 pb-18 lg:pt-8 lg:pb-30">
          {/* Breadcrumb e Header */}
          <div className="mb-6">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                {
                  label: isAllProducts ? "Todas as marcas" : brandName,
                  href: `/marcas/${isAllProducts ? "all" : brandName.toLowerCase()}`,
                },
              ]}
            />

            {/* Header com título e controles */}
            <div className="flex lg:h-[44px] items-center justify-between mb-6 lg:mb-12">
              <div className="flex-1">
                <h1 className="text-3xl lg:text-[32px]">
                  {isAllProducts ? "Todas as marcas" : brandName}
                </h1>
              </div>

              {/* Botão Filtros com Badge */}
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="relative flex items-center justify-center w-[44px] h-[44px] px-1.5 bg-[#D5A60A] rounded-lg cursor-pointer hover:bg-[#C09609] transition-colors"
                title="Abrir filtros"
                aria-label="Abrir filtros"
              >
                <svg
                  width="28"
                  height="14"
                  viewBox="0 0 28 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M23 7C23 7.26522 22.8946 7.51957 22.7071 7.70711C22.5196 7.89464 22.2652 8 22 8H6C5.73478 8 5.48043 7.89464 5.29289 7.70711C5.10536 7.51957 5 7.26522 5 7C5 6.73478 5.10536 6.48043 5.29289 6.29289C5.48043 6.10536 5.73478 6 6 6H22C22.2652 6 22.5196 6.10536 22.7071 6.29289C22.8946 6.48043 23 6.73478 23 7ZM27 0H1C0.734784 0 0.48043 0.105357 0.292893 0.292893C0.105357 0.48043 0 0.734784 0 1C0 1.26522 0.105357 1.51957 0.292893 1.70711C0.48043 1.89464 0.734784 2 1 2H27C27.2652 2 27.5196 1.89464 27.7071 1.70711C27.8946 1.51957 28 1.26522 28 1C28 0.734784 27.8946 0.48043 27.7071 0.292893C27.5196 0.105357 27.2652 0 27 0ZM17 12H11C10.7348 12 10.4804 12.1054 10.2929 12.2929C10.1054 12.4804 10 12.7348 10 13C10 13.2652 10.1054 13.5196 10.2929 13.7071C10.4804 13.8946 10.7348 14 11 14H17C17.2652 14 17.5196 13.8946 17.7071 13.7071C17.8946 13.5196 18 13.2652 18 13C18 12.7348 17.8946 12.4804 17.7071 12.2929C17.5196 12.1054 17.2652 12 17 12Z"
                    fill="white"
                  />
                </svg>

                {summary.activeCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-[#D23423] text-white text-xs font-semibold rounded-full">
                    {summary.activeCount}
                  </span>
                )}
              </button>
            </div>

            {/* Número de produtos e controles de ordenação e visualização - Desktop */}
            <div className="flex lg:h-[32px] items-center justify-between">
              <p className="text-[18px] font-bold">
                {totalCount.toLocaleString("pt-BR")}{" "}
                {pluralize(totalCount, "anúncio", "anúncios")}
              </p>

              {/* Controles de ordenação */}
              <div className="flex items-center gap-[14px]">
                {/* Botão de alternancia de visualização - Desktop */}
                <button
                  onClick={() =>
                    setViewMode(viewMode === "grid" ? "list" : "grid")
                  }
                  className="flex items-center justify-center w-[32px] h-[32px] rounded-lg hover:bg-gray-50 transition-colors"
                  title={
                    viewMode === "grid"
                      ? "Alternar para lista"
                      : "Alternar para grade"
                  }
                  aria-label={
                    viewMode === "grid"
                      ? "Alternar para visualização em lista"
                      : "Alternar para visualização em grade"
                  }
                >
                  {viewMode === "grid" ? (
                    <svg
                      width="24"
                      height="20"
                      viewBox="0 0 24 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22 11H2C1.46957 11 0.960859 11.2107 0.585786 11.5858C0.210714 11.9609 0 12.4696 0 13V18C0 18.5304 0.210714 19.0391 0.585786 19.4142C0.960859 19.7893 1.46957 20 2 20H22C22.5304 20 23.0391 19.7893 23.4142 19.4142C23.7893 19.0391 24 18.5304 24 18V13C24 12.4696 23.7893 11.9609 23.4142 11.5858C23.0391 11.2107 22.5304 11 22 11ZM22 18H2V13H22V18ZM22 0H2C1.46957 0 0.960859 0.210714 0.585786 0.585786C0.210714 0.960859 0 1.46957 0 2V7C0 7.53043 0.210714 8.03914 0.585786 8.41421C0.960859 8.78929 1.46957 9 2 9H22C22.5304 9 23.0391 8.78929 23.4142 8.41421C23.7893 8.03914 24 7.53043 24 7V2C24 1.46957 23.7893 0.960859 23.4142 0.585786C23.0391 0.210714 22.5304 0 22 0ZM22 7H2V2H22V7Z"
                        fill="#141414"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 0H2C1.46957 0 0.960859 0.210714 0.585786 0.585786C0.210714 0.960859 0 1.46957 0 2V8C0 8.53043 0.210714 9.03914 0.585786 9.41421C0.960859 9.78929 1.46957 10 2 10H8C8.53043 10 9.03914 9.78929 9.41421 9.41421C9.78929 9.03914 10 8.53043 10 8V2C10 1.46957 9.78929 0.960859 9.41421 0.585786C9.03914 0.210714 8.53043 0 8 0ZM8 8H2V2H8V8ZM20 0H14C13.4696 0 12.9609 0.210714 12.5858 0.585786C12.2107 0.960859 12 1.46957 12 2V8C12 8.53043 12.2107 9.03914 12.5858 9.41421C12.9609 9.78929 13.4696 10 14 10H20C20.5304 10 21.0391 9.78929 21.4142 9.41421C21.7893 9.03914 22 8.53043 22 8V2C22 1.46957 21.7893 0.960859 21.4142 0.585786C21.0391 0.210714 20.5304 0 20 0ZM20 8H14V2H20V8ZM8 12H2C1.46957 12 0.960859 12.2107 0.585786 12.5858C0.210714 12.9609 0 13.4696 0 14V20C0 20.5304 0.210714 21.0391 0.585786 21.4142C0.960859 21.7893 1.46957 22 2 22H8C8.53043 22 9.03914 21.7893 9.41421 21.4142C9.78929 21.0391 10 20.5304 10 20V14C10 13.4696 9.78929 12.9609 9.41421 12.5858C9.03914 12.2107 8.53043 12 8 12ZM8 20H2V14H8V20ZM20 12H14C13.4696 12 12.9609 12.2107 12.5858 12.5858C12.2107 12.9609 12 13.4696 12 14V20C12 20.5304 12.2107 21.0391 12.5858 21.4142C12.9609 21.7893 13.4696 22 14 22H20C20.5304 22 21.0391 21.7893 21.4142 21.4142C21.7893 21.0391 22 20.5304 22 20V14C22 13.4696 21.7893 12.9609 21.4142 12.5858C21.0391 12.2107 20.5304 12 20 12ZM20 20H14V14H20V20Z"
                        fill="#141414"
                      />
                    </svg>
                  )}
                </button>

                {/* Botão de ordenação - Desktop */}
                <div className="relative">
                  <button
                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                    className="flex items-center justify-center w-[32px] h-[32px] rounded-lg hover:bg-gray-50 transition-colors"
                    title="Ordenar"
                    aria-label="Ordenar produtos"
                  >
                    <ArrowDownUp />
                  </button>

                  {/* Dropdown de orderenação - Desktop */}
                  {isSortDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsSortDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleSortChange(option.value)}
                            className={`w-full text-left px-4 py-2.5 font-lato text-sm transition-colors flex items-center justify-between ${sortBy === option.value ? "bg-[#FFF9E6] text-[#D5A60A] font-medium" : "text-[#141414] hover:bg-gray-50"}`}
                          >
                            <span>{option.label}</span>
                            {sortBy === option.value && (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Produtos */}
          <div
            className={`transition-all duration-300 ease-in-out ${viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8" : "grid grid-cols-1 gap-4 lg:flex lg:flex-col"}`}
          >
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fadeIn"
                style={{
                  animationDelay: `${index * 20}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <ProductCard product={product} viewMode={viewMode} />
              </div>
            ))}
          </div>

          {/* Mensagem quando não existem produtos */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="font-lato text-gray-400 text-lg">
                Nenhum produto encontrado para esses filtros.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Filtros */}
      {filterOptions && (
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          filterOptions={filterOptions}
          currentFilters={filters}
          onApplyFilters={handleApplyFilters}
        />
      )}
    </>
  );
}
