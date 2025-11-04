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
      <section className="lg:overflow-hidden">
        {/* Layout Mobile */}
        <div className="lg:hidden h-[410px] flex flex-col">
          {/* Imagem que se expande sob o header */}
          <div className="absolute left-0 -top-4 right-0 h-[283px] z-100">
            <Image
              src="/images/seller/hero-mobile-bg.svg"
              alt="Relógio de luxo dourado"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Conteúdo do texto */}
          <div className="relative top-[126px] z-200 px-4 pt-[48px] text-center hero-fade">
            <div className="max-w-[250px] mx-auto">
              <p className="font-erstoria text-[#D5A60A] text-sm tracking-[-0.01em] mb-1.5">
                Seja um vendedor
              </p>
              <h1 className="font-erstoria text-[28px] leading-[100%] mb-1">
                Tenha seus relógios vendidos na Nobile
              </h1>
              <p className="text-sm text-gray-400">
                Conectamos colecionadores, entusiastas e profissionais ao redor do mundo
                com compradores confiáveis.
              </p>
            </div>
          </div>

          <Link href="/login" className="relative mt-auto px-[42px] text-center">
            <Button variant="gold" className="w-full max-w-[343px]">
              Vender meus relógios
            </Button>
          </Link>
        </div>

        {/* Layout Desktop - mantém como estava */}
        <div className="hidden lg:block relative min-h-[500px] lg:min-h-[600px]">
          <div className="absolute inset-0">
            <Image
              src="/images/seller/hero-bg.svg"
              alt="Relógio de luxo dourado"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
            <div className="max-w-[546px]">
              <p className="font-erstoria text-[#D5A60A] text-sm md:text-[18px] leading-[1.4] mb-3 tracking-[-0.01em]">
                Seja um vendedor
              </p>
              <h1 className="font-erstoria text-4xl md:text-5xl lg:text-6xl text-white mb-3 leading-[100%]">
                Tenha seus relógios vendidos na Nobile
              </h1>
              <p className="font-lato text-base text-gray-300 mb-12 leading-[148%] max-w-[457px]">
                Conectamos colecionadores, entusiastas e profissionais ao redor do mundo
                com compradores confiáveis.
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
      <section className="py-12 md:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-19">
            <p className="font-erstoria text-[#D5A60A] text-sm md:text-[18px] mb-3 tracking-[0.01em]">
              Como funciona
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {howItWorks.map((step, index) => (
              <div
                key={index}
                className="max-w-[388px] flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#F8F2DC] flex items-center justify-center mb-4 md:mb-8.5">
                  <span className="font-erstoria text-[98px] text-[#272314] leading-[140%]">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-erstoria leading-[1.4] tracking-[0.01em] text-xl md:text-[18px] text-[#141414] mb-4">
                  {step.title}
                </h3>
                <p className="font-lato text-sm text-gray-400 leading-[1.4]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seguro do Vendedor */}
      <section className="relative pt-[46px] lg:pt-[194px] min-h-[535px] lg:min-h-[1450px] overflow-hidden">
        <div className="absolute z-10 top-[94px] lg:top-0 inset-0">
          <Image
            src="/images/seller/watch-secure.svg"
            alt="Relógio com mostrador verde - Segurança garantida"
            fill
            className="object-fill"
            priority
          />
        </div>

        <div className="relative z-30 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:gap-16">
            {/* Conteúdo */}
            <div className="w-full max-w-[316px] md:max-w-[400px] lg:max-w-[746px] mx-auto text-center">
              <p className="font-erstoria text-[#D5A60A] text-sm lg:text-[18px] mb-3 leading-[1.4] tracking-[0.01em]">
                Seguro do vendedor
              </p>
              <h2 className="font-erstoria text-[28px] md:text-4xl lg:text-[64px] text-[#141414] mb-3 leading-[1.12] md:leading-[1]">
                Proteção completa em cada etapa da sua venda
              </h2>
              <p className="font-lato text-sm lg:text-[16px] text-gray-400 leading-[1.48]">
                Todo o processo é cuidadosamente monitorado do pagamento à entrega. Seu
                relógio só é enviado após a confirmação do pagamento e autenticação por
                nossos especialistas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
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
