import { UserActivity, UserProfileData } from "@/types/user";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Dados mockados para desenvolvimento
 * Usado quando o mock login está ativo
 */
const MOCK_USER_PROFILE_DATA: UserProfileData = {
  user: {
    id: 1,
    name: "Lohan Marçal",
    email: "teste@nobile.com",
    phone: "+55 51 99999-8888",
    country: "Brasil",
    state: "Rio Grande do Sul",
    city: "Porto Alegre",
    role: "BUYER",
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    avatar: "/images/mock/avatar-placeholder.jpg",
  },
  activity: {
    vendidos: 3,
    comprados: 8,
    colecao: 12,
  },
  paymentMethods: [
    {
      id: "pm-001",
      cardholderName: "Lohan Marçal",
      cardNumber: "**** **** **** 4567",
      expiryDate: "08/26",
      cvv: "***",
      type: "Crédito",
    },
    {
      id: "pm-002",
      cardholderName: "Lohan Marçal",
      cardNumber: "**** **** **** 8901",
      expiryDate: "12/27",
      cvv: "***",
      type: "Débito",
    },
  ],
  billingAddresses: [
    {
      id: "addr-001",
      street: "Rua das Flores",
      number: "123",
      complement: "Apto 45",
      city: "Porto Alegre",
      state: "RS",
      zipCode: "90000-000",
      country: "Brasil",
      isDefault: true,
    },
    {
      id: "addr-002",
      street: "Av. Ipiranga",
      number: "6681",
      complement: "Sala 302",
      city: "Porto Alegre",
      state: "RS",
      zipCode: "90619-900",
      country: "Brasil",
      isDefault: false,
    },
  ],
};

/**
 * Hook para buscar e gerenciar dados do perfil do usuário
 * Suporta modo mock para desenvolvimento quando API não está disponível
 */
