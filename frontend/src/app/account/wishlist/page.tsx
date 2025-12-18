"use client";

import { MobileBackHeader } from "@/components/layout/MobileBackHeader";
import { Breadcrumbs, Button } from "@/components/ui";
import { WishlistCard } from "@/components/ui/Card/WishlistCard";
import { UserNav } from "@/components/user/UserNav";

import nobileService from "@/lib/services/nobile.service";
import { WishlistItem } from "@/types/wishlist";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";

/**
 * Fetcher para SWR - busca wishlist da API
 */
const fetcher = async (): Promise<WishlistItem[]> => {
  const data = await nobileService.getWishlist();

  //@ts-ignore
  return data;
};

export default function WishlistPage() {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<number | null>(null);

  const {
    data: wishlistItems,
    error,
    isLoading,
    mutate,
  } = useSWR<WishlistItem[]>("/wishlist", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const handleRemoveItem = useCallback(
    async (watchId: number) => {
      setRemovingId(watchId);

      try {
        await nobileService.removeFromWishlist(watchId);

        // Atualiza a lista localmente (optimistic update)
        mutate();
      } catch (error) {
        console.error("Erro ao remover item da wishlist:", error);
        // Em caso de erro, reverte a mudança
        mutate();
      } finally {
        setRemovingId(null);
      }
    },
    [mutate]
  );

  // Redireciona para login se houver erro 401
  useEffect(() => {
    if (error?.response?.status === 401) {
      router.push("/login");
    }
  }, [error, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white lg:py-8">
        <MobileBackHeader title="Lista de desejos" />
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tratamento de erro (exceto 401 que redireciona)
  if (error && error?.response?.status !== 401) {
    return (
      <div className="min-h-screen bg-white lg:py-8">
        <MobileBackHeader title="Lista de desejos" />
        <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">
              Erro ao carregar lista de desejos. Tente novamente mais tarde.
            </p>
            <Button variant="primary" className="mt-4" onClick={() => mutate()}>
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white lg:py-8">
      <MobileBackHeader title="Lista de desejos" />

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between max-w-7xl mx-auto px-8">
        <div>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Lista de desejos" },
            ]}
          />
          <h1 className="text-[32px] leading-[100%]">Lista de desejos</h1>
        </div>
        <UserNav />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-6 lg:mt-8">
        {/* Empty State */}
        {(wishlistItems || []).length === 0 && (
          <div className="bg-[#F7F7F7] rounded-xl p-8 lg:p-12 text-center">
            <div className="max-w-md mx-auto">
              <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="font-lato text-lg font-medium text-pb-500 mb-2">
                Nenhum relógio salvo
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Comece a adicionar relógios à sua lista de desejos clicando no
                ícone de coração ao navegar pela nossa coleção.
              </p>
              <Link href="/all">
                <Button variant="primary" className="mx-auto">
                  Explorar Relógios
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Wishlist Grid */}
        {(wishlistItems || []).length > 0 && (
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                {(wishlistItems || []).length}{" "}
                {(wishlistItems || []).length === 1
                  ? "relógio salvo"
                  : "relógios salvos"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(wishlistItems || []).map((item) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  onRemove={handleRemoveItem}
                  isRemoving={removingId === item.watchId}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
