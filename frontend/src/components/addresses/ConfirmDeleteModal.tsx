"use client";

import { Button } from "@/components/ui";
import { AlertTriangle } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  addressLabel: string;
  isLoading?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onConfirm,
  onCancel,
  addressLabel,
  isLoading = false,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[16px] max-w-md w-full p-6">
        {/* Ícone de alerta */}
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>

        {/* Título */}
        <h2 className="text-xl font-semibold text-center mb-2">
          Remover endereço?
        </h2>

        {/* Descrição */}
        <p className="text-gray-600 text-center mb-6">
          Tem certeza que deseja remover o endereço{" "}
          <strong>{addressLabel}</strong>? Esta ação não pode ser desfeita.
        </p>

        {/* Botões */}
        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            variant="stroke"
            className="flex-1"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Removendo..." : "Remover"}
          </Button>
        </div>
      </div>
    </div>
  );
}
