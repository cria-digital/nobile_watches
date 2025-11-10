"use client";

import { AppliedFilters } from "@/types/filters";
import { FilterOptions } from "@/types/mock";
import Image from "next/image";
import { useEffect, useState } from "react";

// Dados de marcas principais (com logos)
const mainBrands = [
  { name: "Rolex", logo: "/images/mock/logos/rolex.svg" },
  { name: "Patek Philippe", logo: "/images/mock/logos/patek-philippe.svg" },
  { name: "Omega", logo: "/images/mock/logos/omega.svg" },
  { name: "Hublot", logo: "/images/mock/logos/hublot.svg" },
];

const otherBrands = [
  "Audemars Piguet",
  "Breitling",
  "Tag Heuer",
  "Cartier",
  "IWC",
  "Seiko",
  "Longines",
  "Tissot",
];

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterOptions: FilterOptions;
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
  // Estado local dos filtros enquanto modal estÃ¡ aberto
  const [localFilters, setLocalFilters] = useState<AppliedFilters>(currentFilters);

  // Sincronizar quando currentFilters mudam
  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);
  // Previne scroll da pÃ¡gina quando modal estÃ¡ aberto
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

  const toggleMaterial = (material: string) => {
    setLocalFilters(prev => ({
      ...prev,
      caseMaterials: prev.caseMaterials.includes(material)
        ? prev.caseMaterials.filter(m => m !== material)
        : [...prev.caseMaterials, material],
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

  console.log("localFilters", localFilters);
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
          <div className="h-[64px] lg:h-auto flex-shrink-0 flex items-center justify-between px-[20px] lg:px-[40px] pt-6 lg:pt-[38px] pb-6 lg:pb-[30px]">
            <h2 className="text-[24px] leading-none">Filtros</h2>
            <button
              onClick={onClose}
              className="w-auto h-auto flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Fechar"
            >
              <Image src="/icons/XSquare.svg" alt="Fechar" width={32} height={32} />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-5 lg:px-[30px] py-4 lg:py-2 space-y-8">
            {/* Principais Marcas */}
            <div>
              <h3 className="font-lato text-sm text-[#141414] mb-4">Principais marcas</h3>
              <div className="grid grid-cols-4 gap-[22px]">
                {mainBrands.map((brand, index) => (
                  <button
                    key={`${brand.name}-${index}`}
                    className="flex flex-col items-center gap-2 transition-all"
                    onClick={() => toggleBrand(brand.name)}
                  >
                    <div
                      className={`w-[64px] h-[64px] rounded-full flex items-center justify-center transition-all ${localFilters.brands.includes(brand.name) ? "bg-[#FFF9E6] border-2 border-[#D5A60A]" : "bg-[#EFEFEF] border-2 border-transparent hover:border-gray-300"}`}
                    >
                      <div className="relative w-10 h-10 flex items-center justify-center">
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    <span className="font-erstoria text-[12px] text-[#0F0F0F] text-center leading-[140%] tracking-[-1%] whitespace-nowrap">
                      {brand.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Outras Marcas */}
            <div>
              <h3 className="font-lato text-sm text-[#141414] mb-4">Outras marcas</h3>
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

            {/* Faixa de Valor */}
            <div>
              <h3 className="font-lato text-sm mb-6">Faixa de valor</h3>
              <div className="space-y-5">
                <div className="relative px-1">
                  <input
                    type="range"
                    min={filterOptions.priceRange.min}
                    max={filterOptions.priceRange.max}
                    value={localFilters.priceRange.max}
                    onChange={e => handlePriceChange("max", parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D5A60A] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#D5A60A] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
                  />
                </div>
                <div className="flex justify-between px-1">
                  <span className="font-lato text-lg text-[#D5A60A] font-medium">
                    R$ {localFilters.priceRange.min.toLocaleString("pt-BR")}
                  </span>
                  <span className="font-lato text-lg text-[#D5A60A] font-medium">
                    R$ {localFilters.priceRange.max.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>

            {/* Material da Caixa */}
            <div>
              <h3 className="font-lato text-sm text-[#141414] mb-4">Material da caixa</h3>
              <div className="flex flex-wrap gap-3">
                {filterOptions.caseMaterials.map(material => (
                  <button
                    key={material}
                    className={`px-4 py-2.5 rounded-[4px] border transition-all font-lato text-sm ${localFilters.caseMaterials.includes(material) ? "border-[#D5A60A] bg-[#FFF9E6] text-[#D5A60A]" : "border-gray-300 text-[#141414] hover:border-gray-400 bg-white"}`}
                    onClick={() => toggleMaterial(material)}
                  >
                    {material}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo de Movimento */}
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

            {/* CondiÃ§Ã£o */}
            <div>
              <h3 className="font-lato text-sm mb-4"> CondiÃ§Ã£o do produto</h3>
              <div className="flex flex-wrap gap-3">
                {filterOptions.conditions.map(condition => (
                  <button
                    key={condition}
                    className={`px-4 py-2.5 rounded-[4px] border transition-all font-lato text-sm ${localFilters.conditions.includes(condition) ? "border-[#D5A60A] bg-[#FFF9E6] text-[#D5A60A]" : "border-gray-300 text-[#141414] hover:border-gray-400 bg-white"}`}
                    onClick={() => toggleCondition(condition)}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>

            {/* Cores do Mostrador */}
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
                    Com documentaÃ§Ã£o
                  </span>
                </label>
              </div>
            </div>
            {/* EspaÃ§o extra no final para scroll confortÃ¡vel */}
            <div className="h-4" />
          </div>

          {/* Footer - BotÃµes de AÃ§Ã£o fixos */}
          <div className="flex-shrink-0 px-8 py-6 border-t border-gray-100 bg-white">
            <div className="flex gap-2">
              <button
                onClick={handleClearFilters}
                className="flex-1 h-13 border-2 border-[#D5A60A] text-[#D5A60A] tracking-[2%] rounded-full font-lato font-bold text-base hover:bg-[#FFF9E6] transition-colors"
              >
                Limpar ({activeFiltersCount})
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 h-13 bg-[#D5A60A] text-white tracking-[2%] rounded-full font-lato font-bold text-base hover:bg-[#C09609] transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                disabled={activeFiltersCount === 0}
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </div>{" "}
    </div>
  );
}
