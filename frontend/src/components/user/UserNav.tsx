import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function UserNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Minha coleção",
      href: "/account/collection",
      icon: "/icons/watch.svg",
    },
    {
      label: "Meus anúncios",
      href: "/account/listings",
      icon: "/icons/tag.svg",
    },
    {
      label: "Minhas compras",
      href: "/account/purchases",
      icon: "/icons/shopping-bag.svg",
    },
    {
      label: "Meu carrinho",
      href: "/account/cart",
      icon: "/icons/shopping-cart.svg",
    },
  ];

  return (
    <nav className="flex gap-6 overflow-x-auto pb-2 lg:pb-0">
      {navItems.map(item => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`h-[50px] flex items-center gap-3 pl-[14px] pr-5 border border-[#EFEFEF] rounded-[12px] text-xs font-medium whitespace-nowrap transition-colors ${
              isActive ? "bg-[#F7F7F7]" : "bg-[#F7F7F7] text-pb-500 hover:bg-gray-200"
            }`}
          >
            <Image src={item.icon} alt="Edit icon" width={26} height={26} />
            <span className="leading-[100%]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