export function useUserProfile() {
  const [data, setData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  /**
   * Verifica se o mock login está ativo
   */
  const isMockActive = (): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("mock_auth_token") === "mock_token_active";
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Se mock está ativo, retornar dados mockados
      if (isMockActive()) {
        console.log("📊 Usando dados mockados do perfil");
        // Simula delay de rede para realismo
        await new Promise(resolve => setTimeout(resolve, 500));
        setData(MOCK_USER_PROFILE_DATA);
        setIsLoading(false);
        return;
      }

      // Caso contrário, buscar dados reais da API
      // Buscar dados do usuário atual
      const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: "include",
      });

      if (!userResponse.ok) {
        throw new Error("Erro ao buscar dados do usuário");
      }

      const { user } = await userResponse.json();

      // Buscar atividade do usuário (pedidos, anúncios, coleção)
      const [ordersRes, watchesRes, collectionRes] = await Promise.all([
        fetch(`${API_BASE_URL}/orders`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/watches?sellerId=${user.id}`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/collections`, { credentials: "include" }),
      ]);

      const orders = ordersRes.ok ? await ordersRes.json() : [];
      const watches = watchesRes.ok ? await watchesRes.json() : [];
      const collection = collectionRes.ok ? await collectionRes.json() : [];

      const activity: UserActivity = {
        vendidos: watches.filter((w: any) => w.status === "vendido").length,
        comprados: orders.length,
        colecao: collection.length,
      };

      // Buscar métodos de pagamento e endereços de cobrança
      const [paymentMethodsRes, billingAddressesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/payment-methods`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/billing-addresses`, { credentials: "include" }),
      ]);

      const paymentMethods = paymentMethodsRes.ok ? await paymentMethodsRes.json() : [];
      const billingAddresses = billingAddressesRes.ok
        ? await billingAddressesRes.json()
        : [];

      const profileData: UserProfileData = {
        user,
        activity,
        paymentMethods,
        billingAddresses,
      };

      setData(profileData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      console.error("Erro ao buscar perfil:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserData = async (updatedData: Partial<UserProfileData["user"]>) => {
    try {
      // Se mock está ativo, simular atualização
      if (isMockActive()) {
        console.log("📝 Simulando atualização de dados:", updatedData);
        // Simula delay de rede
        await new Promise(resolve => setTimeout(resolve, 300));

        // Atualiza dados localmente no mock
        setData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            user: {
              ...prev.user,
              ...updatedData,
              updatedAt: new Date().toISOString(),
            },
          };
        });

        console.log("✅ Dados atualizados no mock");
        return;
      }

      // Caso contrário, atualizar via API real
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar dados do usuário");
      }

      // Recarregar dados atualizados
      await fetchUserProfile();
      console.log("✅ Dados atualizados com sucesso");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar dados";
      console.error("Erro ao atualizar perfil:", errorMessage);
      throw err;
    }
  };

  /**
   * Adiciona um novo método de pagamento
   */
  const addPaymentMethod = async (
    paymentMethod: Omit<UserProfileData["paymentMethods"][0], "id">
  ) => {
    if (isMockActive()) {
      console.log("💳 Simulando adição de método de pagamento:", paymentMethod);
      await new Promise(resolve => setTimeout(resolve, 300));

      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          paymentMethods: [
            ...prev.paymentMethods,
            { ...paymentMethod, id: `pm-${Date.now()}` },
          ],
        };
      });

      console.log("✅ Método de pagamento adicionado no mock");
      return;
    }

    // API real
    const response = await fetch(`${API_BASE_URL}/payment-methods`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(paymentMethod),
    });

    if (!response.ok) throw new Error("Erro ao adicionar método de pagamento");
    await fetchUserProfile();
  };

  /**
   * Remove um método de pagamento
   */
  const removePaymentMethod = async (paymentMethodId: string) => {
    if (isMockActive()) {
      console.log("🗑️ Simulando remoção de método de pagamento:", paymentMethodId);
      await new Promise(resolve => setTimeout(resolve, 300));

      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          paymentMethods: prev.paymentMethods.filter(pm => pm.id !== paymentMethodId),
        };
      });

      console.log("✅ Método de pagamento removido no mock");
      return;
    }

    // API real
    const response = await fetch(`${API_BASE_URL}/payment-methods/${paymentMethodId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Erro ao remover método de pagamento");
    await fetchUserProfile();
  };

  /**
   * Adiciona um novo endereço de cobrança
   */
  const addBillingAddress = async (
    address: Omit<UserProfileData["billingAddresses"][0], "id">
  ) => {
    if (isMockActive()) {
      console.log("📍 Simulando adição de endereço:", address);
      await new Promise(resolve => setTimeout(resolve, 300));

      setData(prev => {
        if (!prev) return prev;
        // Se novo endereço é default, desmarcar outros
        const updatedAddresses = address.isDefault
          ? prev.billingAddresses.map(addr => ({ ...addr, isDefault: false }))
          : prev.billingAddresses;

        return {
          ...prev,
          billingAddresses: [
            ...updatedAddresses,
            { ...address, id: `addr-${Date.now()}` },
          ],
        };
      });

      console.log("✅ Endereço adicionado no mock");
      return;
    }

    // API real
    const response = await fetch(`${API_BASE_URL}/billing-addresses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(address),
    });

    if (!response.ok) throw new Error("Erro ao adicionar endereço");
    await fetchUserProfile();
  };

  /**
   * Remove um endereço de cobrança
   */
  const removeBillingAddress = async (addressId: string) => {
    if (isMockActive()) {
      console.log("🗑️ Simulando remoção de endereço:", addressId);
      await new Promise(resolve => setTimeout(resolve, 300));

      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          billingAddresses: prev.billingAddresses.filter(addr => addr.id !== addressId),
        };
      });

      console.log("✅ Endereço removido no mock");
      return;
    }

    // API real
    const response = await fetch(`${API_BASE_URL}/billing-addresses/${addressId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Erro ao remover endereço");
    await fetchUserProfile();
  };

  return {
    data,
    isLoading,
    error,
    refetch: fetchUserProfile,
    updateUserData,
    addPaymentMethod,
    removePaymentMethod,
    addBillingAddress,
    removeBillingAddress,
    isMockMode: isMockActive(),
  };
}
