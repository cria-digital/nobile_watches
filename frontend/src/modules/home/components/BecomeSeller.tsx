"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export function BecomeSeller() {
  return (
    <section
      aria-label="Become a seller"
      className="mx-auto w-full max-w-7xl px-5 lg:px-8 mb-12 lg:mb-[130px] overflow-hidden relative"
    >
      {/* MOBILE */}
      <div className="lg:hidden">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative h-[439px] max-h-[439px] p-[20px]"
        >
          <h2 className="relative z-20 font-erstoria text-[32px] text-white">
            Torne-se
            <br />
            um <span className="text-[#D5A60A]">vendedor</span>
          </h2>

          <Link
            href="/become-a-seller"
            className="absolute right-[20px] bottom-[20px] z-20 px-[17px] flex items-center justify-center gap-[6px] bg-[#141414] hover:bg-[#C09609] text-white font-lato font-normal rounded-full transition-colors text-[12px] w-[119px] h-[40px]"
          >
            Saiba mais
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="#D5A60A"
              strokeWidth="2"
              className="w-4 h-4"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </Link>

          <Image
            src="/images/hero/become-seller-mobile.svg"
            alt="Become a seller"
            fill
            priority
            className="object-cover max-h-[439px] rounded-[8px]"
            sizes="(max-width: 1024px) 100vw, 0px"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
          className="text-gray-400 mt-[14px] leading-[140%]"
        >
          Oferecemos uma plataforma segura, elegante e com visibilidade
          internacional para que você possa vender suas peças com confiança.
        </motion.p>
      </div>

      {/* DESKTOP */}
      <div className="relative hidden lg:flex min-h-[640px] max-h-[688px] p-[56px]">
        <Image
          src="/images/hero/become-seller.svg"
          alt="Become a seller"
          fill
          priority
          className="object-cover rounded-[16px]"
          sizes="(max-width: 1024px) 0px, 100vw"
        />

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative z-10 max-w-[374px] ml-auto mt-auto"
        >
          <div className="mb-8">
            <h2 className="font-erstoria text-2xl md:text-3xl lg:text-5xl mb-3 md:mb-4 text-white lg:text-[#141414]">
              Torne-se
              <br />
              um <span className="text-[#D5A60A]">vendedor</span>
            </h2>

            <p className="font-lato text-sm md:text-base text-[#777777] leading-[140%] hidden lg:block">
              Oferecemos uma plataforma segura, elegante e com visibilidade
              internacional para que você possa vender suas peças com confiança.
            </p>
          </div>

          <Link
            href="/become-a-seller"
            className="w-[200px] h-[56px] flex items-center justify-center gap-2 bg-[#141414] hover:bg-[#C09609] rounded-full transition-colors text-base"
          >
            <span className="text-white leading-[150%] font-lato font-bold">
              Saiba mais
            </span>

            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D5A60A"
              strokeWidth="2"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
