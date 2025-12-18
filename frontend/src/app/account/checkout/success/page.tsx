"use client";

import { PageLoading } from "@/components/ui";
import { checkoutService } from "@/lib/services/checkout.service";
import { CheckCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      router.push("/account/cart");
      return;
    }

    verifyAndCreateOrders();
  }, [sessionId]);

  const verifyAndCreateOrders = async () => {
    if (!sessionId) return;

    try {
      const result = await checkoutService.verifyPayment(sessionId);

      if (result.success) {
        // Pagamento confirmado e pedidos criados!
        setTimeout(() => {
          router.push("/account/purchases");
        }, 2000);
      } else {
        setError(result.error || "Erro ao confirmar pagamento");
        setIsVerifying(false);
      }
    } catch (err) {
      setError("Erro ao processar pagamento");
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return <PageLoading text="Confirmando pagamento..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Erro ao processar pagamento
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/account/cart")}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg"
          >
            Voltar ao carrinho
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pagamento confirmado!
        </h1>
        <p className="text-gray-600 mb-6">
          Seus pedidos foram criados com sucesso.
          <br />
          Redirecionando para suas compras...
        </p>
      </div>
    </div>
  );
}
