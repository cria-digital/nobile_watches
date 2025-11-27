import { GuestRoute } from "@/components/auth/GuestRoute";
import Image from "next/image";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <GuestRoute>
      <div className="min-h-screen relative flex flex-col lg:block bg-[#0A0A0A]">
        {/* Background mobile */}
        <div className="relative h-[calc(31vh+18px)] lg:hidden flex-shrink-0">
          <Image
            src="/images/auth/auth-bg-mobile.svg"
            alt="Vitrine Nobile com relógios de luxo"
            fill
            sizes="(max-width: 1024px) 100vw, 0vw"
            className="object-cover"
            priority={false}
            loading="eager"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMwQTBBMEEiLz48L3N2Zz4=" // ✅ Base64 do fundo escuro
          />

          {/* Header mobile */}
          <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 h-[64px]">
            <Link href="/" className="flex items-center">
              <Image src="/logo-white.svg" alt="Nobile" width={91} height={24} priority />
            </Link>
          </header>
        </div>

        {/* Background desktop */}
        <div className="absolute inset-0 hidden lg:block">
          <Image
            src="/images/auth/auth-bg.svg"
            alt="Vitrine Nobile com relógios de luxo"
            fill
            sizes="(min-width: 1024px) 100vw"
            className="object-cover"
            priority
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMwQTBBMEEiLz48L3N2Zz4="
            quality={85}
          />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Container do formulário */}
        <div className="flex-1 lg:absolute lg:inset-0 relative z-10 flex items-start lg:items-center justify-center lg:justify-end lg:px-15 xl:px-15 -mt-[18px] lg:mt-0">
          <div className="w-full lg:max-w-lg">
            <div className="scrollbar-subtle bg-white w-full lg:max-w-[596px] rounded-t-[24px] lg:rounded-2xl shadow-2xl px-6 pt-[30px] pb-10 lg:p-10.5 min-h-[69vh] lg:min-h-0 lg:max-h-[90vh] overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </GuestRoute>
  );
}
