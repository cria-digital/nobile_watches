import { OrderListItem } from "@/types/order";
import Image from "next/image";
import Link from "next/link";

interface OrderCardProps {
  order: OrderListItem;
  showTrackButton?: boolean;
}

export function OrderCard({ order, showTrackButton = true }: OrderCardProps) {
  const statusButton = {
    pendente: "Ver detalhes",
    pago: "Ver detalhes",
    em_preparacao: "Ver detalhes",
    enviado: "Acompanhar pedido",
    em_transito: "Acompanhar pedido",
    entregue: "Ver detalhes",
    cancelado: "Ver detalhes",
  };

  // const statusLabels = {
  //   pendente: "Pendente",
  //   pago: "Pago",
  //   em_preparacao: "Em preparação",
  //   enviado: "Enviado",
  //   em_transito: "Em trânsito",
  //   entregue: "Entregue",
  //   cancelado: "Cancelado",
  // };

  // const statusColors = {
  //   pendente: "text-yellow-600 bg-yellow-50",
  //   pago: "text-green-600 bg-green-50",
  //   em_preparacao: "text-blue-600 bg-blue-50",
  //   enviado: "text-purple-600 bg-purple-50",
  //   em_transito: "text-purple-600 bg-purple-50",
  //   entregue: "text-green-700 bg-green-100",
  //   cancelado: "text-red-600 bg-red-50",
  // };

  return (
    <div className="bg-[#F7F7F7] rounded-[12px] p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4 h-[116px] mb-4">
        {/* Imagem do produto */}
        <div className="w-[116px] relative bg-[#EFEFEF] rounded-[5px] overflow-hidden">
          <Image
            src={order.watch.image}
            alt={`${order.watch.brand} ${order.watch.model}`}
            fill
            className="object-contain"
          />
        </div>

        {/* Informações do pedido */}
        <div className="flex-1 py-2.5 min-w-0">
          {/* Vendedor */}
          <div className="h-4 flex items-center gap-1.5 mb-3">
            {order.seller.isVerified && (
              <div className="w-[16px] h-[16px]">
                <Image
                  src="/icons/verified-badge.svg"
                  alt="Verificado"
                  width={16}
                  height={16}
                  className="w-full h-full"
                />
              </div>
            )}

            <span className="font-erstoria text-sm text-[#D5A60A] leading-[140%] tracking-[-1%]">
              {order.seller.name}
            </span>
          </div>

          {/* Modelo do relógio */}
          <div className="min-w-0">
            <h3 className="text-[18px] leading-[140%] tracking-[-1%] truncate">
              {order.watch.brand} {order.watch.model}
            </h3>
            <p className="text-sm text-gray-400 font-normal">{order.watch.condition}</p>
          </div>

          {/* Preço */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Total:</p>
            <p className="text-[18px] font-medium">
              R$ {order.total.toLocaleString("pt-BR")}
            </p>
          </div>

          {/* Status */}
          {/* <div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[order.status]
              }`}
            >
              {statusLabels[order.status]}
            </span>
          </div> */}
        </div>
      </div>

      {/* Ações */}
      {showTrackButton && (
        <Link
          href={`/account/purchases/${order.id}`}
          className="w-full h-[52px] flex items-center justify-center rounded-full border-2 border-pb-500 text-pb-500 text-base font-bold tracking-[2%] hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          {statusButton[order.status]}
        </Link>
      )}
    </div>
  );
}
