"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const fadeSection = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
  },
};

const bgFadeScale = {
  hidden: { opacity: 0, scale: 1.03 },
  visible: {
    opacity: 1,
    scale: 1,
  },
};

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
    <motion.section
      variants={fadeSection}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8 lg:py-26"
    >
      <div className="relative w-full max-h-[660px] overflow-hidden">
        <motion.div
          variants={bgFadeScale}
          initial="hidden"
          whileInView="visible"
          transition={{
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <Image
            src="/images/hero/watch-box-bg-desktop.png"
            alt="Luxury watch with protective box illustration"
            width={1200}
            height={660}
            priority
            // AQUI: Adicione as classes w-full e h-auto para garantir que a altura seja automática
            // quando a imagem se ajustar à largura total.
            className="hidden lg:block w-full h-auto"
          />
        </motion.div>

        <motion.div
          variants={bgFadeScale}
          initial="hidden"
          whileInView="visible"
          transition={{
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <Image
            src="/images/hero/watch-box-bg-mobile.png"
            alt="Luxury watch with protective box illustration"
            width={387}
            height={522}
            priority
            className="block lg:hidden"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          viewport={{ once: true }}
          className="lg:w-md max-w-lg px-6 lg:px-0 absolute z-100 bottom-7 lg:left-1/2 lg:top-1/2 lg:-translate-y-1/2"
        >
          <p className="font-erstoria text-[#D5A60A] mb-1 text-sm leading-relaxed">
            Seguro do comprador
          </p>

          <h2 className="text-white text-[24px] lg:text-[42px] xl:text-[52px] leading-tight lg:leading-[42px] xl:leading-[56px] tracking-normal">
            Proteção completa em cada etapa da sua compra
          </h2>

          <div className="grid grid-cols-[auto_1fr] lg:grid-cols-2 gap-4 lg:gap-x-6 lg:gap-y-6 mt-[18px] lg:mt-[20px] lg:max-w-sm">
            {protectionFeatures.map((item) => (
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

                <p className="text-xs lg:text-base text-white font-light leading-[124%] tracking-normal text-nowrap">
                  {item.title}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
