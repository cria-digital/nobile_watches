import { ListingStatus } from "./nobile";

/**
 * Item da wishlist retornado pelo backend
 */
export interface WishlistItem {
  id: number;
  userId: number;
  watchId: number;
  addedAt: string;
  watch: {
    id: number;
    brand: string;
    model: string;
    price: number;
    images: string[];
    condition: string;
    seller: {
      id: number;
      name: string;
      email: string;
    };
    listings: Array<{
      id: number;
      status: ListingStatus;
      soldAt: string | null;
      publishedAt: string | null;
      pausedAt?: string | null;
      cancelledAt?: string | null;
    }>;
  };
}

/**
 * Formato do item para exibição no frontend
 */
export interface WishlistItemDisplay {
  id: string;
  watchId: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  addedAt: string;
  listingStatus?: ListingStatus;
}

/**
 * Verifica se o produto está disponível para compra
 */
export function isProductAvailable(item: WishlistItem): boolean {
  const listing = item.watch.listings?.[0];
  return listing?.status === "ACTIVE";
}

/**
 * Retorna a mensagem de status do produto (null se disponível)
 */
export function getProductStatusMessage(item: WishlistItem): string | null {
  const listing = item.watch.listings?.[0];

  if (!listing) {
    return "Produto não disponível";
  }

  switch (listing.status) {
    case "SOLD":
      return "Produto vendido";
    case "PAUSED":
      return "Anúncio pausado";
    case "CANCELLED":
      return "Anúncio cancelado";
    case "DRAFT":
      return "Produto não publicado";
    case "ACTIVE":
      return null; // Produto disponível
    default:
      return "Produto indisponível";
  }
}

/**
 * Converte WishlistItem do backend para formato de exibição
 */
export function mapWishlistItemToDisplay(
  item: WishlistItem
): WishlistItemDisplay {
  ///@ts-ignore
  return {
    id: item.watchId.toString(),
    watchId: item.watchId,
    name: item.watch.model,
    brand: item.watch.brand,
    price: item.watch.price,
    image: item.watch.images?.[0] || "",
    addedAt: item.addedAt,
    listingStatus: item.watch.listings?.[0]?.status,
  };
}
