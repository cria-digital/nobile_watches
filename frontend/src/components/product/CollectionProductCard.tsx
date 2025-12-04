// components/ProductCard.tsx
import { Product } from "@/types/product";
import Image from "next/image";

interface CollectionProductCardProps {
  product: Product;
  onAdd?: () => void;
}

export function CollectionProductCard({ product, onAdd }: CollectionProductCardProps) {
  const hasImage = product?.images && product.images.length > 0 && product.images[0];

  return (
    <div className="bg-[#F7F7F7] rounded-lg p-4 lg:p-8 lg:h-[458px]">
      <div className="flex gap-4 lg:gap-8 h-[178px] lg:h-[302px]">
        {/* Imagem do produto */}
        <div className="relative flex-1 flex-shrink-0 rounded-[13.62px] overflow-hidden">
          {hasImage ? (
            <Image // @ts-ignore
              src={product.images[0]}
              alt={`${product.brand} ${product.model}`}
              fill
              className="object-cover"
              sizes="
                      (max-width: 640px) 116px,
                      (max-width: 1024px) 250px,
                      116px
                    "
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-sm">Sem imagem</span>
            </div>
          )}
        </div>

        {/* Informações do produto */}
        <div className="flex-1 min-w-0 py-2.5 lg:py-8">
          {/* Marca */}
          <div className="mb-2 lg:mb-5">
            <p className="text-sm tracking-[-0.01em] mb-2">{product.brand}</p>
            <div className="lg:h-[88px]">
              <h3 className="text-[18px] lg:text-[22px] truncate tracking-[-0.01em] mb-1">
                {product.model}
              </h3>
              <p className="text-sm font-light">{product?.referenceNumber}</p>
            </div>
          </div>

          {/* Especificações */}
          <div className="space-y-2 lg:space-y-4">
            <div className="flex justify-between items-center text-gray-400">
              <span className="font-lato text-sm">Caixa:</span>
              <span className="font-lato text-sm">{product.caseMaterial || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span className="font-lato text-sm">Mostrador:</span>
              <span className="font-lato text-sm">{product.dialColor || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span className="font-lato text-sm">Estado:</span>
              <span className="font-lato text-sm">{product.condition || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Botão Adicionar a coleção */}
      <button className="w-full h-[56px] mt-5 lg:mt-8 py-3 border-1 border-[#141414] rounded-full font-lato font-bold text-[#141414] hover:bg-[#141414] hover:text-white transition-colors duration-200">
        Adicionar a coleção
      </button>
    </div>
  );
}
