"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

export function ConfirmationStep() {
  const router = useRouter();

  const handleTrackOrder = () => {
    router.push("/minhas-compras");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-18 px-4">
      {/* Check verde */}
      <div className="w-14 h-14 bg-[#00C853] rounded-full flex items-center justify-center mb-6">
        <Check className="w-11.5 h-11.5 text-white stroke-[3]" />
      </div>

      {/* Título */}
      <h1 className="text-[28px] text-center mb-3">Compra realizada!</h1>

      {/* Descrição */}
      <p className="text-base text-[#666666] text-center mb-8 max-w-sm">
        Recebemos o seu pedido.
      </p>

      {/* Botão */}
      <button
        onClick={handleTrackOrder}
        className="w-full max-w-sm h-14 bg-[#D5A60A] text-white rounded-full font-medium text-base hover:bg-[#B88F08] transition-colors"
      >
        Acompanhar pedido
      </button>
    </div>
  );
}
