"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProtectedMobileHeaderProps {
  /**
   * Título exibido no header mobile
   */
  title: string;

  /**
   * URL de retorno ao clicar na seta (opcional)
   * @default "/" - volta para a home
   */
  backHref?: string;

  /**
   * Callback customizado ao clicar na seta (opcional)
   * Se fornecido, sobrescreve o comportamento do backHref
   */
  onBackClick?: () => void;

  /**
   * Classes CSS adicionais para o container principal (opcional)
   */
  className?: string;
}

/**
 * Header mobile para páginas protegidas (autenticadas)
 *
 * Componente sticky que fica fixo no topo em dispositivos mobile (< lg breakpoint)
 * Contém seta de voltar e título da página
 *
 * @example
 * // Uso básico - volta para home
 * <ProtectedMobileHeader title="Meu perfil" />
 *
 * @example
 * // Com link customizado
 * <ProtectedMobileHeader
 *   title="Detalhes do pedido"
 *   backHref="/minhas-compras"
 * />
 *
 * @example
 * // Com ação customizada
 * <ProtectedMobileHeader
 *   title="Editar perfil"
 *   onBackClick={() => router.back()}
 * />
 */
export function ProtectedMobileHeader({
  title,
  backHref = "/",
  onBackClick,
  className = "",
}: ProtectedMobileHeaderProps) {
  const router = useRouter();

  const handleBackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onBackClick) {
      e.preventDefault();
      onBackClick();
    }
  };

  return (
    <div className={`lg:hidden sticky top-0 z-50 bg-white ${className}`}>
      <div className="flex items-center gap-3 px-5 h-14.5">
        <Link
          href={backHref}
          className="-ml-1"
          onClick={handleBackClick}
          aria-label="Voltar"
        >
          <ArrowLeft className="w-[26px] h-[26px] text-pb-500" strokeWidth={1.5} />
        </Link>
        <h1 className="font-erstoria text-[20px] text-pb-500 font-medium">{title}</h1>
      </div>
    </div>
  );
}
