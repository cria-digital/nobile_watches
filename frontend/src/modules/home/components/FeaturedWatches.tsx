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

export function FeaturedWatches() {
  const [activeIndex, setActiveIndex] = useState(0);

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
      <div className="relative h-[538px] mx-auto flex lg:hidden slimob"></div>
    </section>
  );
}
