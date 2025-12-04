/**
 * Fallback para quando não há sugestões disponíveis ou ocorre erro
 * Exibe mensagem amigável e sugestão de navegação alternativa
 */

import Link from "next/link";

interface SuggestionsErrorFallbackProps {
  isPersonalized: boolean;
  onRetry?: () => void;
}

export function SuggestionsErrorFallback({
  isPersonalized,
  onRetry,
}: SuggestionsErrorFallbackProps) {
  return (
    <section
      aria-label="Sugestões indisponíveis"
      className="mb-8 md:mb-12 mt-[22px] md:mt-0"
    >
      {/* Mantém o header para consistência */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="font-erstoria text-2xl md:text-[28px] text-slate-900">
          {isPersonalized ? "Recomendado para você" : "Sugestões"}
        </h2>
      </div>

      {/* Mensagem de fallback */}
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg">
        <div className="text-center max-w-md">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma sugestão disponível
          </h3>

          <p className="text-gray-600 text-sm md:text-base mb-6">
            Não conseguimos carregar as sugestões no momento. Que tal explorar
            nossas marcas ou ver todos os relógios disponíveis?
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-pb-500 rounded-lg hover:bg-pb-600 transition-colors"
              >
                Tentar novamente
              </button>
            )}

            <Link
              href="/relogios"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-pb-500 bg-white border border-pb-500 rounded-lg hover:bg-pb-50 transition-colors"
            >
              Ver todos os relógios
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
