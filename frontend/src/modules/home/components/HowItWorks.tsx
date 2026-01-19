"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface StepItem {
  number: string;
  title: string;
  description: string;
}

const steps: StepItem[] = [
  {
    number: "1",
    title: "Você escolhe o seu relógio",
    description:
      "Explore nossa coleção e encontre o relógio perfeito para você.",
  },
  {
    number: "2",
    title: "Realiza o pagamento",
    description:
      "Finalize sua compra com segurança e diversas opções de pagamento.",
  },
  {
    number: "3",
    title: "Vendedor envia o relógio",
    description: "O vendedor despacha seu relógio com cuidado e segurança.",
  },
  {
    number: "4",
    title: "Certificamos a autenticidade",
    description:
      "Nosso time de especialistas verifica cada detalhe para garantir a originalidade.",
  },
  {
    number: "5",
    title: "Seu relógio é entregue",
    description:
      "Receba seu relógio com toda a segurança e proteção que você merece.",
  },
  {
    number: "6",
    title: "Vendedor recebe o valor",
    description:
      "O pagamento é liberado ao vendedor após a confirmação da entrega.",
  },
];

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
};

export function HowItWorks() {
  return (
    <section
      aria-label="Como funciona"
      className="mx-auto w-full max-w-7xl px-5 lg:px-8 pt-12 lg:py-[124px]"
    >
      {/* HEADER */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={fadeUp}
        className="text-center mb-20 flex flex-col items-center px-4"
      >
        <p className="font-erstoria text-sm md:text-[20px] leading-[20px] lg:leading-[28px] text-[#D5A60A] mb-2 lg:mb-3">
          Como funciona
        </p>

        <h2 className="text-center text-[28px] md:text-3xl lg:text-[58px] leading-[35px] lg:leading-[58px] max-w-[707px]">
          Entregamos com segurança e garantia de qualidade
        </h2>
      </motion.div>

      {/* MOBILE & TABLET VIEW - All cards stacked with centered background */}
      <div className="lg:hidden relative">
        <div className="relative" style={{ paddingTop: "56px" }}>
          <div className="relative rounded-t-2xl" style={{ height: "1174px" }}>
            <div
              className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none rounded-t-2xl overflow-hidden"
              style={{ width: "100vw", height: "1174px" }}
            >
              <Image
                src="/images/hero/how-it-works-bg.svg"
                alt=""
                width={500}
                height={1174}
                sizes="(max-width: 1024px) 500px, 0px"
                className="w-full h-full object-cover"
                priority={false}
                aria-hidden="true"
              />
            </div>

            {/* All Cards Container - starts 56px above background */}
            <div
              className="relative z-10 flex flex-col"
              style={{ marginTop: "-56px" }}
            >
              {/* Top 3 Cards */}
              <div className="space-y-4" style={{ marginTop: "-56px" }}>
                {steps.slice(0, 3).map((step, index) => (
                  <motion.div
                    key={step.number}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-sm max-w-[92%] mx-auto flex items-start gap-5"
                    style={{ height: "112px" }}
                  >
                    <div className="relative flex items-center justify-center w-[38px] h-full">
                      <div className="absolute mt-2 z-1 font-erstoria text-6xl leading-none">
                        {step.number}
                      </div>
                      <div className="absolute w-[38px] h-[38px] bg-[#F8F2DC] rounded-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg leading-[25px] mb-1">
                        {step.title}
                      </h3>

                      <p className="text-[#777777] text-sm leading-[20px]">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 420px Gap - where watch is visible */}
              <div style={{ height: "420px" }} />

              {/* Bottom 3 Cards */}
              <div className="space-y-4">
                {steps.slice(3, 6).map((step, index) => (
                  <motion.div
                    key={step.number}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    transition={{ delay: (index + 3) * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-sm max-w-[92%] mx-auto flex items-start gap-5"
                    style={{ height: "112px" }}
                  >
                    <div className="relative flex items-center justify-center w-[38px] h-full">
                      <div className="absolute mt-2 z-1 font-erstoria text-6xl leading-none">
                        {step.number}
                      </div>
                      <div className="absolute w-[38px] h-[38px] bg-[#F8F2DC] rounded-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg leading-[25px] mb-1">
                        {step.title}
                      </h3>

                      <p className="font-lato text-[#777777] text-sm leading-[20px]">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP VIEW - Circular Layout with Background Image */}
      <div className="hidden lg:block relative">
        {/* Container with proper height to accommodate everything */}
        <div className="relative w-full mx-auto" style={{ height: "897px" }}>
          {/* Background Image - Centered with exact dimensions from design */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeInScale}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: "1000px", height: "897px" }}
          >
            <Image
              src="/images/hero/how-it-works-bg.svg"
              alt="Watch illustration"
              fill
              sizes="1000px"
              className="object-contain"
              priority={false}
            />
          </motion.div>

          {/* Left Column - Steps 1, 2, 3 */}
          <div
            className="absolute top-1/2 -translate-y-1/2 flex flex-col justify-center gap-8"
            style={{ left: "calc(50% - 672px)" }}
          >
            {steps.slice(0, 3).map((step, index) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.15 }}
                className="bg-white rounded-xl p-5 shadow-lg relative z-10 text-center"
                style={{ width: "344px", height: "190px" }}
              >
                <div className="relative flex items-center justify-center w-[48px] h-[48px] mx-auto mb-5">
                  <div className="absolute mt-2 z-1 font-erstoria text-7xl leading-none">
                    {step.number}
                  </div>
                  <div className="absolute w-[48px] h-[48px] bg-[#F8F2DC] rounded-full" />
                </div>

                <h3 className="font-erstoria text-[22px] mb-1.5 text-[#141414] leading-tight">
                  {step.title}
                </h3>

                <p className="font-lato text-[#777777] text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Right Column - Steps 4, 5, 6 */}
          <div
            className="absolute top-1/2 -translate-y-1/2 flex flex-col justify-center gap-8"
            style={{ right: "calc(50% - 672px)" }}
          >
            {steps.slice(3, 6).map((step, index) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: 0.65 + index * 0.15 }}
                className="bg-white rounded-xl p-5 shadow-lg relative z-10 text-center"
                style={{ width: "344px", height: "190px" }}
              >
                <div className="relative flex items-center justify-center w-[48px] h-[48px] mx-auto mb-5">
                  <div className="absolute mt-2 z-1 font-erstoria text-7xl leading-none">
                    {step.number}
                  </div>
                  <div className="absolute w-[48px] h-[48px] bg-[#F8F2DC] rounded-full" />
                </div>

                <h3 className="font-erstoria text-[22px] mb-1.5 text-[#141414] leading-tight">
                  {step.title}
                </h3>

                <p className="font-lato text-[#777777] text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
