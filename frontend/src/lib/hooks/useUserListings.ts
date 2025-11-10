/**
 * Hook para buscar e gerenciar anúncios do vendedor
 * Integra com a API real quando disponível e usa mock quando não disponível
 */

import { getUserId } from "@/lib/auth/auth";

import { WatchListingWithStats } from "@/types/listing";
import { useEffect, useState } from "react";
import { mockListings } from "../data/mockListings";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

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
      images: watch.images.length > 0 ? watch.images : ["/placeholder-watch.jpg"],
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

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Se estiver em modo mock, usa dados mockados
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay da API
        setListings(mockListings);
        return;
      }

      // Tenta buscar da API real
      try {
        // Obter userId através da API Route
        const userId = await getUserId();

        if (!userId) {
          throw new Error("Usuário não autenticado");
        }

        // Buscar todos os relógios
        const response = await fetch(`${API_BASE_URL}/watches`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const allWatches: ApiWatch[] = await response.json();

        // Filtrar apenas os relógios do usuário atual
        const userWatches = allWatches.filter(watch => watch.sellerId === userId);

        // Mapear para o formato esperado
        const listingsWithStats = userWatches.map(mapApiWatchToListing);

        setListings(listingsWithStats);
      } catch (apiError) {
        // Se API falhar, usa mock como fallback
        console.warn("API indisponível, usando dados mockados:", apiError);
        setListings(mockListings);
      }
    } catch (err) {
      console.error("Erro ao buscar anúncios:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      // Em caso de erro, usa mock
      setListings(mockListings);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteListing = async (id: number) => {
    try {
      // Se estiver em modo mock, apenas atualiza localmente
      if (USE_MOCK) {
        setListings(prev => prev.filter(listing => listing.id !== id));
        return;
      }

      // Tenta deletar na API real
      const response = await fetch(`${API_BASE_URL}/watches/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir anúncio");
      }

      // Atualizar lista localmente
      setListings(prev => prev.filter(listing => listing.id !== id));
    } catch (err) {
      console.error("Erro ao deletar anúncio:", err);
      throw err;
    }
  };

  const pauseListing = async (id: number) => {
    try {
      // TODO: Backend ainda não tem endpoint para pausar
      // Por enquanto, apenas atualiza localmente
      setListings(prev =>
        prev.map(listing =>
          listing.id === id ? { ...listing, status: "pausado" as const } : listing
        )
      );

      // Quando backend implementar:
      // const response = await fetch(`${API_BASE_URL}/watches/${id}/pause`, {
      //   method: "PUT",
      //   credentials: "include",
      // });
    } catch (err) {
      console.error("Erro ao pausar anúncio:", err);
      throw err;
    }
  };

  const activateListing = async (id: number) => {
    try {
      // TODO: Backend ainda não tem endpoint para ativar
      // Por enquanto, apenas atualiza localmente
      setListings(prev =>
        prev.map(listing =>
          listing.id === id ? { ...listing, status: "ativo" as const } : listing
        )
      );

      // Quando backend implementar:
      // const response = await fetch(`${API_BASE_URL}/watches/${id}/activate`, {
      //   method: "PUT",
      //   credentials: "include",
      // });
    } catch (err) {
      console.error("Erro ao ativar anúncio:", err);
      throw err;
    }
  };

  return {
    listings,
    isLoading,
    error,
    deleteListing,
    pauseListing,
    activateListing,
    refetch: fetchListings,
  };
}
