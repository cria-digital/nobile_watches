"use client";

import { Toast } from "@/components/ui";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import { useWishlistStatus } from "@/lib/hooks/useWishlistStatus";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface WishlistButtonProps {
  watchId: string | number;
  className?: string;
  size?: "small" | "medium" | "large";
  showToast?: boolean;
}

/**
 * Componente de botão para adicionar/remover relógios da wishlist
 *
 * MODO DE OPERAÇÃO:
 * - MOCK (NEXT_PUBLIC_USE_MOCK_DATA=true): Apenas alterna estado local, sem requisições
 * - REAL (NEXT_PUBLIC_USE_MOCK_DATA=false): Usa SWR para gerenciar o estado da wishlist
 *
 * MELHORIAS COM SWR:
 * - Deduplicação automática de requisições (evita duplicações)
 * - Cache integrado (melhora performance)
 * - Revalidação inteligente
 * - Evita race conditions
 *
 * @param watchId - ID do relógio
 * @param className - Classes CSS adicionais
 * @param size - Tamanho do ícone (small: 20px, medium: 24px, large: 28px)
 * @param showToast - Se deve mostrar toast de feedback (padrão: true)
 */
export function WishlistButton({
  watchId,
  className = "",
  size = "medium",
  showToast = true,
}: WishlistButtonProps) {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Verificar se deve usar mock data
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  // Hook customizado com SWR para gerenciar o status da wishlist
  // Isso evita requisições duplicadas e melhora o cache
  const { isFavorited, mutate } = useWishlistStatus(watchId);

  // Estado local para modo mock
  const [mockFavorited, setMockFavorited] = useState(false);

  // Determinar o estado final (mock ou real)
  const finalIsFavorited = useMockData ? mockFavorited : isFavorited;

  // Mapeamento de tamanhos
  const sizeMap = {
    small: 20,
    medium: 24,
    large: 32,
  };

  const iconSize = sizeMap[size];

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Verificar se o usuário está logado
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Se estiver em modo mock, apenas alterna o estado local
    if (useMockData) {
      setMockFavorited(!mockFavorited);

      if (showToast) {
        setToast({
          message: !mockFavorited
            ? "Relógio guardado na lista de desejos!"
            : "Relógio removido da lista de desejos",
          type: "success",
        });
      }
      return;
    }

    // Modo real: fazer requisições à API
    setIsActionLoading(true);

    try {
      if (finalIsFavorited) {
        // Remover da wishlist
        await apiClient.delete(`/wishlist/${watchId}`);

        // Atualizar o cache do SWR de forma otimista
        mutate(false, false);

        if (showToast) {
          setToast({
            message: "Relógio removido da lista de desejos",
            type: "success",
          });
        }
      } else {
        // Adicionar à wishlist
        await apiClient.post("/wishlist", {
          watchId: watchId,
        });

        // Atualizar o cache do SWR de forma otimista
        mutate(true, false);

        if (showToast) {
          setToast({
            message: "Relógio guardado na lista de desejos!",
            type: "success",
          });
        }
      }
    } catch (error: any) {
      console.error("Erro ao atualizar lista de desejos:", error);

      // Reverter mudança otimista em caso de erro
      mutate();

      if (showToast) {
        // Mensagem de erro personalizada
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Erro ao atualizar lista de desejos. Tente novamente.";

        setToast({
          message: errorMessage,
          type: "error",
        });
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <>
      {/* Toast de feedback */}
      {toast && showToast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={toast.type === "error" ? 5000 : 3000}
        />
      )}

      <button
        className={`flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label={
          finalIsFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"
        }
        onClick={handleToggle}
        disabled={isActionLoading}
      >
        <Image
          src={finalIsFavorited ? "/icons/heart-filled.svg" : "/icons/heart-outline.svg"}
          alt={finalIsFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          width={iconSize}
          height={iconSize}
        />
      </button>
    </>
  );
}
