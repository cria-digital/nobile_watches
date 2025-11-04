"use client";

import { ProductCard } from "@/components/products";
import { mockProducts } from "@/lib/data/mockProducts";
import { Product } from "@/types/mock";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Slider from "react-slick";
import FeaturedWatches from "./FeaturedWatches";

export function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/produtos?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const bannerSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    autoplay: true,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    cssEase: "cubic-bezier(0.4, 0, 0.2, 1)",
    dotsClass: "slick-dots banner-dots",
  } as const;

  const initialProducts = [
    { img: "/images/hero/banner1.svg", nome: "Rolex Deepsea", href: "/rolex/deepsea-12" },
    {
      img: "/images/hero/banner2.svg",
      nome: "Rolex Oyster-Perpetual",
      href: "/rolex/oyster-perpetual-9",
    },
    {
      img: "/images/hero/banner3.svg",
      nome: "Patek Philippe",
      href: "/patek-philippe/nautilus-14",
    },
    {
      img: "/images/hero/banner4.svg",
      nome: "Breitling Superocean Heritage",
      href: "/breitling/superocean-heritage-15",
    },
  ];

  const marcas = [
    { img: "/images/brand/marca1.svg", nome: "Rolex", href: "/rolex" },
    { img: "/images/brand/marca2.svg", nome: "Tag Heuer", href: "/tag-heuer" },
    { img: "/images/brand/marca3.svg", nome: "Breitling", href: "/breitling" },
    {
      img: "/images/brand/marca4.svg",
      nome: "Audemars Piguet",
      href: "/audemars-piguet",
    },
    {
      img: "/images/brand/marca5.svg",
      nome: "Patek Philippe",
      href: "/patek-philippe",
    },
    { img: "/images/brand/marca6.svg", nome: "Hublot", href: "/hublot" },
    { img: "/images/brand/marca7.svg", nome: "Cartier", href: "/cartier" },
    { img: "/images/brand/marca8.svg", nome: "Seiko", href: "/seiko" },
    { img: "/images/brand/marca9.svg", nome: "Omega", href: "/omega" },
    { img: "/images/brand/marca10.svg", nome: "IWC", href: "/iwc" },
  ];

  const vendedores = [
    {
      nome: "Cordial Watches",
      logo: "/images/seller/vend1.svg",
      descricao: "Cordial Watches",
      bgColor: "bg-[#141414]",
    },
    {
      nome: "TMG Time gateways",
      logo: "/images/seller/vend2.svg",
      descricao: "Time gateways",
      bgColor: "bg-[#6B2C2C]",
    },
    {
      nome: "Fist Wear.TM",
      logo: "/images/seller/vend3.svg",
      descricao: "Fist wear",
      bgColor: "bg-[#2C4A3A]",
    },
    {
      nome: "Linksor Joias",
      logo: "/images/seller/vend4.svg",
      descricao: "Linksor joias",
      bgColor: "bg-[#1A2638]",
    },
  ];

  const protectionFeatures = [
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: "Entrega Segura",
    },
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: "Autenticidade Garantida",
    },
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: "Vendedor Certificado",
    },
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: "Pagamento Seguro",
    },
  ];

  const suggestedProducts = [
    mockProducts[0],
    mockProducts[3],
    mockProducts[12],
    mockProducts[14],
  ].filter((product): product is Product => product !== undefined);

  return (
    <div className="mt-5 sm:mt-12">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Banner Slider */}
        <div className="relative">
          <div className="h-[180px] md:h-[350px] lg:h-[518px] overflow-hidden rounded-[16px] md:rounded-[48px]">
            <Slider {...bannerSettings}>
              {initialProducts.map((product, index) => {
                return (
                  <div
                    key={index}
                    className="h-full relative rounded-[16px] md:rounded-[48px]"
                  >
                    <Link href={product.href} className="block h-full remove-ef">
                      <Image
                        src={product.img}
                        alt={product.nome}
                        className="w-full h-[152px] md:h-full object-cover rounded-[16px] md:rounded-[48px]"
                        width={1200}
                        height={518}
                        priority={index === 1}
                      />
                    </Link>
                    <button className="hidden absolute bottom-8 left-5 md:bottom-32 md:left-22 bg-white hover:bg-gray-50 font-lato text-[#141414] rounded-full lg:flex items-center justify-center gap-2 text-[12px] lg:text-[16px] font-normal md:font-bold transition-colors w-[128px] h-[32px] md:w-[200px] md:h-[56px]">
                      Garanta o seu
                      <svg
                        className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#D5A60A"
                        strokeWidth="2"
                      >
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </Slider>
          </div>
        </div>

        {/* Marcas */}
        <section aria-label="Marcas de relógios" className="py-6 lg:py-12">
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-[#f7f7f7] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-[#f7f7f7] to-transparent z-10 pointer-events-none" />

            <div
              className="overflow-x-auto scrollbar-hide"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <div className="h-auto md:h-[116px] flex items-center gap-4 md:gap-6 lg:gap-[30px] px-4 md:px-8 min-w-max">
                {marcas.map((marca, index) => (
                  <Link
                    href={marca.href}
                    key={index}
                    className="h-auto md:h-full flex flex-col items-center justify-between gap-2 group transition-all duration-300 hover:scale-105 flex-shrink-0"
                  >
                    <div className="w-12 h-12 md:w-22 md:h-22 bg-[#EFEFEF] rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <Image
                        src={marca.img}
                        alt={`Logo ${marca.nome}`}
                        width={32}
                        height={32}
                        className="w-8 h-8 md:w-10 md:h-10 object-contain filter grayscale group-hover:grayscale-0 transition-all"
                      />
                    </div>
                    <p className="font-erstoria mt-2 text-xs md:text-sm text-[#0F0F0F] text-center font-medium group-hover:text-gray-900 transition-colors whitespace-nowrap">
                      {marca.nome}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sugestões para você */}
        <section
          aria-label="Sugestões de relógios"
          className="mb-8 md:mb-12 mt-[22px] md:mt-0"
        >
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="font-erstoria text-2xl md:text-[28px] text-slate-900">
              Sugestões para você
            </h2>
            {/* <Link
              href="/relogios"
              className="font-lato text-sm text-[#D5A60A] hover:text-[#C09609] transition-colors font-normal underline whitespace-nowrap"
            >
              Ver tudo
            </Link> */}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {suggestedProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fadeIn"
                style={{
                  animationDelay: `${index * 20}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <ProductCard product={product} viewMode="grid" />
              </div>
            ))}
          </div>
        </section>

        {/* Seguro do Comprador */}
        <section aria-label="Seguro do comprador" className="py-[20px] lg:py-[150px]">
          <div className="relative min-h-[400px] md:min-h-[600px]">
            {/* Desktop */}
            <div className="hidden lg:flex items-center justify-center relative md:min-h-[600px]">
              <Image
                src="/images/hero/watch-box-bg.svg"
                alt="Caixa Rolex com relógio e documentação"
                width={1200}
                height={660}
                className="absolute"
                priority
              />

              {/* Conteúdo - Desktop */}
              <div className="flex flex-col justify-center relative z-20 max-w-[500px] ml-auto mr-[88px]">
                <div className="space-y-6 md:space-y-8 relative">
                  <div>
                    <p className="font-erstoria text-[#D5A60A] text-sm mb-3 md:mb-3 tracking-wider">
                      Seguro do comprador
                    </p>
                    <h2 className="font-erstoria text-2xl md:text-3xl lg:text-[52px] text-white leading-[102%] mb-4 md:mb-6">
                      Proteção completa em cada etapa da sua compra
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {protectionFeatures.map((feature, index) => (
                      <div key={index} className="h-[24px] flex items-center gap-2.5">
                        <div className="flex-shrink-0 w-10 h-10 md:w-[24px] md:h-[24px] flex items-center justify-center font-normal text-[#ffffff]">
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-lato text-white text-sm md:text-base font-light">
                            {feature.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile */}
            <div>
              <div className="lg:hidden flex items-center justify-center">
                <div className="relative z-10 w-full min-h-[572px]">
                  <Image
                    src="/images/hero/watch-box.svg"
                    alt="Caixa Rolex com relógio e documentação"
                    fill
                    className="object-fill"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Relógios em Destaque */}
      <FeaturedWatches />

      <div className="px-5 sm:px-8">
        <div className="mx-auto w-full max-w-7xl lg:px-8">
          {/* Vendedores Destaque */}
          <section aria-label="Vendedores destaque" className="py-12 md:py-[150px]">
            <h2 className="font-erstoria text-[28px] md:text-[48px] text-[#141414] mb-5 md:mb-8">
              Vendedores destaque
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {vendedores.map((vendedor, index) => (
                <div key={index} className="flex flex-col">
                  <Link
                    href={`/vendedor/${index}`}
                    className={`group ${vendedor.bgColor} rounded-[6px] md:rounded-[14px] p-4 md:p-6 text-center hover:opacity-90 transition-opacity relative overflow-hidden min-h-[58px] md:min-h-[126px] max-h-[58px] md:max-h-[126px] flex items-center justify-center mb-2 md:mb-4`}
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
                      src={vendedor.logo}
                      alt={vendedor.nome}
                      width={100}
                      height={50}
                      className="md:w-[120px] md:h-[60px] object-contain max-h-[50px] md:max-h-[60px]"
                    />
                  </Link>

                  <p className="font-erstoria text-[14px] md:text-[20px] text-[#000000]">
                    {vendedor.descricao}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-center mt-6 md:mt-8 lg:hidden">
              <Link
                href="/vendedores"
                className="inline-flex items-center justify-center w-full max-w-[343px] md:max-w-none md:w-auto h-[56px] px-8 border-2 border-[#141414] rounded-full font-lato text-base text-[#141414] hover:bg-[#141414] hover:text-white transition-colors font-bold"
              >
                Ver todos vendedores
              </Link>
            </div>
          </section>

          {/* Torne-se um Vendedor */}
          <section
            aria-label="Torne-se um vendedor"
            className="mb-12 lg:mb-[130px] overflow-hidden relative"
          >
            {/* Mobile */}
            <div className="lg:hidden">
              <div className="relative h-[439px] max-h-[439px] p-[20px]">
                <h2 className="relative z-20 font-erstoria text-[32px] text-white">
                  Torne-se
                  <br />
                  um <span className="text-[#D5A60A]">vendedor</span>
                </h2>

                <div className="w-full mt-auto">
                  <Link
                    href="/vendedor"
                    className="absolute right-[20px] bottom-[20px] z-10 px-[17px] flex items-center justify-center gap-[6px] bg-[#141414] hover:bg-[#C09609] text-white font-lato font-normal rounded-full transition-colors text-[12px] w-[119px] h-[40px]"
                  >
                    Saiba mais
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="#D5A60A"
                      strokeWidth="2"
                      className="w-4 h-4"
                    >
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </Link>
                </div>

                <Image
                  src="/images/hero/become-seller-mobile.svg"
                  alt="Torne-se um vendedor"
                  fill
                  className="object-cover max-h-[439px] rounded-[8px]"
                  priority
                />
              </div>

              <p className="font-lato text-base text-[#777777] mt-[14px] leading-[140%] block lg:hidden">
                Oferecemos uma plataforma segura, elegante e com visibilidade
                internacional para que você possa vender suas peças com confiança.
              </p>
            </div>

            {/*  Desktop */}
            <div className="relative hidden lg:flex min-h-[640px] max-h-[688px] p-[56px]">
              <Image
                src="/images/hero/become-seller.svg"
                alt="Torne-se um vendedor"
                fill
                className="object-cover rounded-[16px]"
                priority
              />

              <div className="relative z-10 max-w-[374px] ml-auto mt-auto">
                <div className="mb-8">
                  <h2 className="font-erstoria text-2xl md:text-3xl lg:text-5xl mb-3 md:mb-4 text-white lg:text-[#141414]">
                    Torne-se
                    <br />
                    um <span className="text-[#D5A60A]">vendedor</span>
                  </h2>
                  <p className="font-lato text-sm md:text-base text-[#777777] leading-[140%] hidden lg:block">
                    Oferecemos uma plataforma segura, elegante e com visibilidade
                    internacional para que você possa vender suas peças com confiança.
                  </p>
                </div>

                <Link
                  href="/vendedor"
                  className="w-[200px] h-[56px] flex items-center justify-center gap-2 bg-[#141414] hover:bg-[#C09609] rounded-full transition-colors text-base"
                >
                  <span className="text-white leading-[150%] font-lato font-bold">
                    Garanta o seu
                  </span>

                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#D5A60A"
                    strokeWidth="2"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>

          {/* Como Funciona */}
          <section
            aria-label="Como funciona"
            className="py-12 md:py-[124px] md:px-[60px]"
          >
            <div className="text-center mb-12 md:mb-[64px] flex flex-col items-center px-4">
              <p className="font-erstoria text-base md:text-[20px] text-[#D5A60A] text-center mb-3 md:mb-4">
                Como funciona
              </p>
              <h2 className="font-erstoria text-center text-2xl md:text-3xl lg:text-5xl max-w-[707px]">
                Entregamos com segurança e garantia de qualidade
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[48px] mb-6 md:mb-[40px]">
              <div className="text-center lg:max-w-[270px]">
                <div className="w-26 h-26 md:w-26 md:h-26 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                  <Image
                    src="/images/hero/how-it-works1.svg"
                    alt="Você escolhe o seu relógio"
                    width={80}
                    height={80}
                    className="w-26 h-26 md:w-26 md:h-26 object-contain"
                  />
                </div>
                <h3 className="font-erstoria text-lg mb-2">Você escolhe o seu relógio</h3>
                <p className="font-lato text-gray-400 text-sm">
                  Explore nossa coleção e encontre o relógio perfeito para você.
                </p>
              </div>

              <div className="text-center lg:max-w-[270px]">
                <div className="w-26 h-26 md:w-26 md:h-26 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                  <Image
                    src="/images/hero/how-it-works2.svg"
                    alt="Realiza o pagamento"
                    width={80}
                    height={80}
                    className="w-26 h-26 md:w-26 md:h-26 object-contain"
                  />
                </div>
                <h3 className="font-erstoria text-lg mb-2">Realiza o pagamento</h3>
                <p className="font-lato text-gray-400 text-sm">
                  Finalize sua compra com segurança e diversas opções de pagamento.
                </p>
              </div>

              <div className="text-center lg:max-w-[270px]">
                <div className="w-26 h-26 md:w-26 md:h-26 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                  <Image
                    src="/images/hero/how-it-works3.svg"
                    alt="Vendedor envia o relógio"
                    width={80}
                    height={80}
                    className="w-26 h-26 md:w-26 md:h-26 object-contain"
                  />
                </div>
                <h3 className="font-erstoria text-lg mb-2">Vendedor envia o relógio</h3>
                <p className="font-lato text-gray-400 text-sm">
                  O vendedor despacha seu relógio com cuidado e segurança.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[48px]">
              <div className="text-center lg:max-w-[270px]">
                <div className="w-26 h-26 md:w-26 md:h-26 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                  <Image
                    src="/images/hero/how-it-works4.svg"
                    alt="Certificamos a autenticidade"
                    width={80}
                    height={80}
                    className="w-26 h-26 md:w-26 md:h-26 object-contain"
                  />
                </div>
                <h3 className="font-erstoria text-lg mb-2">
                  Certificamos a autenticidade
                </h3>
                <p className="font-lato text-gray-400 text-sm">
                  Nosso time de especialistas verifica cada detalhe para garantir a
                  originalidade.
                </p>
              </div>

              <div className="text-center lg:max-w-[270px]">
                <div className="w-26 h-26 md:w-26 md:h-26 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                  <Image
                    src="/images/hero/how-it-works5.svg"
                    alt="Seu relógio é entregue"
                    width={80}
                    height={80}
                    className="w-26 h-26 md:w-24 md:h-24 object-contain"
                  />
                </div>
                <h3 className="font-erstoria text-lg mb-2">Seu relógio é entregue</h3>
                <p className="font-lato text-gray-400 text-sm">
                  Receba seu relógio com toda a segurança e proteção que você merece.
                </p>
              </div>

              <div className="text-center lg:max-w-[270px]">
                <div className="w-26 h-26 md:w-26 md:h-26 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                  <Image
                    src="/images/hero/how-it-works6.svg"
                    alt="Vendedor recebe o valor"
                    width={80}
                    height={80}
                    className="w-26 h-26 md:w-26 md:h-26 object-contain"
                  />
                </div>
                <h3 className="font-erstoria text-lg mb-2">Vendedor recebe o valor</h3>
                <p className="font-lato text-gray-400 text-sm">
                  O pagamento é liberado ao vendedor após a confirmação da entrega.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
