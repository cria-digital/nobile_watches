"use client";

import { MobileBackHeader } from "@/components/layout/MobileBackHeader";
import { Breadcrumbs, Button } from "@/components/ui";
import { UserNav } from "@/components/user/UserNav";
import { mockWishlistItems } from "@/lib/data/mockWishlist";
import nobileService from "@/lib/services/nobile.service";
import { stringToSlug } from "@/lib/utils/stringUtils";
import { Heart, Trash2, Watch } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";

interface WishlistItemEdit {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  addedAt: string;
}

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

/**
 * Fetcher para SWR - busca wishlist da API
 */
const fetcher = async () => {
  const data = await nobileService.getWishlist();
  return data;
};

export default function WishlistPage() {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<number | null>(null);

  const {
    data: apiWishlistItems,
    error,
    isLoading,
    mutate,
  } = useSWR(USE_MOCK_DATA ? null : "/wishlist", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const wishlistItems: WishlistItemEdit[] = USE_MOCK_DATA
    ? mockWishlistItems?.map(item => ({
        id: item.watchId.toString(),
        name: item.watch.model,
        brand: item.watch.brand,
        price: item.watch.price,
        image: item.watch.images?.[0] || "",
        addedAt: item.addedAt,
      }))
    : apiWishlistItems?.map(item => ({
        id: item.watchId.toString(),
        name: item.watch.model,
        brand: item.watch.brand,
        price: item.watch.price,
        image: item.watch.images?.[0] || "",
        addedAt: item.addedAt,
      })) || [];

  /**
   * Remove item da wishlist
   */
  const handleRemoveItem = useCallback(
    async (watchId: string) => {
      const watchIdNumber = Number(watchId);
      if (isNaN(watchIdNumber)) return;

      setRemovingId(watchIdNumber);

      try {
        await nobileService.removeFromWishlist(watchIdNumber);

        // Atualiza a lista localmente (otimistic update)
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
              {[1, 2, 3].map(i => (
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
            items={[{ label: "Home", href: "/" }, { label: "Lista de desejos" }]}
          />
          <h1 className="text-[32px] leading-[100%]">Lista de desejos</h1>
        </div>
        <UserNav />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-6 lg:mt-8">
        {/* Empty State */}
        {wishlistItems.length === 0 && (
          <div className="bg-[#F7F7F7] rounded-xl p-8 lg:p-12 text-center">
            <div className="max-w-md mx-auto">
              <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="font-lato text-lg font-medium text-pb-500 mb-2">
                Nenhum relógio salvo
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Comece a adicionar relógios à sua lista de desejos clicando no ícone de
                coração ao navegar pela nossa coleção.
              </p>
              <Link href="/shop">
                <Button variant="primary" className="mx-auto">
                  Explorar Relógios
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Wishlist Grid */}
        {wishlistItems.length > 0 && (
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                {wishlistItems.length}{" "}
                {wishlistItems.length === 1 ? "relógio salvo" : "relógios salvos"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {wishlistItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className={`relative aspect-square bg-[#EFEFEF] overflow-hidden`}>
                    {item?.image?.trim() === "" ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#EFEFEF] to-[#E0E0E0]">
                        <Watch className="w-12 h-12 text-[#999999]" strokeWidth={1.5} />
                      </div>
                    ) : (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={removingId === Number(item.id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Remover da lista de desejos"
                    >
                      <Trash2
                        className={`h-4 w-4 text-red-500 ${
                          removingId === Number(item.id) ? "animate-pulse" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-1">{item.brand}</p>
                    <h3 className="font-lato text-base font-medium text-pb-500 mb-2 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-lg font-semibold text-pb-500 mb-4">
                      R$ {item.price.toLocaleString("pt-BR")}
                    </p>
                    <Link
                      href={`/${stringToSlug(item.brand)}/${stringToSlug(
                        item.name
                      )}-${item.id}`}
                    >
                      <Button variant="stroke" className="w-full">
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
