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

  const hasImage = order?.watch?.image && order.watch?.image?.length > 0;

  return (
    <div className="bg-[#F7F7F7] rounded-[12px] p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4 h-[116px] mb-4">
        {/* Imagem do produto */}
        <div className="w-[116px] relative bg-[#EFEFEF] rounded-[5px] overflow-hidden">
          {hasImage ? (
            <Image
              src={order.watch.image}
              alt={`${order.watch.brand} ${order.watch.model}`}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 116px, (max-width: 1024px) 116px, 116px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-sm">Sem imagem</span>
            </div>
          )}
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
            <p className="text-sm text-gray-400 font-normal">
              {order.watch.condition}
            </p>
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
