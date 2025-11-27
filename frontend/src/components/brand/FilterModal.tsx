"use client";

import { AppliedFilters } from "@/types/filters";
import { SearchFilterOptions } from "@/types/nobile";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

/**
 * Mapeamento de marcas disponíveis com logos
 * Key: nome normalizado da marca (lowercase, sem parênteses)
 * Value: caminho do logo
 */
const BRAND_LOGOS: Record<string, string> = {
  rolex: "/images/brand/marca1.svg",
  "tag heuer": "/images/brand/marca2.svg",
  breitling: "/images/brand/marca3.svg",
  "audemars piguet": "/images/brand/marca4.svg",
  "patek philippe": "/images/brand/marca5.svg",
  hublot: "/images/brand/marca6.svg",
  cartier: "/images/brand/marca7.svg",
  seiko: "/images/brand/marca8.svg",
  omega: "/images/brand/marca9.svg",
  iwc: "/images/brand/marca10.svg",
};

/**
 * Normaliza o nome da marca para buscar no mapeamento de logos
 * Remove parênteses e conteúdo dentro deles, converte para lowercase
 */
function normalizeBrandName(brandName: string): string {
  return brandName
    .replace(/\s*\([^)]*\)/g, "") // Remove (inspired) ou qualquer outro texto entre parênteses
    .toLowerCase()
    .trim();
}

/**
 * Verifica se uma marca tem logo disponível
 */
function hasLogo(brandName: string): boolean {
  const normalized = normalizeBrandName(brandName);
  return normalized in BRAND_LOGOS;
}

/**
 * Obtém o caminho do logo de uma marca
 */
function getBrandLogo(brandName: string): string | null {
  const normalized = normalizeBrandName(brandName);
  return BRAND_LOGOS[normalized] || null;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterOptions: SearchFilterOptions;
  currentFilters: AppliedFilters;
  onApplyFilters: (filters: AppliedFilters) => void;
}

