import { GuestRoute } from "@/components/auth/GuestRoute";
import Image from "next/image";
import Link from "next/link";

interface AuthRecoveryLayoutProps {
  children: React.ReactNode;
}

export default function AuthRecoveryLayout({
  children,
}: AuthRecoveryLayoutProps) {
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
            loading="lazy"
            placeholder="empty"
          />

          {/* Header mobile */}
          <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 h-[64px]">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-white.svg"
                alt="Nobile"
                width={91}
                height={24}
                priority={false}
              />
            </Link>
          </header>
        </div>

        {/* Background desktop - fixed position que cobre toda a viewport */}
        <div className="fixed inset-0 hidden lg:block pointer-events-none">
          <Image
            src="/images/auth/recovery-bg.svg"
            alt="Vitrine Nobile com relógios de luxo"
            fill
            sizes="(min-width: 1024px) 100vw"
            className="object-cover"
            priority={false}
            loading="lazy"
            placeholder="empty"
            quality={75}
          />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Container do formulário desktop */}
        <div className="hidden lg:flex min-h-screen justify-center p-15">
          <div className="bg-white w-xl max-w-xl h-[-webkit-fill-available] overflow-hidden rounded-3xl relative flex flex-col my-auto">
            <div className="hidden lg:flex h-22 flex-shrink-0 px-12 items-center bg-[#EFEFEF]">
              <Image
                src="/logo-recovery.svg"
                alt="Nobile"
                width={120}
                height={28}
              />
            </div>
            <div className="flex-2 py-8 px-12">{children}</div>
          </div>
        </div>

        {/* Container do formulário mobile */}
        <div className="relative z-10 flex-1 flex flex-col lg:hidden bg-white max-w-full rounded-t-3xl py-[30px] px-5 -mt-[18px]">
          {children}
        </div>
      </div>
    </GuestRoute>
  );
}
