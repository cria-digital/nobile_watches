// src/components/orders/ShippingAddressCard.tsx
"use client";

import { MapPin, Phone, User } from "lucide-react";

interface ShippingAddress {
  recipientName: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

interface ShippingAddressCardProps {
  shippingInfo: string | null | undefined;
}

/**
 * Componente para exibir o endereço de entrega do pedido
 * Usa o shippingInfo salvo no pedido (formato JSON)
 */
export function ShippingAddressCard({
  shippingInfo,
}: ShippingAddressCardProps) {
  if (!shippingInfo) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-gray-400" />
          <h3 className="font-medium text-gray-900">Endereço de Entrega</h3>
        </div>
        <p className="text-sm text-gray-500">
          Informações de entrega não disponíveis
        </p>
      </div>
    );
  }

  // Parse do JSON do shippingInfo
  let address: ShippingAddress;
  try {
    address = JSON.parse(shippingInfo);
  } catch (error) {
    console.error("Erro ao fazer parse do shippingInfo:", error);
    return (
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-gray-400" />
          <h3 className="font-medium text-gray-900">Endereço de Entrega</h3>
        </div>
        <p className="text-sm text-gray-500">
          Erro ao carregar informações de entrega
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F7F7] rounded-xl p-6 border border-[#EFEFEF]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-[#D5A60A] bg-opacity-10 rounded-lg flex items-center justify-center">
          <MapPin className="w-5 h-5 text-[#D5A60A]" />
        </div>
        <h3 className="font-medium text-gray-900">Endereço de Entrega</h3>
      </div>

      {/* Destinatário */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-start gap-2">
          <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 mb-1">Destinatário</p>
            <p className="text-sm font-medium text-gray-900">
              {address.recipientName}
            </p>
          </div>
        </div>
      </div>

      {/* Endereço completo */}
      <div className="space-y-1 mb-4">
        <p className="text-sm text-gray-900 font-medium">
          {address.street}, {address.number}
        </p>
        {address.complement && (
          <p className="text-sm text-gray-600">{address.complement}</p>
        )}
        <p className="text-sm text-gray-600">{address.neighborhood}</p>
        <p className="text-sm text-gray-600">
          {address.city}, {address.state}
        </p>
        <p className="text-sm text-gray-600">CEP: {address.zipCode}</p>
        <p className="text-sm font-medium text-gray-900 mt-2">
          {address.country}
        </p>
      </div>

      {/* Telefone (se disponível) */}
      {address.phone && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Telefone para contato</p>
              <p className="text-sm font-medium text-gray-900">
                {address.phone}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
