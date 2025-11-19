import { GuestRoute } from "@/components/auth/GuestRoute";
import Image from "next/image";
import Link from "next/link";

interface RegisterLayoutProps {
  children: React.ReactNode;
}

export default function RegisterLayout({ children }: RegisterLayoutProps) {
  return (
    <GuestRoute>
      <div className="min-h-screen relative flex flex-col lg:block lg:bg-[#0A0A0A]">
        {/* Background mobile */}
        <div className="relative h-[calc(28vh+18px)] lg:hidden flex-shrink-0">
          <Image
            src="/images/auth/register-bg-mobile.svg"
            alt="Crie sua conta na Nobile"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 0vw"
            priority
          />

          {/* Header mobile com logo */}
          <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 h-[64px]">
            <Link href="/" className="flex items-center">
              <Image src="/logo.svg" alt="Nobile" width={91} height={24} priority />
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
          />

          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Container do formulário */}
        <div className="flex-1 lg:absolute lg:inset-0 relative z-10 flex items-start lg:items-center justify-center lg:justify-end lg:px-15 xl:px-15 -mt-[18px] lg:mt-0">
          <div className="w-full lg:max-w-lg">
            <div className="scrollbar-subtle bg-white w-full lg:max-w-[596px] rounded-t-[32px] lg:rounded-2xl shadow-2xl px-5 pt-[28px] pb-10 lg:p-10.5 min-h-[calc(70vh+18px)] lg:min-h-0 lg:max-h-[90vh] overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </GuestRoute>
  );
}
