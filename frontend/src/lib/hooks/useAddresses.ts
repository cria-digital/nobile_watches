"use client";

import {
  Address,
  AddressInput,
  addressService,
} from "@/lib/services/address.service";
import { useState } from "react";
import useSWR from "swr";

/**
 * Hook para gerenciar endereços do usuário com SWR
 */
export function useAddresses() {
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetcher para SWR
  const addressesFetcher = async () => {
    return await addressService.getAddresses();
  };

  // SWR hook
  const {
    data: addresses,
    error,
    isLoading,
    mutate,
  } = useSWR<Address[]>("/addresses", addressesFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  });

  /**
   * Cria um novo endereço
   */
  const createAddress = async (data: AddressInput) => {
    setIsActionLoading(true);

    try {
      const result = await addressService.createAddress(data);

      if (result.success && result.address) {
        // Atualização otimista: adicionar à lista
        mutate((current) => [...(current || []), result.address!], false);

        // Revalidar para garantir consistência
        await mutate();

        return { success: true, address: result.address };
      }

      return { success: false, error: result.error };
    } catch (err) {
      console.error("Erro ao criar endereço:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Erro desconhecido",
      };
    } finally {
      setIsActionLoading(false);
    }
  };

  /**
   * Atualiza um endereço
   */
  const updateAddress = async (id: number, data: Partial<AddressInput>) => {
    setIsActionLoading(true);

    try {
      const result = await addressService.updateAddress(id, data);

      if (result.success && result.address) {
        // Atualização otimista: substituir na lista
        mutate(
          (current) =>
            current?.map((addr) => (addr.id === id ? result.address! : addr)) ||
            [],
          false
        );

        // Revalidar
        await mutate();

        return { success: true, address: result.address };
      }

      return { success: false, error: result.error };
    } catch (err) {
      console.error("Erro ao atualizar endereço:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Erro desconhecido",
      };
    } finally {
      setIsActionLoading(false);
    }
  };

  /**
   * Remove um endereço
   */
  const deleteAddress = async (id: number) => {
    setIsActionLoading(true);

    try {
      const result = await addressService.deleteAddress(id);

      if (result.success) {
        // Atualização otimista: remover da lista
        mutate(
          (current) => current?.filter((addr) => addr.id !== id) || [],
          false
        );

        // Revalidar
        await mutate();

        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (err) {
      console.error("Erro ao remover endereço:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Erro desconhecido",
      };
    } finally {
      setIsActionLoading(false);
    }
  };

  /**
   * Define um endereço como padrão
   */
  const setDefaultAddress = async (id: number) => {
    setIsActionLoading(true);

    try {
      const result = await addressService.setDefaultAddress(id);

      if (result.success) {
        // Atualização otimista: atualizar flags
        mutate(
          (current) =>
            current?.map((addr) => ({
              ...addr,
              isDefault: addr.id === id,
            })) || [],
          false
        );

        // Revalidar
        await mutate();

        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (err) {
      console.error("Erro ao definir endereço padrão:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Erro desconhecido",
      };
    } finally {
      setIsActionLoading(false);
    }
  };

  /**
   * Busca o endereço padrão
   */
  const getDefaultAddress = () => {
    return addresses?.find((addr) => addr.isDefault) || null;
  };

  /**
   * Força revalidação
   */
  const refresh = async () => {
    await mutate();
  };

  return {
    // Dados
    addresses: addresses || [],
    isLoading,
    isError: !!error,
    error,
    isActionLoading,

    // Ações
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,

    // Utilidades
    getDefaultAddress,
    refresh,
  };
}
