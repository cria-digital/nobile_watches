"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const protectionFeatures = [
  {
    icon: "/icons/shipping-box.svg",
    title: "Entrega Segura",
  },
  {
    icon: "/icons/shield-check.svg",
    title: "Autenticidade Garantida",
  },
  {
    icon: "/icons/badge-check.svg",
    title: "Vendedor Certificado",
  },
  {
    icon: "/icons/credit-card.svg",
    title: "Pagamento Seguro",
  },
];

export function BuyerProtection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 lg:px-8 pt-6 pb-10 lg:pt-[140px] lg:pb-[160px]">
      <div className="max-w-full mx-auto px-5 lg:pr-18 lg:flex lg:items-center lg:justify-between relative">
        <div
          aria-hidden="true"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[81.57%] h-[620px] bg-gradient-to-b from-[#141414] to-[#000000] rounded-[198px_48px_48px_198px] isolate -z-10 hidden md:block"
        />

        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-full h-[367px] bg-gradient-to-b from-[#141414] to-[#000000] rounded-[164px_164px_8px_8px] -z-10 lg:hidden"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mt-10 lg:mt-0 lg:order-1 z-10"
        >
          <Image
            src="/images/hero/hero-rolex-box.png"
            alt="Luxury watch with protective box illustration"
            width={500}
            height={500}
            className="mx-auto w-[260px] lg:w-[500px] h-auto"
            priority
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          viewport={{ once: true }}
          className="lg:max-w-md z-10 lg:order-2 pb-7 lg:pb-0"
        >
          <p className="font-erstoria text-[#D5A60A] mt-4 mb-1 text-sm leading-relaxed">
            Seguro do comprador
          </p>

          <h2 className="text-white text-[28px] leading-tight lg:text-[50px] lg:leading-[56px]">
            Proteção completa em cada etapa da sua compra
          </h2>

          <div className="grid grid-cols-[auto_1fr] lg:grid-cols-2 gap-4 lg:gap-x-6 lg:gap-y-6 mt-[22px] lg:max-w-sm">
            {protectionFeatures.map(item => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                viewport={{ once: true }}
                className="flex items-center gap-2 max-w-fit"
              >
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={24}
                  height={24}
                  className="
    invert brightness-0 
    w-[20px] h-[20px]      /* mobile 20px */
    md:w-[24px] md:h-[24px]  /* desktop 24px */
    flex-shrink-0
  "
                />

                <p className="text-xs lg:text-base text-white font-light leading-[124%] text-nowrap">
                  {item.title}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
