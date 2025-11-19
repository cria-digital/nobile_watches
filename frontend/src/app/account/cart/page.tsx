"use client";

import { CartItemCard } from "@/components/cart/CartItemCard";
import { MobileBackHeader } from "@/components/layout/MobileBackHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs/Breadcrumbs";
import { useCart } from "@/lib/hooks/useCart";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const { items, isLoading, removeItem, getTotal } = useCart();

  const handleCheckoutItem = (itemId: string) => {
    // Criar checkout apenas para este item
    const item = items.find(i => i.id === itemId);
    if (item) {
      router.push(`/account/checkout?items=${itemId}`);
    }
  };

  const handleCheckoutAll = () => {
    // Criar checkout com todos os items
    const itemIds = items.map(i => i.id).join(",");
    router.push(`/checkout?items=${itemIds}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-[#666666]">Carregando carrinho...</p>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white pb-24 lg:py-8">
        <MobileBackHeader title="Carrinho de compras" />
        <div className="hidden lg:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <Breadcrumbs
                  items={[{ label: "Home", href: "/" }, { label: "Carrinho de compras" }]}
                />
                <h1 className="text-3xl lg:text-[32px] leading-[100%]">
                  Carrinho de compras
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-sm">
            <p className="text-lg text-[#666666] mb-2">Seu carrinho está vazio</p>
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
      <MobileBackHeader title="Carrinho de compras" />
      {/* ==================== HEADER DESKTOP ==================== */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Breadcrumbs
                items={[{ label: "Home", href: "/" }, { label: "Carrinho de compras" }]}
              />
              <h1 className="text-3xl lg:text-[32px] leading-[100%]">
                Carrinho de compras
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de items */}
      <div className="max-w-7xl mx-auto lg:mt-12.5 px-5 lg:px-8">
        <div className="rounded-[12px] lg:border border-[#EFEFEF] py-4 lg:py-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            {items.map(item => (
              <CartItemCard
                key={item.id}
                item={item}
                onRemove={removeItem}
                onCheckout={handleCheckoutItem}
              />
            ))}
          </div>

          {/* Botão de comprar todos */}
          <div className="bg-white border-t border-[#E5E5E5] mt-4">
            <button
              onClick={handleCheckoutAll}
              className="w-full h-14 bg-[#D5A60A] text-white rounded-full font-medium text-base flex items-center justify-center gap-2.5 hover:bg-[#B88F08] transition-colors group"
            >
              <span>Comprar todos</span>
              {/* <div className="w-10 h-10 bg-[#B88F08] rounded-full flex items-center justify-center group-hover:bg-[#9A7706] transition-colors">
              <ArrowRight className="w-5 h-5" />
            </div> */}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
