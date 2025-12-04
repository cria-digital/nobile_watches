"use client";
import Image from "next/image";
import { useState } from "react";

const watches = [
  {
    name: "Nautilus",
    price: "R$ 76.094,00",
    image: "/images/mock/rolex-deepsea2.png",
  },
  {
    name: "Claratrava",
    price: "R$ 54.094,00",
    image: "/images/mock/claratrava.png",
  },
  {
    name: "Golden Ellipse",
    price: "R$ 71.450,00",
    image: "/images/mock/aquanaut.png",
  },
  {
    name: "Oyster Perpetual",
    price: "R$ 120.450,00",
    image: "/images/mock/rolex-oyster-perpetual.png",
  },
  {
    name: "GMT-Master II",
    price: "R$ 75.300,00",
    image: "/images/mock/GMT-Master.png",
  },
];

export function FeaturedWatchesDesktop() {
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
