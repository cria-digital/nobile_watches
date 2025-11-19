"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Só redireciona após carregar o estado de autenticação
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pb-500" />
      </div>
    );
  }

  // Se estiver autenticado, não renderiza nada (vai redirecionar)
  if (isAuthenticated) {
    return null;
  }

  // Se não estiver autenticado, renderiza o conteúdo normalmente
  return <>{children}</>;
}
