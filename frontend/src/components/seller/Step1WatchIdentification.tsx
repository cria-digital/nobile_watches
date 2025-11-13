"use client";

import { useWatchSuggestions } from "@/lib/hooks/useWatchSuggestions";
import { WatchSuggestion } from "@/lib/services/api.service";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { Input } from "../ui";
import { PreviewCard } from "./PreviewCard";

interface Step1Props {
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  errors: FieldErrors<any>;
  register: UseFormRegister<any>;
}

export function Step1WatchIdentification({
  setValue,
  watch,
  errors,
  register,
}: Step1Props) {
  const { suggestions, loading, error, searchSuggestions, clearSuggestions } =
    useWatchSuggestions();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<WatchSuggestion | null>(
    null
  );
  const [manualMode, setManualMode] = useState(false);
  console.log("manualMode", manualMode);
  const searchRef = useRef<HTMLDivElement>(null);

  const formBrand = watch("brand");
  const formModel = watch("model");

  // Inicializa o campo de busca se houver valores no formulário (ao voltar ao step 1)
  // useEffect(() => {
  //   if (formBrand && formModel && !searchQuery) {
  //     console.log("EXECUTOU");
  //     setSearchQuery(`${formBrand} ${formModel}`);
  //     setSelectedSuggestion({
  //       id: 0,
  //       label: `${formBrand} ${formModel}`,
  //       brand: formBrand,
  //       model: formModel,
  //       referenceNumber: watch("referenceNumber") || "",
  //       imageUrl: "",
  //       caseMaterial: watch("caseMaterial") || "",
  //       caseDiameter: watch("caseDiameter") || 0,
  //       dialColor: watch("dialColor") || "",
  //       movement: watch("movement") || "",
  //       year: watch("year") || 0,
  //       averagePrice: 0,
  //     });
  //   }
  // }, [formBrand, formModel, searchQuery, watch]);

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

    // Limpa os campos do formulário se o campo de busca estiver vazio
    if (!value.trim()) {
      clearSuggestions();
      setShowSuggestions(false);
      return;
    }

    // Faz a busca
    searchSuggestions(value);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (suggestion: WatchSuggestion) => {
    // Define a sugestão selecionada
    setSelectedSuggestion(suggestion);

    // Atualiza o campo de busca
    setSearchQuery(`${suggestion.brand} ${suggestion.model}`);

    // Preenche os campos do formulário
    setValue("brand", suggestion.brand);
    setValue("model", suggestion.model);
    setValue("referenceNumber", suggestion.referenceNumber || "");

    // Preenche campos opcionais se disponíveis
    if (suggestion.caseMaterial) {
      setValue("caseMaterial", suggestion.caseMaterial);
    }
    if (suggestion.caseDiameter) {
      setValue("caseDiameter", suggestion.caseDiameter);
    }
    if (suggestion.dialColor) {
      setValue("dialColor", suggestion.dialColor);
    }
    if (suggestion.movement) {
      setValue("movement", suggestion.movement);
    }
    if (suggestion.year) {
      setValue("year", suggestion.year);
    }
    if (suggestion.averagePrice > 0) {
      setValue("price", suggestion.averagePrice);
    }

    // Fecha as sugestões
    clearSuggestions();
    setShowSuggestions(false);
    setManualMode(false);
  };

  const handleManualEntry = () => {
    setManualMode(true);
    setSelectedSuggestion(null);
    setShowSuggestions(false);
    clearSuggestions();
  };
  console.log("searchQuery", searchQuery);
  return (
    <div className="flex flex-col items-center">
      <Image
        src="/images/seller/seller-box.svg"
        alt="Caixa do vendedor"
        width={178}
        height={178}
        priority
      />
      <h2 className="text-2xl lg:text-3xl mt-2 mb-4 leading-[30px] tracking-[-0.01em] text-center">
        Qual relógio você deseja anunciar?
      </h2>
      <p className="text-gray-400 text-sm leading-[20px] mb-6 text-center max-w-md">
        Digite a marca, modelo ou referência do seu relógio para facilitar o preenchimento
        automático das informações.
      </p>

      {!manualMode ? (
        <>
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
                  <span className="text-sm">Buscando...</span>
                </div>
              </div>
            )}

            {/* Sugestões */}
            {showSuggestions && suggestions.length > 0 && !loading && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-[#EFEFEF] shadow-lg z-50 max-h-[400px] overflow-y-auto">
                {suggestions.map(suggestion => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-[#EFEFEF] last:border-b-0 text-left"
                  >
                    {/* Imagem do relógio */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      {suggestion.imageUrl ? (
                        <img
                          src={suggestion.imageUrl}
                          alt={suggestion.label}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Informações do relógio */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm mb-1">
                        {suggestion.brand}
                      </div>
                      <div className="font-medium text-gray-700 text-base mb-1">
                        {suggestion.model}
                      </div>
                      {suggestion.referenceNumber && (
                        <div className="text-sm text-gray-500 mb-2">
                          {suggestion.referenceNumber}
                        </div>
                      )}

                      {/* Especificações */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                        {suggestion.caseMaterial && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Caixa:</span>
                            <span className="text-gray-900">
                              {suggestion.caseMaterial}
                            </span>
                          </div>
                        )}
                        {suggestion.dialColor && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Mostrador:</span>
                            <span className="text-gray-900">{suggestion.dialColor}</span>
                          </div>
                        )}
                        {suggestion.movement && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Movimento:</span>
                            <span className="text-gray-900">{suggestion.movement}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
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
        </>
      ) : (
        <>
          {/* Modo manual - Campos de entrada */}
          <div className="w-full max-w-2xl space-y-4 mb-6">
            <div className="flex items-center justify-between mb-5">
              <p>Preenchimento manual</p>
              <button
                type="button"
                onClick={() => {
                  setManualMode(false);
                  // Limpa os campos do formulário ao voltar para busca
                  setValue("brand", "");
                  setValue("model", "");
                  setValue("referenceNumber", "");
                  setSearchQuery("");
                }}
                className="text-sm text-[#D5A60A] hover:underline"
              >
                ← Voltar para busca
              </button>
            </div>

            <Input
              {...register("brand")}
              id="brand"
              label="Marca *"
              type="text"
              error={errors.brand?.message as string}
            />

            <Input
              {...register("model")}
              id="model"
              label="Modelo *"
              type="text"
              error={errors.model?.message as string}
            />

            <Input
              {...register("referenceNumber")}
              id="referenceNumber"
              label="Número de referência"
              type="text"
              error={errors.referenceNumber?.message as string}
            />
          </div>
        </>
      )}

      {/* Card de sugestão selecionada */}
      {selectedSuggestion && !manualMode && (
        <div className="mt-6 w-full max-w-2xl p-4 bg-gray-50 rounded-lg border border-[#EFEFEF]">
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Informações detalhadas */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-600 mb-1">
                    {selectedSuggestion.brand}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mb-1">
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
                    <span className="text-gray-900 font-medium">
                      {selectedSuggestion.movement}
                    </span>
                  </div>
                )}
                {selectedSuggestion.year && (
                  <div>
                    <span className="text-gray-400">Ano:</span>{" "}
                    <span className="text-gray-900 font-medium">
                      {selectedSuggestion.year}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {manualMode && formBrand && formModel && (
        <PreviewCard brand={formBrand} model={formModel} className="mt-2 w-full" />
      )}
    </div>
  );
}
