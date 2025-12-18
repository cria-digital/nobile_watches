"use client";

import nobileService from "@/lib/services/nobile.service";
import { CollectionItem, CollectionStats } from "@/types/collection";
import { useEffect, useState } from "react";
import { MOCK_COLLECTION_DATA } from "../data/mockCollection";

/**
 * Hook para buscar e gerenciar a coleção de relógios do usuário
 * Suporta modo mock para desenvolvimento quando API não está disponível
 */
export function useUserCollection() {
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  useEffect(() => {
    fetchCollection();
  }, []);

  /**
   * Verifica se o mock login está ativo
   */
  const isMockActive = (): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("mock_auth_token") === "mock_token_active";
  };

  const fetchCollection = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Se mock está ativo, retornar dados mockados
      if (isMockActive()) {
        console.log("📊 Usando dados mockados da coleção");
        // Simula delay de rede para realismo
        await new Promise((resolve) => setTimeout(resolve, 500));
        setCollection(MOCK_COLLECTION_DATA);
        setIsLoading(false);
        return;
      }

      // Caso contrário, buscar dados reais usando nobileService
      const data = await nobileService.getCollection();

      // Mapear dados da API para o formato do CollectionItem
      const collectionItems: CollectionItem[] = data.map((item: any) => ({
        id: item.id,
        userId: item.userId,
        watchId: item.watchId,
        estimatedValue: item.estimatedValue || item.watch?.price,
        addedAt: item.createdAt || new Date().toISOString(),
        watch: {
          id: item.watch.id,
          brand: item.watch.brand,
          model: item.watch.model,
          referenceNumber: item.watch.referenceNumber,
          movement: item.watch.movement,
          year: item.watch.year,
          condition: item.watch.condition,
          price: item.watch.price,
          description: item.watch.description,
          images: item.watch.images || [],
          caseMaterial: item.watch.caseMaterial,
          caseDiameter: item.watch.caseDiameter,
          waterResistance: item.watch.waterResistance,
          glassType: item.watch.glassType,
          dialColor: item.watch.dialColor,
          braceletMaterial: item.watch.braceletMaterial,
          braceletColor: item.watch.braceletColor,
          claspType: item.watch.claspType,
          gender: item.watch.gender,
        },
        // Calcular mudança de preço (pode ser obtido de histórico de preços)
        priceChange: calculatePriceChange(item),
      }));

      setCollection(collectionItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      console.error("Erro ao buscar coleção:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Calcula a mudança de preço de um item
   * TODO: Integrar com endpoint de histórico de preços
   */
  const calculatePriceChange = (item: any) => {
    // Por enquanto, retorna valores mockados
    // No futuro, deve buscar do histórico de preços
    return {
      percentage: Math.floor(Math.random() * 30) + 5,
      trend: "up" as const,
    };
  };

  /**
   * Adiciona um relógio à coleção
   */
  const addToCollection = async (watchId: number, estimatedValue?: number) => {
    try {
      if (isMockActive()) {
        console.log("📊 Mock: Adicionando relógio à coleção");
        return;
      }

      // Construir objeto de dados sem undefined
      const data: { watchId: number; estimatedValue?: number } = { watchId };
      if (estimatedValue !== undefined) {
        data.estimatedValue = estimatedValue;
      }

      await nobileService.createCollection(data);
      await fetchCollection(); // Recarrega a coleção
    } catch (err) {
      throw err;
    }
  };

  /**
   * Remove um relógio da coleção
   */
  const removeFromCollection = async (watchId: number) => {
    try {
      if (isMockActive()) {
        console.log("📊 Mock: Removendo relógio da coleção");
        setCollection((prev) =>
          prev.filter((item) => item.watchId !== watchId)
        );
        return;
      }

      // Nota: Assumindo que o backend tem endpoint DELETE /collections/watch/{watchId}
      // Se o endpoint for diferente, ajuste o nobileService conforme necessário
      await nobileService.removeWatchFromCollection(watchId);
      setCollection((prev) => prev.filter((item) => item.watchId !== watchId));
    } catch (err) {
      throw err;
    }
  };

  /**
   * Atualiza o valor estimado de um item
   */
  const updateEstimatedValue = async (
    collectionId: number,
    estimatedValue: number
  ) => {
    try {
      if (isMockActive()) {
        console.log("📊 Mock: Atualizando valor estimado");
        setCollection((prev) =>
          prev.map((item) =>
            item.id === collectionId ? { ...item, estimatedValue } : item
          )
        );
        return;
      }

      await nobileService.updateCollection(collectionId, { estimatedValue });
      setCollection((prev) =>
        prev.map((item) =>
          item.id === collectionId ? { ...item, estimatedValue } : item
        )
      );
    } catch (err) {
      throw err;
    }
  };

  /**
   * Calcula estatísticas da coleção
   */
  const getStats = (): CollectionStats => {
    const totalItems = collection.length;
    const totalValue = collection.reduce(
      (sum, item) => sum + (item.estimatedValue || item.watch.price),
      0
    );
    const totalInvestment = collection.reduce(
      (sum, item) => sum + item.watch.price,
      0
    );
    const profitLoss = totalValue - totalInvestment;
    const profitLossPercentage =
      totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

    // Encontrar marca mais valiosa
    const brandValues = collection.reduce(
      (acc, item) => {
        const brand = item.watch.brand;
        const value = item.estimatedValue || item.watch.price;
        acc[brand] = (acc[brand] || 0) + value;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostValuableBrand = Object.entries(brandValues).reduce(
      (max, [brand, value]) => (value > max.value ? { brand, value } : max),
      { brand: "", value: 0 }
    ).brand;

    return {
      totalItems,
      totalValue,
      totalInvestment,
      profitLoss,
      profitLossPercentage,
      mostValuableBrand,
    };
  };

  /**
   * Filtra a coleção por marca
   */
  const filteredCollection = selectedBrand
    ? collection.filter((item) => item.watch.brand === selectedBrand)
    : collection;

  /**
   * Obtém lista de marcas disponíveis com contagem
   */
  const getBrands = () => {
    const brandCounts = collection.reduce(
      (acc, item) => {
        const brand = item.watch.brand;
        acc[brand] = (acc[brand] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(brandCounts).map(([name, count]) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      icon: `/icons/brands/${name.toLowerCase().replace(/\s+/g, "-")}.svg`,
      count,
    }));
  };

  return {
    collection: filteredCollection,
    allCollection: collection,
    isLoading,
    error,
    selectedBrand,
    setSelectedBrand,
    addToCollection,
    removeFromCollection,
    updateEstimatedValue,
    getStats,
    getBrands,
    refetch: fetchCollection,
  };
}
