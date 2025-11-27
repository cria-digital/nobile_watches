"use client";

import clsx from "clsx";
import Image from "next/image";

interface VerifiedBadgeProps {
  className?: string;
  role?: "BUYER" | "SELLER" | "ADMIN"; // agora opcional
}

export function VerifiedBadge({ className, role = "SELLER" }: VerifiedBadgeProps) {
  const getLabel = () => {
    switch (role) {
      case "BUYER":
        return "Usuário verificado";
      case "ADMIN":
        return "Administrador verificado";
      default:
        return "Vendedor verificado"; // default
    }
  };

  return (
    <div
      className={clsx(
        "flex items-center gap-1 bg-[#EFEFEF] rounded-sm px-2",
        "h-[24px] lg:h-[28px]",
        className
      )}
    >
      <Image
        src="/icons/verified-badge.svg"
        alt={getLabel()}
        width={16}
        height={16}
        style={{ width: 16, height: 16 }}
      />

      <p className="text-sm leading-5">
        {/* Mobile */}
        <span className="lg:hidden">Verificado</span>

        {/* Desktop */}
        <span className="hidden lg:inline">{getLabel()}</span>
      </p>
    </div>
  );
}
