import { mockBrands } from "@/lib/data/mockBrands";
import { stringToSlug } from "@/lib/utils/stringUtils";
import Image from "next/image";
import Link from "next/link";

export function BrandCard({ name }: { name: string }) {
  const brandUrl = `/${stringToSlug(name)}`;

  // Busca por match parcial: verifica se o nome contém alguma marca conhecida
  const brandMatch = mockBrands.find((brand) =>
    name.toLowerCase().includes(brand.nome.toLowerCase())
  );

  const hasLogo = Boolean(brandMatch?.img && brandMatch.img.trim() !== "");
  const logoSrc = hasLogo ? brandMatch!.img : "";

  return (
    <Link
      href={brandUrl}
      className="flex flex-col items-center justify-between gap-2 group transition-all duration-300 hover:scale-105 flex-shrink-0 basis-[86px] max-w-[86px] max-h-[116px]"
    >
      {hasLogo ? (
        <div className="w-16 h-16 lg:w-22 lg:h-22 bg-[#EFEFEF] rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
          <Image
            src={logoSrc}
            alt={`Logo ${name}`}
            width={32}
            height={32}
            className="w-8 h-8 lg:w-10 lg:h-10 object-contain filter grayscale group-hover:grayscale-0 transition-all"
          />
        </div>
      ) : (
        <div className="w-16 h-16 lg:w-22 lg:h-22 bg-[#EFEFEF] rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
          <span className="font-erstoria text-sm lg:text-2xl font-semibold text-pb-500 group-hover:text-gray-900 transition-colors">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <p
        className="
    font-erstoria mt-2 text-xs md:text-sm text-[#0F0F0F] font-medium text-center
    group-hover:text-gray-900 transition-colors
    block w-full max-w-full truncate leading-tight
  "
      >
        {name}
      </p>
    </Link>
  );
}
