import { stringToSlug } from "@/lib/utils/stringUtils";
import Image from "next/image";
import Link from "next/link";

export function BrandCard({
  href,
  name,
  image,
}: {
  href: string;
  name: string;
  image: string;
}) {
  const brandUrl = `/${stringToSlug(name)}`;

  return (
    <Link
      href={href}
      className="h-auto md:h-full flex flex-col items-center justify-between gap-2 group transition-all duration-300 hover:scale-105 flex-shrink-0"
    >
      <div className="w-12 h-12 md:w-22 md:h-22 bg-[#EFEFEF] rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
        <Image
          src={image}
          alt={`Logo ${name}`}
          width={32}
          height={32}
          className="w-8 h-8 md:w-10 md:h-10 object-contain filter grayscale group-hover:grayscale-0 transition-all"
        />
      </div>

      <p className="font-erstoria mt-2 text-xs md:text-sm text-[#0F0F0F] text-center font-medium group-hover:text-gray-900 transition-colors whitespace-nowrap">
        {name}
      </p>
    </Link>
  );
}
