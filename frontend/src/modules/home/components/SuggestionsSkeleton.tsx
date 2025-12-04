/**
 * Skeleton para a section de Sugestões durante carregamento
 * Renderiza placeholders para os cards de produtos
 */

export function SuggestionsSkeleton() {
  // Renderiza 4 placeholders de produtos (grid padrão)
  const skeletonCount = 4;

  return (
    <section aria-label="Carregando sugestões" className="py-6 lg:py-12">
      {/* Header com título skeleton */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="h-7 md:h-8 w-48 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Grid de produtos skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={index} className="flex flex-col space-y-3">
            {/* Imagem skeleton */}
            <div className="relative aspect-square w-full bg-gray-200 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
            </div>

            {/* Informações skeleton */}
            <div className="space-y-2">
              {/* Marca */}
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
              {/* Modelo */}
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              {/* Preço */}
              <div className="h-5 w-1/2 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
