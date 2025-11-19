"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface MobileBackHeaderProps {
  title: string;
  backHref?: string;
  onBackClick?: () => void;
  className?: string;
}

export function MobileBackHeader({
  title,
  backHref = "/",
  onBackClick,
  className = "",
}: MobileBackHeaderProps) {
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
        <h1 className="text-[20px] text-pb-500 font-medium">{title}</h1>
      </div>
    </div>
  );
}
