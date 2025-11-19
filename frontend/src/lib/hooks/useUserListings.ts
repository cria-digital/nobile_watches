import { apiClient, extractErrorMessage } from "@/lib/api";
import { authService } from "@/lib/services/auth.service";
import { WatchListingWithStats } from "@/types/listing";
import { useEffect, useState } from "react";
import { mockListings } from "../data/mockListings";

/**
 * Interface do relógio retornado pela API
 */
interface ApiWatch {
  id: number;
  brand: string;
  model: string;
  referenceNumber?: string;
  movement?: string;
  year?: number;
  condition: string;
  price: number;
  description?: string;
  images: string[];
  sellerId: number;
  createdAt: string;
  updatedAt: string;
  caseMaterial?: string;
  caseDiameter?: number;
  waterResistance?: string;
  glassType?: string;
  dialColor?: string;
  braceletMaterial?: string;
  braceletColor?: string;
  claspType?: string;
  gender?: string;
}

export function useUserListings() {
  const [listings, setListings] = useState<WatchListingWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  /**
   * Mapeia o relógio da API para o formato WatchListingWithStats
   */
  const mapApiWatchToListing = (watch: ApiWatch): WatchListingWithStats => {
    // Construir objeto base
    const listing: WatchListingWithStats = {
      id: watch.id,
      brand: watch.brand,
      model: watch.model,
      price: watch.price,
      condition: watch.condition,
      images: watch.images,
      sellerId: watch.sellerId,
      status: "ativo", // Backend não tem status ainda, assumindo ativo
      createdAt: watch.createdAt,
      // Estatísticas mockadas (backend não fornece ainda)
      stats: {
        views: Math.floor(Math.random() * 1000) + 100,
        favorites: Math.floor(Math.random() * 50) + 5,
        messages: Math.floor(Math.random() * 15),
      },
    };

    // Adicionar propriedades opcionais apenas se existirem
    if (watch.referenceNumber) {
      listing.referenceNumber = watch.referenceNumber;
    }

    if (watch.description) {
      listing.description = watch.description;
    }

    if (watch.updatedAt) {
      listing.updatedAt = watch.updatedAt;
    }

    return listing;
  };

  const isMockActive = (): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("mock_auth_token") === "mock_token_active";
  };

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Se estiver em modo mock, usa dados mockados
      if (isMockActive()) {
        console.log("📊 Usando dados mockados do perfil/anúncios");
        await new Promise(resolve => setTimeout(resolve, 500));
        setListings(mockListings);
        return;
      }

      // Obter userId através do authService
      const userId = authService.getUserId();

      if (!userId) {
        throw new Error("Usuário não autenticado");
      }

      // Buscar todos os relógios usando apiClient
      const response = await apiClient.get<ApiWatch[]>("/watches");
      console.log("Resposta da API de relógios:", response);
      const allWatches = response.data;

      // Filtrar apenas os relógios do usuário atual
      const userWatches = allWatches.filter(watch => watch.sellerId === userId);

      // Mapear para o formato esperado
      const listingsWithStats = userWatches.map(mapApiWatchToListing);

      setListings(listingsWithStats);
    } catch (err) {
      console.error("Erro ao buscar anúncios:", err);
      setError(extractErrorMessage(err, "Erro ao carregar anúncios"));
      // Em caso de erro, usa mock
      setListings(mockListings);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    listings,
    isLoading,
    error,
    refetch: fetchListings,
  };
}
