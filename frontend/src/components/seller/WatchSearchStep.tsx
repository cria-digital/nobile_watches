"use client";

import { Button } from "@/components/ui";
import { useWatchSuggestions } from "@/lib/hooks/useWatchSuggestions";
import { WatchSuggestion } from "@/lib/services/api.service";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { UseFormSetValue } from "react-hook-form";

interface WatchSearchStepProps {
  setValue: UseFormSetValue<any>;
  onContinue: () => void;
}

export function WatchSearchStep({ setValue, onContinue }: WatchSearchStepProps) {
  const { suggestions, loading, error, searchSuggestions, clearSuggestions } =
    useWatchSuggestions();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<WatchSuggestion | null>(
    null
  );
  const searchRef = useRef<HTMLDivElement>(null);

  // Fecha as sugestões ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setSelectedSuggestion(null);

    if (!value.trim()) {
      clearSuggestions();
      setShowSuggestions(false);
      return;
    }

    searchSuggestions(value);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (suggestion: WatchSuggestion) => {
    setSelectedSuggestion(suggestion);
    setSearchQuery(`${suggestion.brand} ${suggestion.model}`);

    // Preenche os campos do formulário
    setValue("brand", suggestion.brand);
    setValue("model", suggestion.model);
    setValue("referenceNumber", suggestion.referenceNumber || "");

    // Preenche campos opcionais se disponíveis
    if (suggestion.caseMaterial) setValue("caseMaterial", suggestion.caseMaterial);
    if (suggestion.caseDiameter) setValue("caseDiameter", suggestion.caseDiameter);
    if (suggestion.dialColor) setValue("dialColor", suggestion.dialColor);
    if (suggestion.movement) setValue("movement", suggestion.movement);
    if (suggestion.year) setValue("year", suggestion.year);
    //  if (suggestion.averagePrice > 0) setValue("price", suggestion.averagePrice);

    clearSuggestions();
    setShowSuggestions(false);
  };

  const handleManualEntry = () => {
    // Limpa os campos e vai direto para o Step 1
    setValue("brand", "");
    setValue("model", "");
    setValue("referenceNumber", "");
    onContinue();
  };

  const handleContinue = () => {
    onContinue();
  };

  return (
    <div className="flex flex-col items-center lg:items-start">
      <Image
        src="/images/seller/seller-box.svg"
        alt="Seller box"
        width={178}
        height={178}
        className="w-[178px] h-[178px] lg:w-[102px] lg:h-[102px]"
        priority
      />

      <h2 className="text-2xl mt-2 mb-3 lg:mb-2.5 leading-[30px] tracking-[-0.01em] text-center">
        Qual relógio você deseja anunciar?
      </h2>
      <p className="text-gray-400 text-sm font-light leading-[20px] mb-5 lg:mb-4 text-center lg:text-left max-w-md lg:max-w-lg">
        Digite a marca, modelo ou referência do seu relógio para facilitar o preenchimento
        automático das informações.
      </p>

      {/* Campo de busca com sugestões */}
      <div ref={searchRef} className="relative w-full max-w-2xl mb-6">
        <label className="block">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleInputChange(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              className="w-full px-4 py-3 pr-12 border border-[#D9D9D9] bg-[#F7F7F7] rounded-[12px] focus:outline-none focus:border-[#D5A60A] transition-colors"
              placeholder="Ex: Patek Philippe Aquanaut"
              autoComplete="off"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#D5A60A] rounded-lg"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </label>

        {/* Loading indicator */}
        {loading && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-lg border border-[#EFEFEF] shadow-lg z-50">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <svg
                className="animate-spin h-5 w-5"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm">Buscando sugestões...</span>
            </div>
          </div>
        )}

        {/* Lista de sugestões */}
        {showSuggestions && !loading && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-[#EFEFEF] shadow-lg z-50 max-h-[400px] overflow-y-auto">
            <div className="py-2">
              {suggestions.map(suggestion => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full px-4 py-3 hover:bg-[#F8F2DC] transition-colors text-left flex items-center gap-3"
                >
                  {/* Imagem */}
                  {suggestion.imageUrl ? (
                    <div className="w-12 h-12 relative flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                      <Image
                        src={suggestion.imageUrl}
                        alt={suggestion.label}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 flex-shrink-0 rounded-md bg-gray-100 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {suggestion.brand} {suggestion.model}
                    </p>
                    {suggestion.referenceNumber && (
                      <p className="text-xs text-gray-500">
                        Ref: {suggestion.referenceNumber}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-1">
                      {suggestion.caseMaterial && (
                        <span className="text-xs text-gray-600">
                          {suggestion.caseMaterial}
                        </span>
                      )}
                      {suggestion.caseDiameter && (
                        <span className="text-xs text-gray-600">
                          • {suggestion.caseDiameter}mm
                        </span>
                      )}
                      {suggestion.year && (
                        <span className="text-xs text-gray-600">• {suggestion.year}</span>
                      )}
                    </div>
                  </div>

                  {/* Preço */}
                  {suggestion.averagePrice > 0 && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-[#D5A60A]">
                        R${" "}
                        {suggestion.averagePrice.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-gray-500">Preço médio</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mensagem quando não há resultados */}
        {showSuggestions &&
          suggestions.length === 0 &&
          !loading &&
          searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-lg border border-[#EFEFEF] shadow-lg z-50">
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-3">
                  Nenhum relógio encontrado na nossa base.
                </p>
                <button
                  type="button"
                  onClick={handleManualEntry}
                  className="text-[#D5A60A] text-sm font-medium hover:underline"
                >
                  Preencher manualmente →
                </button>
              </div>
            </div>
          )}
      </div>

      {/* Botão para modo manual */}
      <button
        type="button"
        onClick={handleManualEntry}
        className="text-sm text-gray-600 hover:text-[#D5A60A] transition-colors mb-6"
      >
        Não encontrou seu relógio?{" "}
        <span className="font-semibold underline">Preencher manualmente</span>
      </button>

      {/* Card de relógio selecionado */}
      {selectedSuggestion && (
        <div className="mt-6 lg:mt-3 w-full max-w-2xl p-4 bg-gray-50 rounded-lg border border-[#EFEFEF]">
          <div className="flex items-start gap-3">
            {/* Imagem do relógio selecionado */}
            <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-white">
              {selectedSuggestion.imageUrl ? (
                <img
                  src={selectedSuggestion.imageUrl}
                  alt={selectedSuggestion.label}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Informações detalhadas */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm 0 mb-1">{selectedSuggestion.brand}</div>
                  <div className="font-erstoria text-md mb-1">
                    {selectedSuggestion.model}
                  </div>
                  {selectedSuggestion.referenceNumber && (
                    <div className="text-sm text-gray-600 mb-2">
                      {selectedSuggestion.referenceNumber}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSuggestion(null);
                    setValue("brand", "");
                    setValue("model", "");
                    setSearchQuery("");
                  }}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                  title="Remover seleção"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Grid de especificações */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {selectedSuggestion.caseMaterial && (
                  <div>
                    <span className="text-gray-400">Caixa:</span>{" "}
                    <span className="font-medium">{selectedSuggestion.caseMaterial}</span>
                  </div>
                )}
                {selectedSuggestion.dialColor && (
                  <div>
                    <span className="text-gray-400">Mostrador:</span>{" "}
                    <span className="font-medium">{selectedSuggestion.dialColor}</span>
                  </div>
                )}
                {selectedSuggestion.movement && (
                  <div>
                    <span className="text-gray-400">Movimento:</span>{" "}
                    <span className="font-medium">{selectedSuggestion.movement}</span>
                  </div>
                )}
                {selectedSuggestion.year && (
                  <div>
                    <span className="text-gray-400">Ano:</span>{" "}
                    <span className="font-medium">{selectedSuggestion.year}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão Continuar - aparece após selecionar um relógio */}
      {selectedSuggestion && (
        <div className="w-full max-w-2xl mt-6">
          <Button
            variant="gold"
            type="button"
            onClick={handleContinue}
            className="w-full"
          >
            Continuar
          </Button>
        </div>
      )}
    </div>
  );
}
