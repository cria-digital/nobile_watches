import { formatCurrency } from "@/lib/utils/format";
import { stringToSlug } from "@/lib/utils/stringUtils";
import { Listing } from "@/types/nobile";
import { Menu } from "@headlessui/react";
import { MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../ui";

interface ListingCardProps {
  listing: Listing;

  // Handlers opcionais para ações
  onPublish?: () => void;
  onPause?: () => void;
  onReactivate?: () => void;
  onCancel?: () => void;
  onMarkAsSold?: () => void;
  onDelete?: () => void;

  // Estados de loading
  isPublishing?: boolean;
  isPausing?: boolean;
  isReactivating?: boolean;
  isCancelling?: boolean;
  isMarkingAsSold?: boolean;
  isDeleting?: boolean;
}

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

export function ListingCard({
  listing,
  onPublish,
  onPause,
  onReactivate,
  onCancel,
  onMarkAsSold,
  onDelete,
  isPublishing,
  isPausing,
  isReactivating,
  isCancelling,
  isMarkingAsSold,
  isDeleting,
}: ListingCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const watch = listing.watch;
  const hasImage = watch?.images && watch.images.length > 0 && watch.images[0];

  const listingUrl = watch
    ? `/${stringToSlug(watch.brand)}/${stringToSlug(watch.model)}-${listing.watchId}`
    : "#";

  // Status badge
  const getStatusBadge = () => {
    switch (listing.status) {
      case "DRAFT":
        return (
          <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
            Rascunho
          </span>
        );
      case "ACTIVE":
        return (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
            Ativo
          </span>
        );
      case "PAUSED":
        return (
          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
            Pausado
          </span>
        );
      case "SOLD":
        return (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
            Vendido
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  // Verifica se alguma ação está em loading
  const isAnyActionLoading =
    isPublishing ||
    isPausing ||
    isReactivating ||
    isCancelling ||
    isMarkingAsSold ||
    isDeleting;

  return (
    <div
      className="relative bg-[#F7F7F7] rounded-[12px] p-4 transition-all duration-300"
      onMouseEnter={() => !isDesktop && setIsHovered(true)}
      onMouseLeave={() => !isDesktop && setIsHovered(false)}
    >
      {/* Overlay de loading */}
      {isAnyActionLoading && (
        <div className="absolute inset-0 bg-white/80 rounded-[12px] flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            <p className="text-sm text-gray-600">
              {isPublishing && "Publicando..."}
              {isPausing && "Pausando..."}
              {isReactivating && "Reativando..."}
              {isCancelling && "Cancelando..."}
              {isMarkingAsSold && "Marcando como vendido..."}
              {isDeleting && "Deletando..."}
            </p>
          </div>
        </div>
      )}

      {/* Borda dourada com transição suave */}
      <div
        className={`
          absolute inset-0 border-2 border-[#D5A60A] rounded-[12px] pointer-events-none 
          transition-opacity duration-300 ease-in-out
          ${isHovered ? "opacity-100" : "opacity-0"}
        `}
      />

      <div className="flex gap-4 mb-4">
        {/* Imagem do relógio ou placeholder */}
        <Link href={listingUrl} className="flex-shrink-0">
          <div className="w-[116px] h-[116px] relative bg-[#EFEFEF] rounded-[5px] overflow-hidden">
            {hasImage ? (
              <Image // @ts-ignore
                src={watch.images[0]}
                alt={`${watch.brand} ${watch.model}`}
                fill
                className="object-cover"
                sizes="
    (max-width: 640px) 116px,
    (max-width: 1024px) 116px,
    116px
  "
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400 text-sm">Sem imagem</span>
              </div>
            )}
          </div>
        </Link>

        {/* Informações do relógio */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <Link href={listingUrl}>
                <h3 className="font-medium text-base leading-tight hover:text-[#D5A60A] transition-colors truncate">
                  {watch?.brand} {watch?.model}
                </h3>
              </Link>

              {/* Menu de ações */}
              <Menu as="div" className="relative">
                <Menu.Button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </Menu.Button>
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  {onPublish && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={onPublish}
                          disabled={isPublishing}
                          className={`${
                            active ? "bg-gray-100" : ""
                          } w-full text-left px-4 py-2 text-sm text-gray-700 disabled:opacity-50`}
                        >
                          Publicar
                        </button>
                      )}
                    </Menu.Item>
                  )}

                  {onPause && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={onPause}
                          disabled={isPausing}
                          className={`${
                            active ? "bg-gray-100" : ""
                          } w-full text-left px-4 py-2 text-sm text-gray-700 disabled:opacity-50`}
                        >
                          Pausar
                        </button>
                      )}
                    </Menu.Item>
                  )}

                  {onReactivate && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={onReactivate}
                          disabled={isReactivating}
                          className={`${
                            active ? "bg-gray-100" : ""
                          } w-full text-left px-4 py-2 text-sm text-gray-700 disabled:opacity-50`}
                        >
                          Reativar
                        </button>
                      )}
                    </Menu.Item>
                  )}

                  {onMarkAsSold && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={onMarkAsSold}
                          disabled={isMarkingAsSold}
                          className={`${
                            active ? "bg-gray-100" : ""
                          } w-full text-left px-4 py-2 text-sm text-blue-600 disabled:opacity-50`}
                        >
                          Marcar como vendido
                        </button>
                      )}
                    </Menu.Item>
                  )}

                  {onCancel && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={onCancel}
                          disabled={isCancelling}
                          className={`${
                            active ? "bg-gray-100" : ""
                          } w-full text-left px-4 py-2 text-sm text-orange-600 disabled:opacity-50`}
                        >
                          Cancelar anúncio
                        </button>
                      )}
                    </Menu.Item>
                  )}

                  {onDelete && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={onDelete}
                          disabled={isDeleting}
                          className={`${
                            active ? "bg-gray-100" : ""
                          } w-full text-left px-4 py-2 text-sm text-red-600 disabled:opacity-50`}
                        >
                          Deletar
                        </button>
                      )}
                    </Menu.Item>
                  )}
                </Menu.Items>
              </Menu>
            </div>

            <p className="text-sm text-gray-600 mb-1 truncate">
              {watch?.referenceNumber || "Sem ref."}
            </p>

            {getStatusBadge()}
          </div>

          <div>
            <p className="text-lg">
              {watch?.price ? formatCurrency(watch.price) : "Preço não definido"}
            </p>
          </div>
        </div>
      </div>

      {/* Botão "Visualizar anúncio" com transição suave */}
      <Link href={listingUrl}>
        <Button variant="stroke" className="w-full h-[50px]">
          Visualizar anúncio
        </Button>
      </Link>
    </div>
  );
}
