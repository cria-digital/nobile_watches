"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface StepItem {
  icon: string;
  title: string;
  description: string;
}

const steps: StepItem[] = [
  {
    icon: "/images/hero/how-it-works1.svg",
    title: "Você escolhe o seu relógio",
    description: "Explore nossa coleção e encontre o relógio perfeito para você.",
  },
  {
    icon: "/images/hero/how-it-works2.svg",
    title: "Realiza o pagamento",
    description: "Finalize sua compra com segurança e diversas opções de pagamento.",
  },
  {
    icon: "/images/hero/how-it-works3.svg",
    title: "Vendedor envia o relógio",
    description: "O vendedor despacha seu relógio com cuidado e segurança.",
  },
  {
    icon: "/images/hero/how-it-works4.svg",
    title: "Certificamos a autenticidade",
    description:
      "Nosso time de especialistas verifica cada detalhe para garantir a originalidade.",
  },
  {
    icon: "/images/hero/how-it-works5.svg",
    title: "Seu relógio é entregue",
    description: "Receba seu relógio com toda a segurança e proteção que você merece.",
  },
  {
    icon: "/images/hero/how-it-works6.svg",
    title: "Vendedor recebe o valor",
    description: "O pagamento é liberado ao vendedor após a confirmação da entrega.",
  },
];

// Animation variants (clean + subtle)
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

export function HowItWorks() {
  return (
    <section
      aria-label="Como funciona"
      className="mx-auto w-full max-w-7xl px-5 lg:px-8 py-12 lg:py-[124px]"
    >
      {/* HEADER */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={fadeUp}
        className="text-center mb-12 md:mb-[64px] flex flex-col items-center px-4"
      >
        <p className="font-erstoria text-base md:text-[20px] text-[#D5A60A] mb-3 md:mb-4">
          Como funciona
        </p>

        <h2 className="font-erstoria text-center text-2xl md:text-3xl lg:text-5xl max-w-[707px]">
          Entregamos com segurança e garantia de qualidade
        </h2>
      </motion.div>

      {/* STEPS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[48px]">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="text-center lg:max-w-[270px] mx-auto"
          >
            <div className="w-26 h-26 md:w-26 md:h-26 mx-auto mb-3 md:mb-4 flex items-center justify-center">
              <Image
                src={step.icon}
                alt={step.title}
                width={80}
                height={80}
                className="w-26 h-26 md:w-26 md:h-26 object-contain"
              />
            </div>

            <h3 className="font-erstoria text-lg mb-2">{step.title}</h3>

            <p className="font-lato text-gray-400 text-sm leading-relaxed">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
