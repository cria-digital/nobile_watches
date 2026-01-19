// frontend/src/lib/hooks/useWishlistStatus.ts

import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import useSWR from "swr";

interface WishlistStatusResponse {
  isInWishlist: boolean;
  wishlistId: number | null;
}

/**
 * Fetcher para verificar status da wishlist
 */
const checkWishlistStatus = async (url: string): Promise<boolean> => {
  try {
    const response = await apiClient.get<WishlistStatusResponse>(url);
    return response.data.isInWishlist || false;
  } catch (error) {
    console.error("Erro ao verificar status da wishlist:", error);
    return false;
  }
};

/**
 * Hook para gerenciar o status da wishlist usando SWR
 *
 * @param watchId - ID do relógio
 * @param shouldCheck - Se true, faz requisição para verificar status. Default: false
 */
export function useWishlistStatus(
  watchId: string | number,
  shouldCheck: boolean = false // ← Adicione este parâmetro
) {
  const { isAuthenticated } = useAuth();

  // Só faz requisição se:
  // 1. Estiver autenticado
  // 2. shouldCheck for true (apenas em ProductPageClient)
  const swrKey =
    isAuthenticated && shouldCheck ? `/wishlist/check/${watchId}` : null;

  const {
    data: isFavorited,
    error,
    mutate,
  } = useSWR(swrKey, checkWishlistStatus, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: true,
    errorRetryCount: 1,
    dedupingInterval: 2000,
    fallbackData: false,
  });

  return {
    isFavorited: isFavorited ?? false,
    isLoading: !error && isFavorited === undefined && swrKey !== null,
    error,
    mutate,
  };
}
