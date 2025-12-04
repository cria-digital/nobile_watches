import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import useSWR from "swr";

interface WishlistStatusResponse {
  isFavorited: boolean;
}

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

/**
 * Fetcher para verificar status da wishlist
 */
const checkWishlistStatus = async (url: string): Promise<boolean> => {
  try {
    const response = await apiClient.get<WishlistStatusResponse>(url);
    return response.data.isFavorited || false;
  } catch (error) {
    // Em caso de erro, assume que não está favoritado
    console.error("Erro ao verificar status da wishlist:", error);
    return false;
  }
};

/**
 * Hook customizado para gerenciar o status da wishlist usando SWR
 *
 *
 * @param watchId - ID do relógio
 * @returns Status da wishlist e função de mutação
 */
export function useWishlistStatus(watchId: string | number) {
  const { isAuthenticated } = useAuth();

  // Construir chave do SWR - só faz requisição se estiver autenticado e não estiver em modo mock
  const swrKey =
    isAuthenticated && !USE_MOCK_DATA ? `/wishlist/check/${watchId}` : null;

  const {
    data: isFavorited,
    error,
    mutate,
  } = useSWR(swrKey, checkWishlistStatus, {
    // Configurações do SWR
    revalidateOnFocus: false, // Não revalidar ao focar na aba
    revalidateOnReconnect: false, // Não revalidar ao reconectar
    shouldRetryOnError: true, // Tentar novamente em caso de erro
    errorRetryCount: 1, // Tentar apenas uma vez
    dedupingInterval: 2000, // Deduplica requisições dentro de 2 segundos
    fallbackData: false, // Valor padrão enquanto carrega
  });

  return {
    isFavorited: isFavorited ?? false,
    isLoading: !error && isFavorited === undefined && swrKey !== null,
    error,
    mutate, // Função para atualizar manualmente o cache
  };
}
