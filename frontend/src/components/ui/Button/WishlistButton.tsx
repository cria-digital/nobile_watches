"use client";

import { AlertModal } from "@/components/ui";
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
  /**
   * Se true, verifica o status na API ao renderizar.
   * Use apenas na página do produto individual (ProductPageClient).
   * Em listas, mantenha false para melhor performance.
   */
  checkStatus?: boolean;
}

/**
 * Botão para adicionar/remover relógios da wishlist
 *
 * OTIMIZAÇÃO DE PERFORMANCE:
 * - checkStatus=false (padrão): Não faz requisição inicial, apenas mostra ícone vazio
 * - checkStatus=true: Verifica status na API (usar apenas em ProductPageClient)
 *
 * USO:
 * - Em listas (ProductCard): <WishlistButton watchId={id} /> (sem verificação)
 * - Na página do produto: <WishlistButton watchId={id} checkStatus={true} />
 */
export function WishlistButton({
  watchId,
  className = "",
  size = "medium",
  showToast = true,
  checkStatus = false,
}: WishlistButtonProps) {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Hook com SWR para gerenciar o status da wishlist
  const { isFavorited, mutate } = useWishlistStatus(watchId, checkStatus);

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

    // Verificar autenticação
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsActionLoading(true);

    try {
      if (isFavorited) {
        // Remover da wishlist
        await apiClient.delete(`/wishlist/${watchId}`);
        mutate(false, false);

        if (showToast) {
          setAlert({
            message: "Relógio removido da lista de desejos",
            type: "success",
          });
        }
      } else {
        // Adicionar à wishlist
        await apiClient.post("/wishlist", { watchId });
        mutate(true, false);

        if (showToast) {
          setAlert({
            message: "Relógio guardado na lista de desejos!",
            type: "success",
          });
        }
      }
    } catch (error: any) {
      console.error("Erro ao atualizar lista de desejos:", error);

      // Reverter mudança otimista
      mutate();

      if (showToast) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Erro ao atualizar lista de desejos. Tente novamente.";

        setAlert({
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
      {alert && showToast && (
        <AlertModal
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
          duration={alert.type === "error" ? 5000 : 3000}
        />
      )}

      <button
        className={`flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label={
          isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"
        }
        onClick={handleToggle}
        disabled={isActionLoading}
      >
        <Image
          src={
            isFavorited ? "/icons/heart-filled.svg" : "/icons/heart-outline.svg"
          }
          alt={
            isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"
          }
          width={iconSize}
          height={iconSize}
        />
      </button>
    </>
  );
}
