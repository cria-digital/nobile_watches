import { WatchListingWithStats } from "@/types/listing";
import Image from "next/image";
import Link from "next/link";

interface ListingCardProps {
  listing: WatchListingWithStats;
  onDelete?: (id: number) => void;
  onPause?: (id: number) => void;
  onActivate?: (id: number) => void;
}

export function ListingCard({
  listing,
  onDelete,
  onPause,
  onActivate,
}: ListingCardProps) {
  const statusLabels = {
    ativo: "Ativo",
    vendido: "Vendido",
    pausado: "Pausado",
    removido: "Removido",
  };

  const statusColors = {
    ativo: "text-green-600 bg-green-50",
    vendido: "text-blue-600 bg-blue-50",
    pausado: "text-yellow-600 bg-yellow-50",
    removido: "text-red-600 bg-red-50",
  };

  return (
    <div className="bg-[#F7F7F7] rounded-[12px] p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4 h-[116px] mb-4">
        {/* Imagem do relógio */}
        <div className="w-[116px] relative bg-[#EFEFEF] rounded-[5px] overflow-hidden">
          <Image
            src={listing.images[0] || "/placeholder-watch.jpg"}
            alt={`${listing.brand} ${listing.model}`}
            fill
            className="object-cover"
          />
        </div>

        {/* Informações do anúncio */}
        <div className="flex-1 py-2.5 min-w-0">
          {/* Marca e Modelo */}
          <div className="min-w-0">
            <h3 className="text-[18px] leading-[140%] tracking-[-1%] truncate">
              {listing.brand} {listing.model}
            </h3>
            <p className="text-sm text-gray-600">{listing.condition}</p>
            {listing.referenceNumber && (
              <p className="text-xs text-gray-500 mt-1">Ref: {listing.referenceNumber}</p>
            )}
          </div>

          {/* Preço */}
          <div>
            <p className="text-[18px] font-medium">
              R$ {listing.price.toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex md:flex-col justify-center items-center gap-2">
        <Link
          href={`/produto/${listing.id}`}
          className="w-full h-[52px] flex items-center justify-center rounded-full border-2 border-pb-500 text-pb-500 text-base font-bold tracking-[2%] hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          Visualizar anúncio
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
    </div>
  );
}
