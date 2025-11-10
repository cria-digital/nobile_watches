import { WatchListingWithStats } from "@/types/listing";

/**
 * Dados mockados para anúncios do vendedor
 * Usado quando a API não está disponível
 */
export const mockListings: WatchListingWithStats[] = [
  {
    id: 1,
    brand: "Patek Philippe",
    model: "Aquanaut",
    referenceNumber: "5167A-001",
    price: 280000,
    condition: "Muito bom",
    description:
      "Patek Philippe Aquanaut em excelente estado de conservação. Relógio usado com poucos sinais de uso, vem com caixa e documentos originais. Última revisão realizada em 2024.",
    images: ["/images/mock/order1.svg"],
    sellerId: 1,
    status: "ativo",
    views: 856,
    favorites: 42,
    createdAt: new Date("2024-10-15").toISOString(),
    updatedAt: new Date("2024-11-01").toISOString(),
    stats: {
      views: 856,
      favorites: 42,
      messages: 8,
    },
  },
  {
    id: 2,
    brand: "Omega",
    model: "De Ville Prestige",
    referenceNumber: "424.13.40.20.03.001",
    price: 18500,
    condition: "Novo",
    description:
      "Omega De Ville Prestige novo, nunca usado. Vem com caixa original, certificado de autenticidade e garantia internacional válida.",
    images: [
      "https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=800&auto=format&fit=crop",
    ],
    sellerId: 1,
    status: "ativo",
    views: 524,
    favorites: 28,
    createdAt: new Date("2024-10-20").toISOString(),
    updatedAt: new Date("2024-10-25").toISOString(),
    stats: {
      views: 524,
      favorites: 28,
      messages: 5,
    },
  },
  {
    id: 3,
    brand: "Audemars Piguet",
    model: "Royal Oak Offshore",
    referenceNumber: "26470ST.OO.A027CA.01",
    price: 195000,
    condition: "Seminovo",
    description:
      "Audemars Piguet Royal Oak Offshore Chronograph. Relógio em excelente estado, revisão completa feita pela marca em 2023. Acompanha caixa e documentação completa.",
    images: [
      "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&auto=format&fit=crop",
    ],
    sellerId: 1,
    status: "vendido",
    views: 1243,
    favorites: 67,
    createdAt: new Date("2024-09-10").toISOString(),
    updatedAt: new Date("2024-10-28").toISOString(),
    stats: {
      views: 1243,
      favorites: 67,
      messages: 15,
    },
  },
  {
    id: 4,
    brand: "Rolex",
    model: "Submariner Date",
    referenceNumber: "126610LN",
    price: 98000,
    condition: "Muito bom",
    description:
      "Rolex Submariner Date 41mm em aço. Modelo 2022 com garantia internacional válida até 2027. Estado impecável, pouquíssimo uso.",
    images: [
      "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&auto=format&fit=crop",
    ],
    sellerId: 1,
    status: "pausado",
    views: 942,
    favorites: 51,
    createdAt: new Date("2024-10-05").toISOString(),
    updatedAt: new Date("2024-10-30").toISOString(),
    stats: {
      views: 942,
      favorites: 51,
      messages: 12,
    },
  },
  {
    id: 5,
    brand: "Hublot",
    model: "Big Bang Unico",
    referenceNumber: "411.NM.1170.RX",
    price: 125000,
    condition: "Usado",
    description:
      "Hublot Big Bang Unico Titanium com pequenos sinais de uso. Revisão completa realizada em 2023. Caixa e documentos originais inclusos.",
    images: [
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop",
    ],
    sellerId: 1,
    status: "ativo",
    views: 387,
    favorites: 19,
    createdAt: new Date("2024-11-01").toISOString(),
    updatedAt: new Date("2024-11-05").toISOString(),
    stats: {
      views: 387,
      favorites: 19,
      messages: 3,
    },
  },

  {
    id: 6,
    brand: "IWC",
    model: "Pilot's Watch Chronograph",
    referenceNumber: "IW377709",
    price: 58000,
    condition: "Seminovo",
    description:
      "IWC Pilot's Watch Chronograph 41 em excelente estado. Modelo 2021 com caixa em aço e pulseira de couro original. Documentação completa.",
    images: [
      "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&auto=format&fit=crop",
    ],
    sellerId: 1,
    status: "pausado",
    views: 451,
    favorites: 23,
    createdAt: new Date("2024-10-12").toISOString(),
    updatedAt: new Date("2024-11-03").toISOString(),
    stats: {
      views: 451,
      favorites: 23,
      messages: 4,
    },
  },
];