export function FilterModal({
  isOpen,
  onClose,
  filterOptions,
  currentFilters,
  onApplyFilters,
}: FilterModalProps) {
  // Estado local dos filtros enquanto modal está aberto
  const [localFilters, setLocalFilters] = useState<AppliedFilters>(currentFilters);

  // Sincronizar quando currentFilters mudam
  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  // Previne scroll da página quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  /**
   * Separa as marcas vindas da API em duas categorias:
   * 1. Marcas com logos (principais marcas)
   * 2. Marcas sem logos (outras marcas)
   */
  const { mainBrands, otherBrands } = useMemo(() => {
    const brandsWithLogos: Array<{ name: string; logo: string }> = [];
    const brandsWithoutLogos: string[] = [];

    // Ordena alfabeticamente para consistência
    const sortedBrands = [...filterOptions.brands].sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );

    sortedBrands.forEach(brand => {
      const logo = getBrandLogo(brand);
      if (logo) {
        brandsWithLogos.push({ name: brand, logo });
      } else {
        brandsWithoutLogos.push(brand);
      }
    });

    return {
      mainBrands: brandsWithLogos,
      otherBrands: brandsWithoutLogos,
    };
  }, [filterOptions.brands]);

  // Contar filtros ativos
  const activeFiltersCount = Object.values(localFilters).reduce((count, value) => {
    if (Array.isArray(value)) {
      return count + value.length;
    }
    if (typeof value === "boolean" && value) {
      return count + 1;
    }
    if (value?.min !== undefined && value?.max !== undefined) {
      if (value.min > 0 || value.max < 1000000) {
        return count + 1;
      }
    }
    return count;
  }, 0);

  // Handlers para atualizações de filtros
  const handleClearFilters = () => {
    const clearedFilters: AppliedFilters = {
      priceRange: { min: 0, max: 1000000 },
      brands: [],
      models: [],
      caseMaterials: [],
      braceletMaterials: [],
      dialColors: [],
      movements: [],
      conditions: [],
      verifiedSellersOnly: false,
      hasBoxOnly: false,
      hasDocumentsOnly: false,
      gender: [],
    };
    setLocalFilters(clearedFilters);
    // Aplica os filtros limpos imediatamente
    onApplyFilters(clearedFilters);
  };

  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const toggleBrand = (brand: string) => {
    setLocalFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand],
    }));
  };

  const toggleModel = (model: string) => {
    setLocalFilters(prev => ({
      ...prev,
      models: prev.models.includes(model)
        ? prev.models.filter(m => m !== model)
        : [...prev.models, model],
    }));
  };

  const toggleCaseMaterial = (material: string) => {
    setLocalFilters(prev => ({
      ...prev,
      caseMaterials: prev.caseMaterials.includes(material)
        ? prev.caseMaterials.filter(m => m !== material)
        : [...prev.caseMaterials, material],
    }));
  };

  const toggleBraceletMaterial = (material: string) => {
    setLocalFilters(prev => ({
      ...prev,
      braceletMaterials: prev.braceletMaterials.includes(material)
        ? prev.braceletMaterials.filter(m => m !== material)
        : [...prev.braceletMaterials, material],
    }));
  };

  const toggleCondition = (condition: string) => {
    setLocalFilters(prev => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions, condition],
    }));
  };

  const toggleMovement = (movement: string) => {
    setLocalFilters(prev => ({
      ...prev,
      movements: prev.movements.includes(movement)
        ? prev.movements.filter(m => m !== movement)
        : [...prev.movements, movement],
    }));
  };

  const toggleColor = (color: string) => {
    setLocalFilters(prev => ({
      ...prev,
      dialColors: prev.dialColors.includes(color)
        ? prev.dialColors.filter(c => c !== color)
        : [...prev.dialColors, color],
    }));
  };

  const handlePriceChange = (type: "min" | "max", value: number) => {
    setLocalFilters(prev => ({
      ...prev,
      priceRange: { ...prev.priceRange, [type]: value },
    }));
  };

  const toggleCheckbox = (
    key: "verifiedSellersOnly" | "hasBoxOnly" | "hasDocumentsOnly"
  ) => {
    setLocalFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-250 overflow-hidden">
      {/* Backdrop mais suave */}
      <div
        className="absolute inset-0 bg-black/20 transition-opacity"
        onClick={onClose}
      />
      {/* Modal - largura fixa de 504px */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full max-w-[504px] bg-white flex flex-col h-9/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header fixo */}
          <div className="h-[64px] lg:h-auto flex-shrink-0 flex items-center justify-between px-[20px] lg:px-8 pt-6 lg:pt-[38px] pb-6">
            <h2 className="text-[24px] leading-none">Filtros</h2>
            <button
              onClick={onClose}
              className="w-auto h-auto flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Fechar"
            >
              <Image src="/icons/close-icon.svg" alt="Fechar" width={32} height={32} />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-5 lg:px-8 py-4 lg:py-2 space-y-8">
            {/* Principais Marcas - Apenas se houver marcas com logos */}
            {mainBrands.length > 0 && (
              <div>
                <h3 className="font-lato text-sm mb-4">Principais marcas</h3>
                <div className="flex flex-row gap-3 flex-wrap">
                  {mainBrands.map((brand, index) => (
                    <button
                      key={`${brand.name}-${index}`}
                      className={`flex items-center h-[36px] px-3.5 rounded-sm border transition-all font-lato text-sm ${localFilters.brands.includes(brand.name) ? "border-[#D5A60A] bg-[#FFF9E6] text-[#D5A60A]" : "border-gray-300 text-[#141414] hover:border-gray-400 bg-white"}`}
                      onClick={() => toggleBrand(brand.name)}
                    >
                      <span className="text-[#0F0F0F] text-center leading-[140%] tracking-[-1%] whitespace-nowrap">
                        {brand.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Outras Marcas - Apenas se houver marcas sem logos */}
            {otherBrands.length > 0 && (
              <div>
                <h3 className="font-lato text-sm mb-4">
                  {mainBrands.length > 0 ? "Outras marcas" : "Marcas"}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {otherBrands.map(brand => (
                    <button
                      key={brand}
                      className={`px-4 py-2.5 rounded-[4px] border transition-all font-lato text-sm ${localFilters.brands.includes(brand) ? "border-[#D5A60A] bg-[#FFF9E6] text-[#D5A60A]" : "border-gray-300 text-[#141414] hover:border-gray-400 bg-white"}`}
                      onClick={() => toggleBrand(brand)}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Modelos */}
            {/* {filterOptions.models.length > 0 && (
              <div>
                <h3 className="font-lato text-sm mb-4">Modelo</h3>
                <div className="flex flex-wrap gap-3">
                  {filterOptions.models.map(model => (
                    <button
                      key={model}
                      className={`px-4 py-2.5 rounded-[4px] border transition-all font-lato text-sm ${localFilters.models.includes(model) ? "border-[#D5A60A] bg-[#FFF9E6] text-[#D5A60A]" : "border-gray-300 text-[#141414] hover:border-gray-400 bg-white"}`}
                      onClick={() => toggleModel(model)}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>
            )} */}

            {/* Faixa de Valor */}
            <div>
              <h3 className="font-lato text-sm mb-4">Faixa de valor</h3>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="range"
                    min={filterOptions.priceRange.min}
                    max={filterOptions.priceRange.max}
                    value={localFilters.priceRange.min}
                    onChange={e => handlePriceChange("min", parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D5A60A]"
                  />
                  <input
                    type="range"
                    min={filterOptions.priceRange.min}
                    max={filterOptions.priceRange.max}
                    value={localFilters.priceRange.max}
                    onChange={e => handlePriceChange("max", parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D5A60A] -mt-2"
                  />
                </div>
                <div className="flex items-center justify-between font-lato text-sm text-[#D5A60A] font-medium">
                  <span>
                    R${" "}
                    {localFilters.priceRange.min.toLocaleString("pt-BR", {
                      minimumFractionDigits: 0,
                    })}
                  </span>
                  <span>
                    R${" "}
                    {localFilters.priceRange.max.toLocaleString("pt-BR", {
                      minimumFractionDigits: 0,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Material da caixa */}
            {filterOptions.caseMaterials.length > 0 && (
              <div>
                <h3 className="font-lato text-sm mb-4">Material da caixa</h3>
                <div className="flex flex-wrap gap-3">
                  {filterOptions.caseMaterials.map(material => (
                    <button
                      key={material}
                      className={`px-4 py-2.5 rounded-[4px] border transition-all font-lato text-sm ${localFilters.caseMaterials.includes(material) ? "border-[#D5A60A] bg-[#FFF9E6] text-[#D5A60A]" : "border-gray-300 text-[#141414] hover:border-gray-400 bg-white"}`}
                      onClick={() => toggleCaseMaterial(material)}
                    >
                      {material}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tipo de movimento */}
            {filterOptions.movements.length > 0 && (
              <div>
                <h3 className="font-lato text-sm mb-4">Tipo de movimento</h3>
                <div className="flex flex-wrap gap-3">
                  {filterOptions.movements.map(movement => (
                    <button
                      key={movement}
                      className={`px-4 py-2.5 rounded-[4px] border transition-all font-lato text-sm ${localFilters.movements.includes(movement) ? "border-[#D5A60A] bg-[#FFF9E6] text-[#D5A60A]" : "border-gray-300 text-[#141414] hover:border-gray-400 bg-white"}`}
                      onClick={() => toggleMovement(movement)}
                    >
                      {movement}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cores do mostrador */}
            {filterOptions.dialColors.length > 0 && (
              <div>
                <h3 className="font-lato text-sm mb-4">Cor do mostrador</h3>
                <div className="flex flex-wrap gap-3">
                  {filterOptions.dialColors.map(color => (
                    <button
                      key={color}
                      className={`px-4 py-2.5 rounded-[4px] border transition-all font-lato text-sm ${localFilters.dialColors.includes(color) ? "border-[#D5A60A] bg-[#FFF9E6] text-[#D5A60A]" : "border-gray-300 text-[#141414] hover:border-gray-400 bg-white"}`}
                      onClick={() => toggleColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filtros Adicionais */}
            <div>
              <h3 className="font-lato text-sm mb-4">Outros filtros</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localFilters.verifiedSellersOnly}
                    onChange={() => toggleCheckbox("verifiedSellersOnly")}
                    className="w-5 h-5 rounded border-gray-300 text-[#D5A60A] cursor-pointer"
                  />
                  <span className="font-lato text-sm text-[#141414]">
                    Apenas vendedores verificados
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localFilters.hasBoxOnly}
                    onChange={() => toggleCheckbox("hasBoxOnly")}
                    className="w-5 h-5 rounded border-gray-300 text-[#D5A60A] cursor-pointer"
                  />
                  <span className="font-lato text-sm text-[#141414]">
                    Com caixa original
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localFilters.hasDocumentsOnly}
                    onChange={() => toggleCheckbox("hasDocumentsOnly")}
                    className="w-5 h-5 rounded border-gray-300 text-[#D5A60A] cursor-pointer"
                  />
                  <span className="font-lato text-sm text-[#141414]">
                    Com documentação
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer fixo */}
          <div className="h-auto flex-shrink-0 px-5 lg:px-[30px] py-6 lg:py-[30px] border-t border-gray-200 flex gap-4">
            <button
              onClick={handleClearFilters}
              className="flex-1 px-6 py-3 border-2 border-[#D5A60A] text-[#D5A60A] rounded-full font-lato text-base font-medium hover:bg-[#FFF9E6] transition-colors"
            >
              Limpar ({activeFiltersCount})
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex-1 px-6 py-3 bg-[#D5A60A] text-white rounded-full font-lato text-base font-medium hover:bg-[#C09509] transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
