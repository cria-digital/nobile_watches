"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export function BecomeSeller() {
  return (
    <section
      aria-label="Torne-se um vendedor"
      className="mx-auto w-full max-w-7xl px-5 lg:px-8 mt-8 mb-6 lg:mb-[130px]"
    >
      <div className="grid lg:grid-cols-2 lg:gap-12 lg:items-center lg:min-h-[500px]">
        {/* Text Content - Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="flex flex-col justify-center"
        >
          <h2 className="text-4xl lg:text-5xl xl:text-6xl mb-4 lg:mb-6 text-[#141414] leading-[1.1]">
            Torne-se
            <br />
            um <span className="text-[#D5A60A]">vendedor</span>
          </h2>

          <p className="text-base text-[#777777] leading-[1.6] mb-8 lg:mb-10 max-w-[400px]">
            Oferecemos uma plataforma segura, elegante e com visibilidade
            internacional para que você possa vender suas peças com confiança.
          </p>

          <Link
            href="/become-a-seller"
            className="inline-flex items-center justify-center gap-2 w-fit px-8 h-[56px] ml-auto lg:ml-0 bg-[#141414] hover:bg-[#C09609] rounded-full transition-all duration-300 group"
          >
            <span className="text-white leading-[150%] font-lato font-bold text-base">
              Saiba mais
            </span>

            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            >
              <path
                d="M7 17L17 7M17 7H7M17 7V17"
                stroke="#D5A60A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </motion.div>

        {/* Image - Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
          className="relative w-full h-[400px] lg:h-[600px]"
        >
          <Image
            src="/images/hero/watch-collection-box-hero.png"
            alt="Caixa de coleção de relógios de luxo"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain object-center"
            priority={false}
            quality={90}
          />
        </motion.div>
      </div>
    </section>
  );
}
