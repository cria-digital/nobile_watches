"use client";

import { MobileBackHeader } from "@/components/layout/MobileBackHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs/Breadcrumbs";
import { OrderCard } from "@/components/user/OrderCard";
import { UserNav } from "@/components/user/UserNav";
import { useUserOrders } from "@/lib/hooks/useUserOrders";
import { useState } from "react";

type TabType = "em_transito" | "entregue";

export default function MinhasComprasPage() {
  const { orders, isLoading, error } = useUserOrders();
  const [activeTab, setActiveTab] = useState<TabType>("em_transito");

  // Filtrar pedidos por status
  const ordersInTransit = orders.filter(
    order =>
      order.status === "enviado" ||
      order.status === "em_transito" ||
      order.status === "em_preparacao" ||
      order.status === "pago"
  );

  const deliveredOrders = orders.filter(
    order => order.status === "entregue" || order.status === "cancelado"
  );

  const displayedOrders = activeTab === "em_transito" ? ordersInTransit : deliveredOrders;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">Erro ao carregar pedidos: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white lg:py-8">
      <MobileBackHeader title="Minhas compras" />
      {/* ==================== HEADER DESKTOP ==================== */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Breadcrumbs
                items={[{ label: "Home", href: "/" }, { label: "Minhas compras" }]}
              />
              <h1 className="text-3xl lg:text-[32px] leading-[100%]">Minhas compras</h1>
            </div>
            <UserNav />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto lg:mt-12.5 px-5 lg:px-8">
        {/* Abas de filtro */}
        <div className="">
          <div className="flex lg:px-4">
            <button
              onClick={() => setActiveTab("entregue")}
              className={`flex-1 lg:flex-none lg:w-[198px] h-[41px] px-2 text-[18px] font-medium leading-[140%] tracking-[-1%] transition-colors relative ${
                activeTab === "entregue"
                  ? "text-pb-500"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Finalizados
              {activeTab === "entregue" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#BE9F56]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("em_transito")}
              className={`flex-1 lg:flex-none lg:w-[198px] h-[41px] px-2 text-[18px] font-medium leading-[140%] tracking-[-1%] transition-colors relative ${
                activeTab === "em_transito"
                  ? "text-pb-500"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              A caminho
              {activeTab === "em_transito" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#BE9F56]" />
              )}
            </button>
          </div>
        </div>

        {/* Lista de pedidos */}
        <div className="rounded-[12px] lg:border border-[#EFEFEF] py-4 lg:py-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BE9F56]" />
            </div>
          ) : displayedOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {activeTab === "em_transito"
                  ? "Você não possui pedidos a caminho no momento."
                  : "Você ainda não possui pedidos finalizados."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
              {displayedOrders.map(order => (
                <OrderCard key={order.id} order={order} showTrackButton={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
