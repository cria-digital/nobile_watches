"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface Seller {
  name: string;
  logo: string;
  description: string;
  bgColor: string;
}

const sellers: Seller[] = [
  {
    name: "Cordial Watches",
    logo: "/images/seller/vend1.svg",
    description: "Cordial Watches",
    bgColor: "bg-[#141414]",
  },
  {
    name: "TMG Time gateways",
    logo: "/images/seller/vend2.svg",
    description: "Time gateways",
    bgColor: "bg-[#6B2C2C]",
  },
  {
    name: "Fist Wear.TM",
    logo: "/images/seller/vend3.svg",
    description: "Fist wear",
    bgColor: "bg-[#2C4A3A]",
  },
  {
    name: "Linksor Joias",
    logo: "/images/seller/vend4.svg",
    description: "Linksor joias",
    bgColor: "bg-[#1A2638]",
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0 },
};

export function SellerSpotlight() {
  return (
    <section
      aria-label="Featured Sellers"
      className="mx-auto w-full max-w-7xl px-5 lg:px-8 py-12 lg:py-[150px]"
    >
      <motion.h2
        className="font-erstoria text-[28px] md:text-[48px] text-[#141414] mb-5 md:mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        Vendedores destaque
      </motion.h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {sellers.map((seller, index) => (
          <motion.div
            key={index}
            className="flex flex-col"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            transition={{
              duration: 0.4,
              ease: "easeOut",
              delay: index * 0.08, // leve stagger
            }}
            viewport={{ once: true, margin: "-20% 0px" }}
          >
            <div
              className={`group ${seller.bgColor} rounded-[6px] md:rounded-[14px] p-4 md:p-6 text-center hover:opacity-90 transition-opacity relative overflow-hidden min-h-[58px] md:min-h-[126px] max-h-[58px] md:max-h-[126px] flex items-center justify-center mb-2 md:mb-4`}
            >
              <div className="absolute top-2 right-2 md:top-2.5 md:right-2.5 w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                <Image
                  src="/icons/verified-badge.svg"
                  alt="Verified"
                  width={16}
                  height={16}
                  className="md:w-[20px] md:h-[20px]"
                />
              </div>

              <Image
                src={seller.logo}
                alt={seller.name}
                width={100}
                height={50}
                className="md:w-[120px] md:h-[60px] object-contain max-h-[50px] md:max-h-[60px]"
              />
            </div>

            <p className="font-erstoria text-[14px] md:text-[20px] text-[#000000]">
              {seller.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
