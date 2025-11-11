"use client";

import { WatchSuggestion } from "@/lib/services/api";
import Image from "next/image";

interface WatchSuggestionsListProps {
  suggestions: WatchSuggestion[];
  loading: boolean;
  error: string | null;
  onSelectSuggestion: (suggestion: WatchSuggestion) => void;
  show: boolean;
}

export function WatchSuggestionsList({
  suggestions,
  loading,
  error,
  onSelectSuggestion,
  show,
}: WatchSuggestionsListProps) {
  if (!show) return null;

  return (
    <div className="absolute z-50 w-full mt-1 bg-white border border-[#EFEFEF] rounded-[12px] shadow-lg max-h-[400px] overflow-y-auto">
      {loading && (
        <div className="p-4 text-center text-gray-500 text-sm">Buscando sugestões...</div>
      )}

      {error && <div className="p-4 text-center text-red-500 text-sm">{error}</div>}

      {!loading && !error && suggestions.length === 0 && (
        <div className="p-4 text-center text-gray-500 text-sm">
          Nenhuma sugestão encontrada
        </div>
      )}

      {!loading && !error && suggestions.length > 0 && (
        <ul className="py-2">
          {suggestions.map(suggestion => (
            <li key={suggestion.id}>
              <button
                type="button"
                onClick={() => onSelectSuggestion(suggestion)}
                className="w-full px-4 py-3 hover:bg-[#F8F2DC] transition-colors text-left flex items-center gap-3"
              >
                {/* Imagem do relógio */}
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

                {/* Informações do relógio */}
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

                {/* Preço médio */}
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
