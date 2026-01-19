"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface AlertModalProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
}

/**
 * Modal minimalista centralizado para feedback de ações
 * Aparece no centro da tela e desaparece automaticamente
 */
export function AlertModal({
  message,
  type,
  onClose,
  duration = 3000,
}: AlertModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animação de entrada
    const showTimeout = setTimeout(() => setIsVisible(true), 10);

    // Auto-close
    const closeTimeout = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Aguarda animação de saída
    }, duration);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(closeTimeout);
    };
  }, [duration, onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
      role="alert"
      aria-live="polite"
    >
      {/* Overlay sutil (opcional) */}
      <div
        className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Modal */}
      <div
        className={`relative pointer-events-auto bg-white rounded-2xl shadow-2xl px-8 py-6 max-w-md mx-4 transform transition-all duration-300 ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Ícone */}
          <div className="flex-shrink-0">
            {type === "success" ? (
              <CheckCircle2 className="w-8 h-8 text-pb-500" strokeWidth={2} />
            ) : (
              <XCircle className="w-8 h-8 text-red-500" strokeWidth={2} />
            )}
          </div>

          {/* Mensagem */}
          <p
            className={`text-base font-medium ${
              type === "success" ? "text-gray-800" : "text-gray-800"
            }`}
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
