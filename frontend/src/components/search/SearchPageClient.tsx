"use client";

import { FilterModal } from "@/components/brand/FilterModal";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumbs, Button } from "@/components/ui";
import { useFilteredProducts } from "@/lib/hooks/useFilteredProducts";
import { useFilterOptions } from "@/lib/hooks/useFilterOptions";
import { useProductFilters } from "@/lib/hooks/useProductFilters";
import { useSearch } from "@/lib/hooks/useSearch";
import { AppliedFilters } from "@/types/filters";
import { AlertCircle, ListFilter } from "lucide-react";
import { useEffect, useState } from "react";

type ViewMode = "grid" | "list";

interface SearchPageClientProps {
  query: string;
}

export function SearchPageClient({ query }: SearchPageClientProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Busca inicial pelos produtos
  const { results: searchResults, isLoading: isSearching } = useSearch({
    query,
    limit: 50,
  });

  const { filterOptions, isLoading: isLoadingFilters } = useFilterOptions();

  // Hook para gerenciar filtros
  const {
    filters,
    // toggleArrayFilter,
    // updatePriceRange,
    // clearAllFilters,
    setAllFilters,
    summary,
  } = useProductFilters({
    initialFilters: {},
  });

  // Hook para produtos filtrados (aplica filtros sobre os resultados da busca)
  const {
    filteredProducts,
    totalCount,
    isLoading: isFilteringLoading,
  } = useFilteredProducts({
    brandName: "all",
    filters,
    sortBy,
  });

  // Usa os resultados filtrados se houver filtros ativos, caso contrário usa os resultados da busca
  const displayProducts = summary.hasActiveFilters ? filteredProducts : searchResults;

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

  const hasResults = displayProducts.length > 0;
  const isLoading = isSearching || isFilteringLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto max-w-7xl px-5 lg:px-10 pt-8 pb-18">
          <p className="text-center text-gray-500">Buscando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto max-w-7xl px-5 lg:px-10 pt-4 pb-18 lg:pt-8 lg:pb-30">
          {/* Breadcrumb e Header */}
          <div className="mb-6 lg:mb-8">
            <Breadcrumbs
              items={[{ label: "Home", href: "/" }, { label: "Busca" }, { label: query }]}
            />

            {hasResults ? (
              <>
                {/* Header com título e controles */}
                <div className="flex lg:h-[44px] items-center justify-between">
                  <div className="flex-1">
                    <h1 className="text-3xl lg:text-[32px]">{query}</h1>
                  </div>

                  {/* Botão Filtros com Badge */}
                  <button
                    onClick={() => setIsFilterModalOpen(true)}
                    className="relative flex items-center justify-center w-[44px] h-[44px] bg-[#D5A60A] rounded-lg cursor-pointer hover:bg-[#C09609] transition-colors"
                    title="Abrir filtros"
                    aria-label="Abrir filtros"
                  >
                    <ListFilter className="w-6 h-6 text-white" />
                    {summary.activeCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-[#D23423] text-white text-xs font-semibold rounded-full">
                        {summary.activeCount}
                      </span>
                    )}
                  </button>
                </div>

                <div className="flex lg:h-[32px] items-center justify-between mt-3 lg:mt-6">
                  <p className="text-[18px] font-bold">
                    {displayProducts.length.toLocaleString("pt-BR")} anúncios
                  </p>

                  {/* Controles de ordenação e visualização - Desktop */}
                  <div className="flex items-center gap-[14px]">
                    {/* Botão de alternância de visualização - Desktop */}
                    <button
                      onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                      className="hidden lg:flex items-center justify-center w-[32px] h-[32px] rounded-lg hover:bg-gray-50 transition-colors"
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
                  </div>
                </div>

                {/* Grid de Produtos */}
                <div
                  className={`transition-all duration-300 ease-in-out ${viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8" : "grid grid-cols-1 gap-4 md:gap-6 lg:flex lg:flex-col"}`}
                >
                  {displayProducts.map((product, index) => (
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
              </>
            ) : (
              <>
                {/* Título da busca sem resultados */}
                <h1 className="font-erstoria text-3xl md:text-4xl text-[#141414] mb-2 mt-6">
                  {query}
                </h1>

                {/* Mensagem de verificação de ortografia */}
                <p className="text-gray-500 text-sm mb-8 font-lato">
                  Você verificou a ortografia? Edite sua pesquisa ou tente outro termo de
                  busca.
                </p>

                {/* Card de nenhum resultado */}
                <div className="max-w-2xl mx-auto text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                    <AlertCircle className="w-10 h-10 text-gray-400" />
                  </div>

                  <h2 className="font-erstoria text-2xl md:text-3xl text-[#141414] mb-4">
                    Nunca mais perca de vista as melhores ofertas!
                  </h2>

                  <p className="text-gray-600 mb-8 font-lato">
                    Guarde esta pesquisa para ser notificado quando existirem novos
                    anúncios.
                  </p>

                  <Button
                    variant="outline"
                    size="lg"
                    className="inline-flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    Guardar pesquisa
                  </Button>
                </div>

             
              </>
            )}
          </div>
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
