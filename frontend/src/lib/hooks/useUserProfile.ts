import { apiClient, extractErrorMessage } from "@/lib/api";
import { authService } from "@/lib/services/auth.service";
import { UserActivity, UserProfileData } from "@/types/user";
import { useEffect, useState } from "react";

type VerificationStatus = "pending" | "approved" | "rejected" | null;

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
    role: "SELLER",
    isVerified: false,
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
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Busca o status de verificação quando o usuário não está verificado
  useEffect(() => {
    if (data?.user && !data.user.isVerified) {
      fetchVerificationStatus();
    }
  }, [data?.user?.isVerified]);

  const isMockActive = (): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("mock_auth_token") === "mock_token_active";
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isMockActive()) {
        console.log("📊 Usando dados mockados do perfil");
        await new Promise(resolve => setTimeout(resolve, 500));
        setData(MOCK_USER_PROFILE_DATA);
        setIsLoading(false);
        return;
      }

      // Buscar dados do usuário atual
      const userResponse = await apiClient.get("/users/me");
      const user = userResponse.data;

      // Buscar atividade do usuário (pedidos, anúncios, coleção)
      // Usando Promise.allSettled para não quebrar se algum endpoint falhar
      const [ordersResponse, watchesResponse, collectionResponse] =
        await Promise.allSettled([
          apiClient.get("/orders"),
          apiClient.get(`/watches?sellerId=${user.id}`),
          apiClient.get("/collections"),
        ]);

      // Extrair dados ou usar array vazio em caso de erro
      const orders =
        ordersResponse.status === "fulfilled" ? ordersResponse.value.data : [];
      const watches =
        watchesResponse.status === "fulfilled" ? watchesResponse.value.data : [];
      const collection =
        collectionResponse.status === "fulfilled" ? collectionResponse.value.data : [];

      const activity: UserActivity = {
        vendidos: watches.filter((w: any) => w.status === "vendido").length,
        comprados: orders.length,
        colecao: collection.length,
      };

      const profileData: UserProfileData = {
        user,
        activity,
        paymentMethods: [],
        billingAddresses: [],
      };

      setData(profileData);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "Erro ao buscar perfil do usuário");
      console.error("Erro ao buscar perfil:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVerificationStatus = async () => {
    if (isMockActive()) {
      console.log("📊 Modo mock ativo - pulando verificação de status");
      return;
    }

    setIsLoadingStatus(true);
    try {
      const response = await authService.getVerificationStatus();
      setVerificationStatus(response.user.verificationStatus);
    } catch (error) {
      console.error("Erro ao buscar status de verificação:", error);
      // Em caso de erro, mantém null para permitir que o usuário tente
      setVerificationStatus(null);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const updateUserData = async (updatedData: Partial<UserProfileData["user"]>) => {
    try {
      if (isMockActive()) {
        console.log("📝 Simulando atualização de dados:", updatedData);
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

      await apiClient.patch("/users/profile", updatedData);

      // Recarregar dados atualizados
      await fetchUserProfile();
      console.log("✅ Dados atualizados com sucesso");
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "Erro ao atualizar dados do usuário");
      console.error("Erro ao atualizar perfil:", errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refetch = () => {
    fetchUserProfile();
  };

  const refetchVerificationStatus = () => {
    fetchVerificationStatus();
  };

  return {
    data,
    isLoading,
    error,
    verificationStatus,
    isLoadingStatus,
    refetch,
    refetchVerificationStatus,
    updateUserData,
  };
}
