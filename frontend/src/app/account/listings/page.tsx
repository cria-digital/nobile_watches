"use client";

import { MobileBackHeader } from "@/components/layout/MobileBackHeader";
import { Breadcrumbs, Button } from "@/components/ui";
import { ListingCard } from "@/components/user/ListingCard";
import { UserNav } from "@/components/user/UserNav";
import { useUserListings } from "@/hooks/useUserListings";
import { useAuth } from "@/lib/context/AuthContext";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type TabType = "ativo" | "vendido" | "pausado" | "removido";

export default function MyListingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("ativo");

  const { user } = useAuth();
  console.log("User info:", user);
  const { listings, isLoading, error } = useUserListings();
  const activeListings = listings.filter(listing => listing.status === "ativo");

  const soldListings = listings.filter(listing => listing.status === "vendido");

  const pausedListings = listings.filter(listing => listing.status === "pausado");

  const displayedListings =
    activeTab === "ativo"
      ? activeListings
      : activeTab === "vendido"
        ? soldListings
        : pausedListings;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar anúncios</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white lg:py-8">
      <MobileBackHeader title="Meus anúncios" />

      {/* Desktop */}
      <div className="hidden lg:flex items-center justify-between max-w-7xl mx-auto px-8">
        <div>
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Meus anúncios" }]}
          />
          <h1 className="text-[32px] leading-[100%]">Meus anúncios</h1>
        </div>

        <div className="flex items-center gap-6">
          <UserNav />

          {user?.role === "SELLER" && user?.isVerified && (
            <Link href="/account/sell-watch">
              <Button variant="gold" className="w-[200px] h-[52px]">
                Vender um relógio
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto lg:mt-12.5 px-5 lg:px-8">
        <div>
          <div className="flex lg:px-4">
            <button
              onClick={() => setActiveTab("ativo")}
              className={`flex-1 lg:flex-none lg:w-[198px] h-[41px] px-2 text-base font-normal leading-[140%] tracking-[-1%] transition-colors relative ${
                activeTab === "ativo"
                  ? "text-pb-500 font-medium"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Ativos
              {activeTab === "ativo" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#BE9F56]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("vendido")}
              className={`flex-1 lg:flex-none lg:w-[198px] h-[41px] px-2 font-medium leading-[140%] tracking-[-1%] transition-colors relative ${
                activeTab === "vendido"
                  ? "text-pb-500"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Vendidos
              {activeTab === "vendido" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#BE9F56]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("pausado")}
              className={`flex-1 lg:flex-none lg:w-[198px] h-[41px] px-2 font-medium leading-[140%] tracking-[-1%] transition-colors relative ${
                activeTab === "pausado"
                  ? "text-pb-500"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Pausados
              {activeTab === "pausado" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#BE9F56]" />
              )}
            </button>
          </div>
        </div>

        {/* Lista de anúncios */}
        <div className="rounded-[12px] py-4 lg:py-8">
          {listings?.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl text-gray-900 mb-2">
                  Você ainda não tem anúncios
                </h3>
                <p className="text-gray-600 mb-6">
                  Comece a vender seus relógios de luxo criando seu primeiro anúncio.
                </p>
                <Link
                  href="/account/sell-watch"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Criar primeiro anúncio
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
              {displayedListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
