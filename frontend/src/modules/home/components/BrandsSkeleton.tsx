/**
 * Skeleton para a section de Marcas durante carregamento
 * Mantém o layout estável e evita layout shifts
 */

export function BrandsSkeleton() {
  // Renderiza 8 placeholders de marcas (quantidade média visível)
  const skeletonCount = 8;

  return (
    <section
      aria-label="Carregando marcas"
      className="pt-6 pb-5 lg:pt-12 lg:pb-8"
    >
      <div className="relative">
        {/* Gradientes laterais mantidos para consistência visual */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-[#f7f7f7] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-[#f7f7f7] to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden">
          <div className="h-[89px] md:h-[116px] flex items-center gap-1 md:gap-6 lg:gap-[30px] min-w-max">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[120px] md:w-[160px] h-[70px] md:h-[90px]"
              >
                {/* Skeleton card com animação de shimmer */}
                <div className="relative w-full h-full bg-gray-200 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
