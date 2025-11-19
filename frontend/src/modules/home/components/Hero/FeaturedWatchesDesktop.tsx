"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import Slider from "react-slick";

const watches = [
  { name: "Nautilus", price: "R$ 76.094,00", image: "/images/mock/rolex-deepsea2.png" },
  { name: "Claratrava", price: "R$ 54.094,00", image: "/images/mock/claratrava.png" },
  { name: "Golden Ellipse", price: "R$ 71.450,00", image: "/images/mock/aquanaut.png" },
  {
    name: "Oyster Perpetual",
    price: "R$ 120.450,00",
    image: "/images/mock/rolex-oyster-perpetual.png",
  },
  { name: "GMT-Master II", price: "R$ 75.300,00", image: "/images/mock/GMT-Master.png" },
];

export default function FeaturedWatchesDesktop() {
  const [activeIndex, setActiveIndex] = useState(0);

  const settings = {
    infinite: false,
    dots: true,
    centerPadding: "0px",
    slidesToShow: 3, // Mostra 3 relógios visíveis
    slidesToScroll: 1, // Rola 1 relógio por vez (pode usar 3 se quiser por "página")
    speed: 600,
    arrows: false,
    beforeChange: (_: number, next: number) => setActiveIndex(next),
  };

  return (
    <section className="w-full min-h-screen overflow-hidden relative bg-pb-500 flex flex-col items-center justify-center py-20">
      <div className="h-1/10 flex items-center">
        <div className="flex items-center justify-center relative w-[363px] h-[41px] mx-auto">
          <Image
            src="/images/hero/destaques.svg"
            alt="Relógios em destaque"
            fill
            className="object-cover"
            sizes="363px"
          />
          <h2 className="font-lato text-xs lg:text-[26px] text-center text-[#D5A60A] font-bold uppercase">
            Relógios em destaque
          </h2>
        </div>
      </div>
      <div className="relative max-w-7xl overflow-visible">
        {/* Linha centralizada atrás dos relógios */}
        <div className="absolute top-[45%] -translate-y-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent z-0" />

        <Slider
          {...settings}
          className="custom-slick relative z-10 max-h-[clamp(300px,60vh,600px)]"
        >
          {watches.map((watch, index) => {
            const isCenter = index === activeIndex + 1;

            return (
              <div
                key={index}
                className={`px-6 transition-all duration-700 ease-in-out ${isCenter ? "scale-125 opacity-100" : ""}`}
              >
                <motion.div
                  className={`relative flex items-center justify-center transition-transform duration-500 ${
                    isCenter ? "opacity-100" : "opacity-80"
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <img
                    src={watch.image}
                    alt={watch.name}
                    className="object-contain mx-auto w-full max-w-[clamp(220px,35vw,420px)] aspect-[3/4]"
                  />
                </motion.div>

                <div
                  className={`mt-6 text-center transition-opacity duration-500 h-10 flex flex-col justify-center ${
                    isCenter ? "opacity-100 animate-fadeIn" : "opacity-0"
                  }`}
                >
                  <h3 className="text-[28px] font-light text-white tracking-[-1%] mb-2 text-nowrap">
                    {watch.name}
                  </h3>
                  <p className="text-[20px] text-white font-light tracking-tight leading-2 text-nowrap">
                    {watch.price}
                  </p>
                </div>
              </div>
            );
          })}
        </Slider>

        <style jsx global>{`
          .custom-slick .slick-list {
            overflow: visible !important;
          }

          .custom-slick .slick-slide {
            transition:
              transform 0.4s ease,
              opacity 0.4s ease;

            transform: scale(0.7);
          }

          .custom-slick .slick-center {
            transform: scale(1);
            opacity: 1;
            z-index: 10;
          }

          .custom-slick .slick-slide img {
            transition: transform 0.4s ease;
          }

          .custom-slick .slick-center img {
            transform: scale(1.05);
          }

          .custom-slick .slick-dots {
            position: relative;
            z-index: 50;
            bottom: 0px;
            display: flex !important;
            justify-content: center;
            gap: 8px;
          }

          .custom-slick .slick-dots li {
            width: 8px !important;
            height: 8px !important;
            margin: 0 !important;
          }

          .custom-slick .slick-dots li button {
            width: 8px !important;
            height: 8px !important;
            padding: 0 !important;
          }

          .custom-slick .slick-dots li button:before {
            font-size: 0 !important;
            width: 8px;
            height: 8px;
            content: "";
            display: block;
            border-radius: 9999px;
            background-color: #ffffff;
            opacity: 0.2;
            transition: background-color 0.2s ease;
          }

          .custom-slick .slick-dots li.slick-active button:before {
            background-color: #ffffff !important;
          }
        `}</style>
      </div>
    </section>
  );
}

function NextArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute right-0 bottom-[18%] z-20 w-[46px] h-[46px] rounded-full hover:scale-110 transition -translate-y-1/2"
    >
      <Image
        src="/icons/arrow-right-glow.png"
        alt="Próximo"
        width={46}
        height={46}
        className="w-full h-full"
      />
    </button>
  );
}

function PrevArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute left-0 bottom-[18%] z-20 w-[46px] h-[46px] rounded-full hover:scale-110 transition -translate-y-1/2"
    >
      <Image
        src="/icons/arrow-left-glow.png"
        alt="Anterior"
        width={46}
        height={46}
        className="w-full h-full"
      />
    </button>
  );
}
