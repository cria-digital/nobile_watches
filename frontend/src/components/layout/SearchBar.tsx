"use client";

import { useSearch } from "@/lib/hooks/useSearch";
import { findBrandSlug } from "@/lib/utils/stringUtils";
import { Product } from "@/types/product";
import { Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({
  placeholder = "Pesquisar relógios...",
  onSearch,
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Usar o hook de busca com debounce
  const { results, isLoading } = useSearch({
    query,
    limit: 6,
    debounceMs: 300,
    minChars: 2,
  });

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    // Verifica se a query corresponde a alguma marca
    const brandSlug = findBrandSlug(query);

    if (brandSlug) {
      // Se for uma marca, redireciona para a página da marca
      router.push(`/${brandSlug}`);
    } else {
      // Se não for uma marca, redireciona para a página de busca
      router.push(`/search/${encodeURIComponent(query.trim())}`);
    }

    // Limpa o input e fecha sugestões após a busca
    setQuery("");
    setShowSuggestions(false);

    // Chama o callback se fornecido
    if (onSearch) {
      onSearch(query.trim());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.trim().length >= 2);
  };

  const handleClearInput = () => {
    setQuery("");
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (product: Product) => {
    // Navegar para a página do produto
    const brandSlug = findBrandSlug(product.brand);
    const productSlug = `${product.model.toLowerCase().replace(/\s+/g, "-")}-${product.id}`;

    if (brandSlug) {
      router.push(`/${brandSlug}/${productSlug}`);
    }

    // Limpar e fechar
    setQuery("");
    setShowSuggestions(false);

    if (onSearch) {
      onSearch(product.model);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none">
            <Search
              className="h-[21px] w-[21px] text-[#141414]"
              aria-hidden="true"
            />
          </div>

          <input
            type="search"
            className="block w-full pl-[48px] pr-10 py-3 border border-[#EFEFEF] rounded-xl leading-5 bg-[#f7f7f7] placeholder-gray-400 placeholder:font-bold focus:outline-none focus:placeholder-gray-400 focus:border-[#D9D9D9] font-lato font-medium text-sm transition-colors"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            maxLength={225}
            aria-label="Pesquisar relógios"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={showSuggestions && results.length > 0}
          />

          {query && (
            <button
              type="button"
              onClick={handleClearInput}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Limpar busca"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Sugestões de busca */}
      {showSuggestions && query.trim().length >= 2 && (
        <div
          id="search-suggestions"
          className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
          role="listbox"
        >
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Buscando relógios...
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-[400px] overflow-y-auto">
              {results.map((product) => (
                <li key={product.id} role="option">
                  <button
                    type="button"
                    onClick={() => handleSelectSuggestion(product)}
                    className="w-full p-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
                  >
                    {/* Imagem do produto */}
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={product.images[0] || "/placeholder-watch.jpg"}
                        alt={`${product.brand} ${product.model}`}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Informações do produto */}
                    <div className="flex-1 min-w-0">
                      <p className="font-erstoria text-sm text-[#141414] truncate">
                        {product.brand}
                      </p>
                      <p className="font-lato text-xs text-gray-500 truncate">
                        {product.model}
                      </p>
                      {product.referenceNumber && (
                        <p className="font-lato text-xs text-gray-400 truncate">
                          Ref. {product.referenceNumber}
                        </p>
                      )}
                    </div>

                    {/* Preço */}
                    <div className="flex-shrink-0 text-right">
                      <p className="font-lato font-bold text-sm text-[#141414]">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}

              {/* Link para ver todos os resultados */}
              <li>
                <Link
                  href={`/${encodeURIComponent(query.trim())}`}
                  onClick={() => {
                    setQuery("");
                    setShowSuggestions(false);
                  }}
                  className="block w-full p-3 text-center text-sm font-medium text-[#D5A60A] hover:bg-gray-50 transition-colors border-t border-gray-100"
                >
                  Ver todos os resultados para &quot;{query}&quot;
                </Link>
              </li>
            </ul>
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">
                Nenhum resultado encontrado
              </p>
              <p className="text-xs text-gray-400">
                Tente buscar por marca, modelo ou referência
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
