"use client";

import { MobileBackHeader } from "@/components/layout/MobileBackHeader";
import { Breadcrumbs } from "@/components/ui";
import { OrderCard } from "@/components/user/OrderCard";
import { UserNav } from "@/components/user/UserNav";
import { useOrders } from "@/lib/hooks/useOrders";
import { Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PurchasesPage() {
  const router = useRouter();
  const { orders, isLoading, error } = useOrders();

  const displayOrders = orders;

  // Redireciona para login se houver erro 401
  useEffect(() => {
    if (error && error.message?.includes("401")) {
      router.push("/login");
    }
  }, [error, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white lg:py-8">
        <MobileBackHeader title="Minhas compras" />
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-40"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tratamento de erro (exceto 401 que redireciona)
  if (error && !error.message?.includes("401")) {
    return (
      <div className="min-h-screen bg-white lg:py-8">
        <MobileBackHeader title="Minhas compras" />
        <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">
              Erro ao carregar pedidos. Tente novamente mais tarde.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white lg:py-8">
      {/* Mobile Header */}
      <MobileBackHeader title="Minhas compras" />

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Minhas compras" },
                ]}
              />
              <h1 className="text-3xl lg:text-[32px] leading-[100%]">
                Minhas compras
              </h1>
            </div>
            <UserNav />
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto lg:mt-8 px-5 lg:px-8 lg:pb-[150px]">
        {displayOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-lato font-semibold mb-2">
              Nenhuma compra ainda
            </h2>
            <p className="text-gray-600 mb-6">
              Quando você fizer uma compra, ela aparecerá aqui.
            </p>
            <button
              onClick={() => router.push("/all")}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Ver produtos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 mb-6">
            {displayOrders.map((order) => (
              <OrderCard key={order.id} order={order} showTrackButton={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
