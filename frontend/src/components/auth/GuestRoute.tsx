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

  // Se estiver autenticado, não renderiza nada (vai redirecionar)
  if (isAuthenticated) {
    return null;
  }

  // Renderiza o conteúdo com transição suave
  // Durante o isLoading inicial (agora muito curto), o conteúdo fica levemente opaco
  return (
    <div
      className="transition-opacity duration-200"
      style={{ opacity: isLoading ? 0.6 : 1 }}
    >
      {children}
    </div>
  );
}
