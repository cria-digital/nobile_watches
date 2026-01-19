"use client";

import { MobileBackHeader } from "@/components/layout/MobileBackHeader";
import { Breadcrumbs, ErrorState, PageLoading } from "@/components/ui";
import { OrderCard } from "@/components/user/OrderCard";
import { UserNav } from "@/components/user/UserNav";
import { useUserOrders } from "@/lib/hooks/useUserOrders";
import { OrderStatus } from "@/types/order";
import { Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type TabType = "in_progress" | "completed";

export default function PurchasesPage() {
  const router = useRouter();
  const { orders, isLoading, error } = useUserOrders();
  const [activeTab, setActiveTab] = useState<TabType>("in_progress");

  /**
   * Filtra pedidos por status
   * - A caminho: pendente, pago, enviado
   * - Finalizados: entregue
   */
  const filteredOrders = useMemo(() => {
    const inProgressStatuses: OrderStatus[] = ["pendente", "pago", "enviado"];
    const completedStatuses: OrderStatus[] = ["entregue"];

    if (activeTab === "in_progress") {
      return orders.filter((order) =>
        inProgressStatuses.includes(order.status)
      );
    } else {
      return orders.filter((order) => completedStatuses.includes(order.status));
    }
  }, [orders, activeTab]);

  const inProgressCount = useMemo(() => {
    return orders.filter((order) =>
      ["pendente", "pago", "enviado"].includes(order.status)
    ).length;
  }, [orders]);

  const completedCount = useMemo(() => {
    return orders.filter((order) => order.status === "entregue").length;
  }, [orders]);

  // Loading
  if (isLoading) {
    return <PageLoading text="Carregando suas compras..." />;
  }

  // Erro
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <MobileBackHeader
          title="Minhas compras"
          onBackClick={() => router.push("/account")}
        />

        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
          <ErrorState title="Erro ao carregar compras" description={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Mobile */}
      <MobileBackHeader
        title="Minhas compras"
        onBackClick={() => router.push("/account")}
      />

      {/* Header Desktop */}
      <div className="hidden lg:block border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Minhas compras" },
                ]}
              />
              <h1 className="text-3xl lg:text-[32px] leading-[100%] mt-2">
                Minhas compras
              </h1>
            </div>
            <UserNav />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-6 lg:py-12">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 lg:mb-8">
          <button
            onClick={() => setActiveTab("completed")}
            className={`
              px-6 py-3 font-lato text-sm lg:text-base transition-colors relative
              ${
                activeTab === "completed"
                  ? "text-pb-500 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }
            `}
          >
            Finalizados
            {completedCount > 0 && (
              <span className="ml-2 text-xs text-gray-500">
                ({completedCount})
              </span>
            )}
            {activeTab === "completed" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pb-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("in_progress")}
            className={`
              px-6 py-3 font-lato text-sm lg:text-base transition-colors relative
              ${
                activeTab === "in_progress"
                  ? "text-pb-500 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }
            `}
          >
            A caminho
            {inProgressCount > 0 && (
              <span className="ml-2 text-xs text-gray-500">
                ({inProgressCount})
              </span>
            )}
            {activeTab === "in_progress" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pb-500" />
            )}
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-lato font-semibold mb-2">
              {activeTab === "in_progress"
                ? "Nenhum pedido a caminho"
                : "Nenhum pedido finalizado"}
            </h2>
            <p className="text-gray-600 mb-6">
              {activeTab === "in_progress"
                ? "Quando você fizer uma compra, ela aparecerá aqui."
                : "Seus pedidos entregues aparecerão aqui."}
            </p>
            {activeTab === "in_progress" && (
              <button
                onClick={() => router.push("/all")}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-lato"
              >
                Ver produtos
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} showTrackButton={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
