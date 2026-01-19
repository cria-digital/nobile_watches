// src/app/account/cart/page.tsx
"use client";

import { CartItemCard } from "@/components/cart/CartItemCard";
import { MobileBackHeader } from "@/components/layout/MobileBackHeader";
import { Button, ErrorState, PageLoading } from "@/components/ui";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs/Breadcrumbs";
import { UserNav } from "@/components/user/UserNav";
import { useAuth } from "@/lib/context/AuthContext";
import { useCart } from "@/lib/hooks/useCart";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { items, isLoading, error, removeItem, getTotal } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  // Redireciona para login se houver erro 401
  useEffect(() => {
    if (error && error.message?.includes("401")) {
      router.push("/login");
    }
  }, [error, router]);

  /**
   * Checkout de um item específico
   * Redireciona para checkout com apenas este item
   */
  const handleCheckoutItem = (itemId: string) => {
    // Verificar autenticação
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const item = items.find((i) => i.id === itemId);
    if (item) {
      router.push(`/account/checkout?items=${itemId}`);
    }
  };

  /**
   * Checkout de todos os itens
   * Redireciona para checkout com todos os itens do carrinho
   */
  const handleCheckoutAll = () => {
    // Verificar autenticação
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Verificar se há itens
    if (items.length === 0) {
      return;
    }

    setIsProcessing(true);

    // Pegar IDs de todos os itens e juntar com vírgula
    const itemIds = items.map((i) => i.id).join(",");

    router.push(`/account/checkout?items=${itemIds}`);
  };

  if (isLoading) {
    return <PageLoading text="Carregando carrinho..." />;
  }

  if (error && !error.message?.includes("401")) {
    return (
      <ErrorState
        title="Erro ao carregar carrinho."
        description="Não foi possível conectar ao servidor. Tente novamente mais tarde."
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white pb-24 lg:py-8">
        <MobileBackHeader title="Carrinho de compras" />

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <Breadcrumbs
                  items={[
                    { label: "Home", href: "/" },
                    { label: "Carrinho de compras" },
                  ]}
                />
                <h1 className="text-3xl lg:text-[32px] leading-[100%]">
                  Carrinho de compras
                </h1>
              </div>
              <UserNav />
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-lato font-semibold mb-2">
              Seu carrinho está vazio
            </h2>
            <p className="text-sm text-[#999999] mb-6">
              Adicione relógios incríveis à sua coleção
            </p>
            <button
              onClick={() => router.push("/all")}
              className="px-6 py-3 bg-[#D5A60A] text-white rounded-full font-medium hover:bg-[#B88F08] transition-colors"
            >
              Explorar relógios
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 lg:py-8">
      <MobileBackHeader title="Meu carrinho" />

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Meu carrinho" },
                ]}
              />
              <h1 className="text-3xl lg:text-[32px] leading-[100%]">
                Meu carrinho
              </h1>
            </div>
            <UserNav />
          </div>
        </div>
      </div>

      {/* Lista de items */}
      <div className="max-w-7xl mx-auto lg:mt-8 px-5 lg:px-8 lg:pb-[150px]">
        <div className="rounded-[12px] lg:border border-[#EFEFEF] py-4 lg:py-6 lg:px-8">
          {/* Grid de produtos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 mb-6">
            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onRemove={removeItem}
                onCheckout={handleCheckoutItem}
              />
            ))}
          </div>

          {/* Resumo e Checkout */}
          <div className="bg-[#F7F7F7] rounded-[12px] p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium">Total do carrinho:</span>
              <span className="text-2xl font-semibold">
                R$ {getTotal().toLocaleString("pt-BR")}
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              {items.length} {items.length === 1 ? "item" : "itens"} no carrinho
            </p>

            {/* ✅ Botão habilitado e com validação de autenticação */}
            <Button
              onClick={handleCheckoutAll}
              variant="gold"
              className="w-full"
              disabled={isProcessing || items.length === 0}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processando...</span>
                </div>
              ) : (
                "Finalizar compra"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
