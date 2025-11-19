import { formatCurrency } from "@/lib/utils/format";
import { stringToSlug } from "@/lib/utils/stringUtils";
import { WatchListingWithStats } from "@/types/listing";
import { Watch } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

interface ListingCardProps {
  listing: WatchListingWithStats;
}

/**
 * Verifica se existe uma imagem válida no array de imagens
 */
function hasValidImage(images: string[] | undefined): boolean {
  return !!(images && images.length > 0 && images[0]);
}

export function ListingCard({ listing }: ListingCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const hasImage = hasValidImage(listing.images);

  const listingUrl = `/${stringToSlug(listing.brand)}/${stringToSlug(
    listing.model
  )}-${listing.id}`;

  return (
    <div
      className="relative bg-[#F7F7F7] rounded-[12px] p-4 transition-all duration-300"
      onMouseEnter={() => !isDesktop && setIsHovered(true)}
      onMouseLeave={() => !isDesktop && setIsHovered(false)}
    >
      {/* Borda dourada com transição suave */}
      <div
        className={`
          absolute inset-0 border-2 border-[#D5A60A] rounded-[12px] pointer-events-none 
          transition-opacity duration-300 ease-in-out
          ${isHovered ? "opacity-100" : "opacity-0"}
        `}
      ></div>

      <div className="flex gap-4 mb-4">
        {/* Imagem do relógio ou placeholder */}
        <div className="w-[116px] h-[116px] relative bg-[#EFEFEF] rounded-[5px] overflow-hidden flex-shrink-0">
          {hasImage ? (
            <Image
              //@ts-ignore
              src={listing.images[0]}
              alt={`${listing.brand} ${listing.model}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 0px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#E5E5E5]">
              <Watch className="w-12 h-12 text-[#999999]" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Informações do anúncio */}
        <div className="flex-1 min-w-0 py-2.5">
          {/* Marca e Modelo */}
          <div className="min-w-0">
            <h3 className="text-lg leading-[140%] tracking-[-0.01em] mb-1 truncate">
              {listing.brand} {listing.model}
            </h3>

            {/* Condição */}
            <p className="text-sm text-[#666666] leading-[140%] tracking-[-0.01em] mb-2 truncate">
              {listing?.condition}
            </p>

            {/* Número de referência, se disponível */}
            {listing?.referenceNumber && (
              <p className="text-xs text-gray-500">Ref: {listing.referenceNumber}</p>
            )}
          </div>

          {/* Preço */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#666666]">Total:</span>
            <span className="text-base font-medium">{formatCurrency(listing.price)}</span>
          </div>
        </div>
      </div>

      {/* Botão "Visualizar anúncio" com transição suave */}
      <Link href={listingUrl}>
        <button
          className={`
          w-full py-3.5 bg-white border-2 border-[#141414] rounded-full text-base font-medium 
          transition-all duration-500 ease-in-out
          hover:bg-[#141414] hover:text-white
          ${isHovered || isDesktop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}
        `}
        >
          Visualizar anúncio
        </button>
      </Link>
      {/* {listing.status === "ativo" && onPause && (
          <button
            onClick={() => onPause(listing.id)}
            className="px-6 py-2 border border-yellow-300 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-50 transition-colors whitespace-nowrap w-full md:w-auto"
          >
            Pausar
          </button>
        )}

        {listing.status === "pausado" && onActivate && (
          <button
            onClick={() => onActivate(listing.id)}
            className="px-6 py-2 border border-green-300 text-green-700 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors whitespace-nowrap w-full md:w-auto"
          >
            Ativar
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => {
              if (confirm("Tem certeza que deseja excluir este anúncio?")) {
                onDelete(listing.id);
              }
            }}
            className="px-6 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors whitespace-nowrap w-full md:w-auto"
          >
            Excluir
          </button>
        )} */}
    </div>
  );
}
