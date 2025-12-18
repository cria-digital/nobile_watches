import { apiClient, extractErrorMessage } from "@/lib/api";

/**
 * Interface de endereço (compatível com backend)
 */
export interface Address {
  id: number;
  userId: number;
  label?: string | null;
  recipientName: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dados para criar/atualizar endereço
 */
export interface AddressInput {
  label?: string;
  recipientName: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

/**
 * Resposta da API ao listar endereços
 */
interface ListAddressesResponse {
  addresses: Address[];
  count: number;
}

/**
 * Service para gerenciar endereços do usuário
 */
class AddressService {
  /**
   * Lista todos os endereços do usuário
   * GET /api/addresses
   */
  async getAddresses(): Promise<Address[]> {
    try {
      const response = await apiClient.get<ListAddressesResponse>("/addresses");
      return response.data.addresses;
    } catch (error) {
      console.error("Erro ao buscar endereços:", error);
      throw new Error(extractErrorMessage(error, "Erro ao carregar endereços"));
    }
  }

  /**
   * Busca um endereço específico
   * GET /api/addresses/:id
   */
  async getAddressById(id: number): Promise<Address> {
    try {
      const response = await apiClient.get<Address>(`/addresses/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      throw new Error(extractErrorMessage(error, "Erro ao carregar endereço"));
    }
  }

  /**
   * Cria um novo endereço
   * POST /api/addresses
   */
  async createAddress(data: AddressInput): Promise<{
    success: boolean;
    address?: Address;
    error?: string;
  }> {
    try {
      const response = await apiClient.post<{
        message: string;
        address: Address;
      }>("/addresses", data);

      return {
        success: true,
        address: response.data.address,
      };
    } catch (error) {
      console.error("Erro ao criar endereço:", error);
      return {
        success: false,
        error: extractErrorMessage(error, "Erro ao criar endereço"),
      };
    }
  }

  /**
   * Atualiza um endereço
   * PUT /api/addresses/:id
   */
  async updateAddress(
    id: number,
    data: Partial<AddressInput>
  ): Promise<{
    success: boolean;
    address?: Address;
    error?: string;
  }> {
    try {
      const response = await apiClient.put<{
        message: string;
        address: Address;
      }>(`/addresses/${id}`, data);

      return {
        success: true,
        address: response.data.address,
      };
    } catch (error) {
      console.error("Erro ao atualizar endereço:", error);
      return {
        success: false,
        error: extractErrorMessage(error, "Erro ao atualizar endereço"),
      };
    }
  }

  /**
   * Remove um endereço (soft delete)
   * DELETE /api/addresses/:id
   */
  async deleteAddress(id: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await apiClient.delete(`/addresses/${id}`);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Erro ao remover endereço:", error);
      return {
        success: false,
        error: extractErrorMessage(error, "Erro ao remover endereço"),
      };
    }
  }

  /**
   * Define um endereço como padrão
   * PATCH /api/addresses/:id/set-default
   */
  async setDefaultAddress(id: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await apiClient.patch(`/addresses/${id}/set-default`);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Erro ao definir endereço padrão:", error);
      return {
        success: false,
        error: extractErrorMessage(error, "Erro ao definir endereço padrão"),
      };
    }
  }

  /**
   * Busca o endereço padrão do usuário
   */
  async getDefaultAddress(): Promise<Address | null> {
    try {
      const addresses = await this.getAddresses();
      return addresses.find((addr) => addr.isDefault) || null;
    } catch (error) {
      console.error("Erro ao buscar endereço padrão:", error);
      return null;
    }
  }

  /**
   * Formata endereço para exibição
   */
  formatAddress(address: Address): string {
    const parts = [
      address.street,
      address.number,
      address.complement,
      address.neighborhood,
      address.city,
      address.state,
      address.zipCode,
    ];

    return parts.filter(Boolean).join(", ");
  }

  /**
   * Formata endereço em múltiplas linhas
   */
  formatAddressMultiline(address: Address): string[] {
    return [
      `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ""}`,
      `${address.neighborhood}`,
      `${address.city} - ${address.state}`,
      `CEP: ${address.zipCode}`,
      address.country,
    ];
  }
}

// Exportar instância singleton
export const addressService = new AddressService();
