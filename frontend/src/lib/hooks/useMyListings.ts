import nobileService from "@/lib/services/nobile.service";
import { Listing, ListingStatus } from "@/types/nobile";
import { useCallback, useState } from "react";
import useSWR from "swr";

/**
 * Estado de loading para cada ação possível
 */
interface ListingActionLoading {
  publish: number | null;
  pause: number | null;
  reactivate: number | null;
  cancel: number | null;
  markAsSold: number | null;
  delete: number | null;
  update: number | null;
}

/**
 * Resultado do hook useMyListings
 */
interface UseMyListingsResult {
  // Dados
  listings: Listing[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Estatísticas agregadas
  stats: {
    total: number;
    active: number;
    draft: number;
    paused: number;
    sold: number;
    cancelled: number;
  };

  // Estados de loading por ação
  actionLoading: ListingActionLoading;

  // Ações de ciclo de vida do anúncio
  publishListing: (id: number) => Promise<void>;
  pauseListing: (id: number) => Promise<void>;
  reactivateListing: (id: number) => Promise<void>;
  cancelListing: (id: number) => Promise<void>;
  markAsSold: (id: number) => Promise<void>;
  deleteListing: (id: number) => Promise<void>;

  // Atualização de dados
  updateListing: (
    id: number,
    data: {
      shippingInfo?: string;
      returnPolicy?: string;
      deliveryTime?: string;
      negotiable?: boolean;
    }
  ) => Promise<void>;

  // Utilidades
  refresh: () => Promise<void>;
  getListing: (id: number) => Listing | undefined;
}

/**
 * Hook para gerenciar os anúncios do vendedor
 *
 * IMPORTANTE: Este hook só executa a requisição se o usuário tiver permissão:
 * - Role deve ser SELLER ou ADMIN
 * - isVerified deve ser true
 *
 * @param user - Usuário autenticado (necessário para verificar permissões)
 * @param statusFilter - Filtro opcional por status
 * @param autoRefetch - Se deve refetch automático (padrão: true)
 * @param refetchInterval - Intervalo de refetch em ms (padrão: 30000 = 30s)
 *
 * @example
 * ```tsx
 * // Buscar todos os anúncios
 * const { user } = useAuth();
 * const { listings, publishListing, pauseListing } = useMyListings(user);
 *
 * // Buscar apenas rascunhos
 * const { listings: drafts } = useMyListings(user, ListingStatus.DRAFT);
 *
 * // Buscar apenas ativos
 * const { listings: active } = useMyListings(user, ListingStatus.ACTIVE);
 *
 * // Publicar um anúncio
 * await publishListing(listingId);
 * ```
 */
export function useMyListings(
  user: { role: string; isVerified?: boolean } | null,
  statusFilter?: ListingStatus,
  autoRefetch: boolean = true,
  refetchInterval: number = 30000
): UseMyListingsResult {
  // Estado de loading para cada ação
  const [actionLoading, setActionLoading] = useState<ListingActionLoading>({
    publish: null,
    pause: null,
    reactivate: null,
    cancel: null,
    markAsSold: null,
    delete: null,
    update: null,
  });

  // Verifica se o usuário tem permissão para acessar listings
  // Apenas SELLER ou ADMIN que estejam verificados podem ter listings
  const hasPermission =
    user && (user.role === "SELLER" || user.role === "ADMIN") && user.isVerified === true;

  // Key para SWR baseada no filtro - só cria key se tiver permissão
  const swrKey = hasPermission
    ? statusFilter
      ? `/listings/my-listings?status=${statusFilter}`
      : "/listings/my-listings"
    : null; // null desabilita o SWR

  // Fetcher para SWR
  const fetcher = useCallback(async () => {
    return await nobileService.getMyListings(statusFilter);
  }, [statusFilter]);

  // Hook SWR - só executa se swrKey não for null
  const {
    data: listings = [],
    error,
    isLoading,
    mutate,
  } = useSWR<Listing[], Error>(swrKey, fetcher, {
    revalidateOnFocus: autoRefetch,
    revalidateOnReconnect: autoRefetch,
    refreshInterval: autoRefetch ? refetchInterval : 0,
    dedupingInterval: 5000,
    shouldRetryOnError: true,
    errorRetryCount: 3,
    onError: err => {
      console.error("Erro ao buscar anúncios:", err);
    },
  });

  // Calcula estatísticas agregadas
  const stats = {
    total: listings.length,
    active: listings.filter(l => l.status === ListingStatus.ACTIVE).length,
    draft: listings.filter(l => l.status === ListingStatus.DRAFT).length,
    paused: listings.filter(l => l.status === ListingStatus.PAUSED).length,
    sold: listings.filter(l => l.status === ListingStatus.SOLD).length,
    cancelled: listings.filter(l => l.status === ListingStatus.CANCELLED).length,
  };

  /**
   * Atualiza estado de loading para uma ação específica
   */
  const setLoading = (action: keyof ListingActionLoading, id: number | null) => {
    setActionLoading(prev => ({
      ...prev,
      [action]: id,
    }));
  };

  /**
   * Wrapper para executar ações com tratamento de erro e loading
   */
  const executeAction = async (
    action: keyof ListingActionLoading,
    id: number,
    actionFn: () => Promise<any>,
    successMessage?: string
  ) => {
    try {
      setLoading(action, id);

      // Executa a ação
      await actionFn();

      // Optimistic update: atualiza cache local
      await mutate();

      // Log de sucesso (você pode substituir por toast/notification)
      if (successMessage) {
        console.log(`✅ ${successMessage}`);
      }
    } catch (error) {
      console.error(`Erro ao executar ${action}:`, error);
      throw error;
    } finally {
      setLoading(action, null);
    }
  };

  /**
   * Publica um anúncio em rascunho
   */
  const publishListing = useCallback(
    async (id: number) => {
      await executeAction(
        "publish",
        id,
        () => nobileService.publishListing(id),
        "Anúncio publicado com sucesso!"
      );
    },
    [mutate]
  );

  /**
   * Pausa um anúncio ativo
   */
  const pauseListing = useCallback(
    async (id: number) => {
      await executeAction(
        "pause",
        id,
        () => nobileService.pauseListing(id),
        "Anúncio pausado com sucesso!"
      );
    },
    [mutate]
  );

  /**
   * Reativa um anúncio pausado
   */
  const reactivateListing = useCallback(
    async (id: number) => {
      await executeAction(
        "reactivate",
        id,
        () => nobileService.reactivateListing(id),
        "Anúncio reativado com sucesso!"
      );
    },
    [mutate]
  );

  /**
   * Cancela um anúncio
   */
  const cancelListing = useCallback(
    async (id: number) => {
      await executeAction(
        "cancel",
        id,
        () => nobileService.cancelListing(id),
        "Anúncio cancelado com sucesso!"
      );
    },
    [mutate]
  );

  /**
   * Marca um anúncio como vendido
   */
  const markAsSold = useCallback(
    async (id: number) => {
      await executeAction(
        "markAsSold",
        id,
        () => nobileService.markListingAsSold(id),
        "Anúncio marcado como vendido!"
      );
    },
    [mutate]
  );

  /**
   * Deleta um anúncio (apenas rascunhos ou cancelados)
   */
  const deleteListing = useCallback(
    async (id: number) => {
      await executeAction(
        "delete",
        id,
        () => nobileService.deleteListing(id),
        "Anúncio deletado com sucesso!"
      );
    },
    [mutate]
  );

  /**
   * Atualiza informações de um anúncio
   */
  const updateListing = useCallback(
    async (
      id: number,
      data: {
        shippingInfo?: string;
        returnPolicy?: string;
        deliveryTime?: string;
        negotiable?: boolean;
      }
    ) => {
      await executeAction(
        "update",
        id,
        () => nobileService.updateListing(id, data),
        "Anúncio atualizado com sucesso!"
      );
    },
    [mutate]
  );

  /**
   * Força uma atualização dos dados
   */
  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  /**
   * Busca um anúncio específico por ID
   */
  const getListing = useCallback(
    (id: number): Listing | undefined => {
      return listings.find(listing => listing.id === id);
    },
    [listings]
  );

  return {
    // Dados
    listings,
    isLoading,
    isError: !!error,
    error: error || null,

    // Estatísticas
    stats,

    // Loading states
    actionLoading,

    // Ações
    publishListing,
    pauseListing,
    reactivateListing,
    cancelListing,
    markAsSold,
    deleteListing,
    updateListing,

    // Utilidades
    refresh,
    getListing,
  };
}

/**
 * Hook simplificado para buscar anúncios por status específico
 */
export function useListingsByStatus(
  user: { role: string; isVerified?: boolean } | null,
  status: ListingStatus
) {
  return useMyListings(user, status);
}

/**
 * Hook para buscar todos os anúncios ativos (público)
 * Útil para páginas de listagem geral
 */
export function useActiveListings(page: number = 1, limit: number = 20) {
  const swrKey = `/listings/active?page=${page}&limit=${limit}`;

  const fetcher = useCallback(async () => {
    return await nobileService.getActiveListings(page, limit);
  }, [page, limit]);

  const { data, error, isLoading } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 10000,
  });

  return {
    listings: data?.listings || [],
    pagination: data?.pagination,
    isLoading,
    isError: !!error,
    error,
  };
}

/**
 * Hook para buscar um anúncio específico por ID
 */
export function useListing(id: number) {
  const swrKey = `/listings/${id}`;

  const fetcher = useCallback(async () => {
    return await nobileService.getListingById(id);
  }, [id]);

  const {
    data: listing,
    error,
    isLoading,
    mutate,
  } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  return {
    listing,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}
