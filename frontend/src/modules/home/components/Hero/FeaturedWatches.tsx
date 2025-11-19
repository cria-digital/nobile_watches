"use client";

import Image from "next/image";
import { useRef, useState } from "react";
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

export default function FeaturedWatches() {
  const [activeIndex, setActiveIndex] = useState(0);

  const sliderMobileRef = useRef<Slider>(null);

  const settingsMobile = {
    centerMode: true,
    infinite: true,
    slidesToShow: 1,
    centerPadding: "20%",
    arrows: false,
    dots: true,
    speed: 500,
    beforeChange: (_: number, next: number) => setActiveIndex(next),
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerPadding: "20%",
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          centerPadding: "15%",
        },
      },
    ],
  };

  return (
    <section className="w-full bg-[#141414] py-12 lg:py-16 relative overflow-hidden lg:min-h-screen lg:flex flex-col justify-center">
      <div className="flex items-center justify-center relative w-[182px] h-[21px] mx-auto mb-8">
        <Image
          src="/images/hero/destaques.svg"
          alt="Relógios em destaque"
          fill
          className="object-cover"
          sizes="182px"
        />
        <h2 className="font-lato text-xs lg:text-[26px] text-center text-[#D5A60A] font-bold uppercase">
          Relógios em destaque
        </h2>
      </div>

      {/* Slider Container - Mobile  */}
      <div className="relative h-[538px] mx-auto flex lg:hidden slimob">
        <Slider
          ref={sliderMobileRef}
          {...settingsMobile}
          className="w-full mobile-featured-slider"
        >
          {watches.map((watch, index) => {
            const isCenter = index === activeIndex;

            return (
              <div key={watch.name} className="px-2">
                <div className="relative h-[398px] flex items-center justify-center">
                  {/* Container do relógio com transição */}
                  <div
                    className={`relative transition-all duration-500 ease-in-out flex items-center justify-center ${
                      isCenter
                        ? "w-full h-[398px] opacity-100 scale-100"
                        : "w-full h-[263px] opacity-40 scale-75"
                    }`}
                  >
                    {/* Círculo brilhante atrás do relógio central - mobile */}
                    {isCenter && (
                      <div className="absolute inset-0 flex items-center justify-center -z-10">
                        <div className="relative w-[250px] h-[250px]">
                          <div className="absolute inset-0 rounded-full bg-gradient-radial from-white/20 via-white/5 to-transparent blur-2xl" />
                          <div className="absolute inset-8 rounded-full bg-gradient-radial from-white/10 via-transparent to-transparent" />
                        </div>
                      </div>
                    )}

                    {/* Imagem do relógio */}
                    <div
                      className={`relative ${isCenter ? "w-full h-full" : "w-[80%] h-full"}`}
                    >
                      <Image
                        src={watch.image}
                        alt={watch.name}
                        fill
                        className="object-contain drop-shadow-2xl"
                        sizes="90vw"
                        priority={isCenter}
                      />
                    </div>
                  </div>
                </div>

                {/* Nome e preço - sempre reserva espaço, mas só visível no centro */}
                <div
                  className={`mt-4 md:mt-6 text-center transition-opacity duration-500 h-20 lg:h-40 flex flex-col justify-center ${
                    isCenter ? "opacity-100 animate-fadeIn" : "opacity-0"
                  }`}
                >
                  <h3 className="text-xl md:text-2xl lg:text-[32px] font-light text-white tracking-[-1%] mb-1 text-nowrap">
                    {watch.name}
                  </h3>
                  <p className="text-base md:text-lg lg:text-[24px] text-white font-light tracking-tight leading-2 text-nowrap">
                    {watch.price}
                  </p>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>

      {/* CSS adicional para o slider */}
      <style jsx global>{`
        .slimob .slick-dots {
          bottom: -30px;
          display: flex !important;
          justify-content: center;
          gap: 4px;
        }

        .slimob .slick-dots li {
          width: 4px !important;
          height: 4px !important;
          margin: 0 !important;
        }

        .slimob .slick-dots li button {
          width: 4px !important;
          height: 4px !important;
          padding: 0 !important;
        }

        .slimob .slick-dots li button:before {
          font-size: 0 !important;
          width: 4px;
          height: 4px;
          content: "";
          display: block;
          border-radius: 9999px;
          background-color: #ffffff;
          opacity: 0.2;
          transition: background-color 0.2s ease;
        }

        .slimob .slick-dots li.slick-active button:before {
          background-color: #ffffff;
        }
      `}</style>
    </section>
  );
}
