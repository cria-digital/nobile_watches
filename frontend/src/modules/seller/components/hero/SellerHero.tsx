"use client";

import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface FAQ {
  question: string;
  answer: string;
}

export function VendedorHero() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const howItWorks = [
    {
      number: "1",
      title: "Crie um anúncio profissional",
      description:
        "Adicione fotos de alta qualidade, descrição, certificados e detalhes técnicos do relógio.",
    },
    {
      number: "2",
      title: "Receba a proposta do comprador",
      description:
        "Após a negociação, você envia o relógio para o nosso centro de autenticação.",
    },
    {
      number: "3",
      title: "Nosso time verifica o produto",
      description: "Checamos autenticidade, condições e documentos.",
    },
    {
      number: "4",
      title: "Entregamos ao comprador",
      description: "Com segurança e transparência.",
    },
    {
      number: "5",
      title: "Você recebe o valor da venda",
      description: "Simples, rápido e seguro.",
    },
  ];

  // FAQs mobile (5 perguntas)
  const faqsMobile: FAQ[] = [
    {
      question: "Como recebo meu pagamento?",
      answer:
        "O pagamento é liberado após a confirmação da entrega e autenticação do relógio. Você receberá o valor na conta cadastrada em até 5 dias úteis.",
    },
    {
      question: "Como funciona a autenticação dos relógios?",
      answer:
        "Nosso time de especialistas verifica cada detalhe do relógio, incluindo números de série, documentação e autenticidade das peças.",
    },
    {
      question: "Posso vender relógios sem caixa ou documentos?",
      answer:
        "Sim, é possível vender sem caixa ou documentos originais. No entanto, isso pode impactar o valor final da venda.",
    },
    {
      question: "O que fazer se não recebi meu pagamento?",
      answer:
        "Entre em contato com nosso suporte através do e-mail suporte@nobile.com.br ou pelo WhatsApp. Nossa equipe resolverá a questão em até 24 horas.",
    },
    {
      question: "Como posso falar com o vendedor?",
      answer:
        "Você pode enviar mensagens diretas através da plataforma na página do produto. Todas as conversas são monitoradas para garantir segurança.",
    },
  ];

  // FAQs desktop (14 perguntas)
  const faqsDesktop: FAQ[] = [
    {
      question: "Como recebo meu pagamento?",
      answer:
        "O pagamento é liberado após a confirmação da entrega e autenticação do relógio. Você receberá o valor na conta cadastrada em até 5 dias úteis.",
    },
    {
      question: "Como funciona a autenticação dos relógios?",
      answer:
        "Nosso time de especialistas verifica cada detalhe do relógio, incluindo números de série, documentação e autenticidade das peças.",
    },
    {
      question: "Posso vender relógios sem caixa ou documentos?",
      answer:
        "Sim, é possível vender sem caixa ou documentos originais. No entanto, isso pode impactar o valor final da venda.",
    },
    {
      question: "Posso vender relógios sem caixa ou documentos?",
      answer:
        "Sim, é possível vender sem caixa ou documentos originais. No entanto, isso pode impactar o valor final da venda.",
    },
    {
      question: "O que fazer se não recebi meu pagamento?",
      answer:
        "Entre em contato com nosso suporte através do e-mail suporte@nobile.com.br ou pelo WhatsApp. Nossa equipe resolverá a questão em até 24 horas.",
    },
    {
      question: "Como receço meu pagamento?",
      answer:
        "O pagamento é liberado após a confirmação da entrega e autenticação do relógio. Você receberá o valor na conta cadastrada em até 5 dias úteis.",
    },
    {
      question: "Como posso rastrear meu pedido?",
      answer:
        "Você pode acompanhar o status do seu pedido em tempo real através da área 'Minhas Vendas' no seu perfil. Também enviamos atualizações por e-mail.",
    },
    {
      question: "Qual é a política de devolução dos produtos?",
      answer:
        "Aceitamos devoluções em até 14 dias após a entrega, desde que o produto esteja nas mesmas condições em que foi enviado, com todos os acessórios e documentação.",
    },
    {
      question: "O que fazer se o produto chegou danificado?",
      answer:
        "Entre em contato imediatamente com nosso suporte através do e-mail suporte@nobile.com.br com fotos do produto. Providenciaremos a substituição ou reembolso.",
    },
    {
      question: "Como funciona o atendimento ao cliente?",
      answer:
        "Nossa equipe está disponível de segunda a sexta, das 9h às 18h, através do e-mail, WhatsApp e chat na plataforma para auxiliar em qualquer dúvida.",
    },
    {
      question: "Quais métodos de pagamento são aceitos?",
      answer:
        "Aceitamos Pix, cartões de crédito (até 12x), boleto bancário e transferência bancária. Todos os pagamentos são processados de forma segura.",
    },
    {
      question: "Como posso cancelar um pedido?",
      answer:
        "Você pode cancelar seu pedido através da área 'Minhas Vendas' antes do envio. Após o envio, será necessário aguardar a entrega e solicitar devolução.",
    },
    {
      question: "O que fazer em caso de fraude?",
      answer:
        "Entre em contato imediatamente com nossa equipe de segurança através do e-mail seguranca@nobile.com.br. Investigaremos o caso e tomaremos as medidas necessárias.",
    },
    {
      question: "Como posso alterar meu endereço de entrega?",
      answer:
        "Você pode alterar o endereço de entrega na área 'Meu Perfil' antes da confirmação do envio. Após o despacho, não será mais possível alterar.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white lg:overflow-hidden">
        {/* Layout Mobile */}
        <div className="md:hidden h-[410px] flex flex-col">
          {/* Imagem que se expande sob o header */}
          <div className="absolute left-0 -top-4 right-0 h-[283px] z-100">
            <Image
              src="/images/seller/hero-mobile-bg.svg"
              alt="Relógio de luxo dourado"
              fill
              className="object-cover"
              priority
              // ADICIONAR ESTA LINHA:
              sizes="(max-width: 768px) 100vw"
            />
          </div>

          {/* Conteúdo do texto */}
          <div className="relative top-[126px] z-101 px-4 pt-[48px] text-center hero-fade">
            <div className="max-w-[250px] mx-auto">
              <p className="font-erstoria text-[#D5A60A] text-sm tracking-[-0.01em] mb-1.5">
                Seja um vendedor
              </p>
              <h1 className="font-erstoria text-[28px] leading-[100%] mb-1">
                Tenha seus relógios vendidos na Nobile
              </h1>
              <p className="text-sm text-gray-400">
                Conectamos colecionadores, entusiastas e profissionais ao redor
                do mundo com compradores confiáveis.
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="relative mt-auto px-[42px] text-center"
          >
            <Button variant="gold" className="w-full max-w-[343px]">
              Vender meus relógios
            </Button>
          </Link>
        </div>

        {/* Layout Desktop - mantém como estava */}
        <div className="hidden md:block relative min-h-[500px] lg:min-h-[600px]">
          <div className="absolute inset-0">
            <Image
              src="/images/seller/hero-bg.svg"
              alt="Relógio de luxo dourado"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-8 py-24 lg:py-32">
            <div className="max-w-[546px]">
              <p className="font-erstoria text-[#D5A60A] text-[18px] leading-[1.4] mb-3 tracking-[-0.01em]">
                Seja um vendedor
              </p>
              <h1 className="md:text-5xl lg:text-6xl text-white mb-3 leading-[100%]">
                Tenha seus relógios vendidos na Nobile
              </h1>
              <p className="text-sm lg:text-base text-gray-300 mb-12 leading-[148%] max-w-[457px]">
                Conectamos colecionadores, entusiastas e profissionais ao redor
                do mundo com compradores confiáveis.
              </p>
              <Link
                href="/login"
                className="w-[343px] h-[56px] inline-flex items-center justify-center bg-[#D5A60A] hover:bg-[#C09609] text-white tracking-[0.02em] font-lato font-bold rounded-full px-8 py-4 transition-colors text-base"
              >
                Vender meus relógios
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-12 lg:pt-24 lg:pb-20 bg-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center mb-12 md:mb-19">
            <h3 className="text-[#D5A60A] text-sm md:text-[18px] mb-3 tracking-[0.01em]">
              Como funciona
            </h3>
          </div>

          <div className="flex items-center lg:items-start justify-center flex-wrap gap-x-6 gap-y-12">
            {howItWorks.map((step, index) => (
              <div
                key={index}
                className="w-full max-w-80 lg:max-w-90 text-center flex flex-col items-center gap-8"
              >
                <div className="relative flex items-center justify-center h-[67px]">
                  <span className="font-erstoria text-[94px] text-[#272314] font-normal relative z-10 leading-0 translate-y-2">
                    {step.number}
                  </span>
                  <span className="absolute w-[58px] h-[58px] rounded-full bg-[#F8F2DC]"></span>
                </div>
                <div className="lg:max-w-[320px]">
                  <h3 className="text-lg font-normal leading-relaxed mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seguro do Vendedor */}
      <section className="relative bg-white overflow-hidden">
        <div className="relative h-[535px] lg:hidden flex-shrink-0">
          <Image
            src="/images/seller/watch-large-mobile.png"
            alt="Relógio com mostrador verde - Segurança garantida"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 0vw"
          />
        </div>

        <Image
          src="/images/seller/watch-large.png"
          alt="Relógio com mostrador verde - Segurança garantida"
          width={1920}
          height={1450}
          priority
          className="hidden lg:block"
        />

        <div className="absolute inset-0 z-100">
          <div className="max-w-xs lg:max-w-3xl mx-auto text-center py-12 lg:py-40 px-2">
            <div className="font-erstoria font-normal text-sm lg:text-lg text-[#D5A60A] tracking-[-0.01em] mb-1">
              Seguro do vendedor
            </div>

            <h2 className="text-2xl/7 lg:text-6xl tracking-normal mx-auto mb-1 lg:mb-2">
              Proteção completa em
              <br />
              cada etapa da sua venda
            </h2>

            <p className="text-sm lg:text-base text-gray-400">
              Todo o processo é cuidadosamente monitorado do pagamento à
              entrega, seu relógio só é enviado após a confirmação do pagamento
              e autenticação por nossos especialistas.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="duvidas-frequentes"
        aria-label="Dúvidas frequentes"
        className="py-12 md:py-20 lg:py-[202px] bg-white"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="font-erstoria text-3xl md:text-4xl lg:text-[64px] text-[#141414] mb-4">
              Dúvidas frequentes
            </h2>
          </div>

          {/* Mobile - 5 perguntas */}
          <div className="md:hidden space-y-0">
            {faqsMobile.map((faq, index) => (
              <div
                key={`mobile-${index}`}
                className="border-b border-gray-200 transition-all"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between py-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-lato text-base text-[#141414] tracking-[0.01em] pr-4">
                    {faq.question}
                  </span>
                  <svg
                    className={`flex-shrink-0 w-6 h-6 text-[#D5A60A] transition-transform ${
                      openFAQ === index ? "rotate-45" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </button>
                {openFAQ === index && (
                  <div className="pb-5">
                    <p className="font-lato text-sm text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop - 14 perguntas em 2 colunas */}
          <div className="hidden md:grid md:grid-cols-2 gap-x-8 lg:gap-x-12">
            {faqsDesktop.map((faq, index) => (
              <div
                key={`desktop-${index}`}
                className="border-b border-gray-200 transition-all"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between py-5 md:py-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-lato text-base md:text-lg text-[#141414] tracking-[0.01em] pr-4">
                    {faq.question}
                  </span>
                  <svg
                    className={`flex-shrink-0 w-6 h-6 text-[#141414] transition-transform ${
                      openFAQ === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openFAQ === index && (
                  <div className="pb-5 md:pb-6">
                    <p className="font-lato text-sm md:text-base text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
