import { Button } from "@/components/ui";
import { stringToSlug } from "@/lib/utils/stringUtils";
import {
  WishlistItem,
  getProductStatusMessage,
  isProductAvailable,
} from "@/types/wishlist";
import { Trash2, Watch } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface WishlistCardProps {
  item: WishlistItem;
  onRemove: (watchId: number) => Promise<void>;
  isRemoving?: boolean;
}

export function WishlistCard({
  item,
  onRemove,
  isRemoving = false,
}: WishlistCardProps) {
  const watch = item.watch;
  const isAvailable = isProductAvailable(item);
  const statusMessage = getProductStatusMessage(item);

  const handleRemove = () => {
    onRemove(item.watchId);
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all ${
        !isAvailable ? "opacity-60" : ""
      }`}
    >
      {/* Image */}
      <div className="relative aspect-square bg-[#EFEFEF] overflow-hidden">
        {/* Badge de Status (se não disponível) */}
        {statusMessage && (
          <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-md">
            {statusMessage}
          </div>
        )}

        {/* Imagem do Produto */}
        {watch.images?.[0]?.trim() === "" || !watch.images?.[0] ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#EFEFEF] to-[#E0E0E0]">
            <Watch className="w-12 h-12 text-[#999999]" strokeWidth={1.5} />
          </div>
        ) : (
          <Image
            src={watch.images[0]}
            alt={`${watch.brand} ${watch.model}`}
            fill
            className={`object-cover ${!isAvailable ? "grayscale" : ""}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}

        {/* Botão Remover */}
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-20"
          aria-label="Remover da lista de desejos"
        >
          <Trash2
            className={`h-4 w-4 text-red-500 ${isRemoving ? "animate-pulse" : ""}`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{watch.brand}</p>
        <h3 className="font-lato text-base font-medium text-pb-500 mb-2 line-clamp-2">
          {watch.model}
        </h3>
        <p className="text-lg font-semibold text-pb-500 mb-4">
          R$ {watch.price.toLocaleString("pt-BR")}
        </p>

        {isAvailable ? (
          <Link
            href={`/${stringToSlug(watch.brand)}/${stringToSlug(watch.model)}-${watch.id}`}
          >
            <Button variant="stroke" className="w-full" disabled={!isAvailable}>
              Ver Detalhes
            </Button>
          </Link>
        ) : (
          <Button variant="stroke" className="w-full" disabled={!isAvailable}>
            Indisponível
          </Button>
        )}
      </div>
    </div>
  );
}
