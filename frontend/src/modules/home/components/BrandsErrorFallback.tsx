/**
 * Fallback para quando não há marcas disponíveis ou ocorre erro
 * Exibe mensagem amigável sem quebrar o layout
 */

interface BrandsErrorFallbackProps {
  onRetry?: () => void;
}

export function BrandsErrorFallback({ onRetry }: BrandsErrorFallbackProps) {
  return (
    <section aria-label="Marcas indisponíveis" className="py-6 lg:py-12">
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <div className="text-center max-w-md">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>

          <p className="text-gray-600 text-sm md:text-base mb-4">
            Não foi possível carregar as marcas no momento.
          </p>

          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-pb-500 rounded-lg hover:bg-pb-600 transition-colors"
            >
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
