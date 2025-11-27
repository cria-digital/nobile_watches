"use client";

import { cn } from "@/lib/utils/cn";

interface PreviewCardProps {
  brand?: string;
  model?: string;
  referenceNumber?: string;
  className?: string;
}

export function PreviewCard({
  brand = "Marca",
  model = "modelo",
  referenceNumber,
  className,
}: PreviewCardProps) {
  return (
    <div
      className={cn(
        "p-4 bg-gray-50 rounded-lg border border-gray-200",
        "animate-fade-in-slide-up",
        className
      )}
    >
      <p className="text-xs text-gray-500 mb-2">Pré-visualização</p>
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <p className="text-xs mb-1">{brand}</p>
          <h3 className="truncate">{model}</h3>
          <p className="text-xs text-gray-600 truncate mt-1">
            {referenceNumber || "Informações adicionais aparecem aqui..."}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-slide-up {
          animation: fade-in-slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
