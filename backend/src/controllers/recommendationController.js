const prisma = require("../config/prisma");

// Marcas premium para usuários não autenticados
const PREMIUM_BRANDS = [
  "Rolex",
  "Patek Philippe",
  "Audemars Piguet",
  "Omega",
  "Cartier",
  "IWC",
  "Jaeger-LeCoultre",
  "Vacheron Constantin",
  "A. Lange & Söhne",
  "Breguet",
];

// ========================================
// ✅ INCLUDE PADRÃO - CONSISTENTE COM OUTROS CONTROLLERS
// ========================================
const WATCH_INCLUDE = {
  seller: {
    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
      city: true,
      state: true,
      country: true,
    },
  },
  listings: {
    where: { status: "ACTIVE" },
    select: {
      id: true,
      status: true,
      titleSuffix: true,
      shippingInfo: true,
      returnPolicy: true,
      deliveryTime: true,
      negotiable: true,
      publishedAt: true,
    },
    take: 1,
  },
};

/**
 * Gera recomendações personalizadas baseadas no perfil do usuário
 * GET /api/recommendations
 */
const obterRecomendacoes = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { limit = 12 } = req.query;
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12));

    let recomendacoes;

    if (userId) {
      recomendacoes = await gerarRecomendacoesPersonalizadas(userId, limitNum);
    } else {
      recomendacoes = await gerarRecomendacoesGenericas(limitNum);
    }

    res.json({
      recommendations: recomendacoes,
      isPersonalized: !!userId,
      count: recomendacoes.length,
    });
  } catch (err) {
    console.error("Erro ao gerar recomendações:", err);
    res.status(500).json({ error: "Erro ao gerar recomendações." });
  }
};

/**
 * Gera recomendações personalizadas para usuário autenticado
 */
async function gerarRecomendacoesPersonalizadas(userId, limit) {
  // 1. Buscar wishlist do usuário para análise de preferências
  const wishlist = await prisma.wishlist.findMany({
    where: { userId },
    include: {
      watch: {
        select: {
          id: true,
          brand: true,
          price: true,
          caseMaterial: true,
          movement: true,
          dialColor: true,
        },
      },
    },
  });

  // 2. Buscar coleção do usuário (para não recomendar relógios que já possui)
  const collection = await prisma.collection.findMany({
    where: { userId },
    select: { watchId: true },
  });

  // IDs para excluir das recomendações
  const excludeIds = [...wishlist.map(w => w.watchId), ...collection.map(c => c.watchId)];

  // 3. Análise de preferências baseada na wishlist
  const preferences = analisarPreferencias(wishlist);

  // 4. Construir query de recomendações
  const where = {
    id: { notIn: excludeIds },
    listings: {
      some: {
        status: "ACTIVE",
      },
    },
  };

  // Se o usuário tem preferências claras, usar filtros
  if (preferences.brands.length > 0) {
    where.OR = [
      { brand: { in: preferences.brands, mode: "insensitive" } },
      ...(preferences.priceRange.min && preferences.priceRange.max
        ? [
            {
              price: {
                gte: preferences.priceRange.min * 0.7,
                lte: preferences.priceRange.max * 1.3,
              },
            },
          ]
        : []),
    ];
  } else if (preferences.priceRange.min && preferences.priceRange.max) {
    where.price = {
      gte: preferences.priceRange.min * 0.7,
      lte: preferences.priceRange.max * 1.3,
    };
  }

  // 5. Buscar relógios recomendados
  const recomendacoes = await prisma.watch.findMany({
    where,
    include: WATCH_INCLUDE,
    take: limit * 2,
    orderBy: [{ createdAt: "desc" }],
  });

  // 6. Calcular score de relevância e ordenar
  const recomendacoesComScore = recomendacoes.map(watch => ({
    ...watch,
    relevanceScore: calcularScoreRelevancia(watch, preferences),
  }));

  return recomendacoesComScore
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit)
    .map(({ relevanceScore, ...watch }) => watch);
}

/**
 * Analisa preferências do usuário baseado na wishlist
 */
function analisarPreferencias(wishlist) {
  if (!wishlist || wishlist.length === 0) {
    return {
      brands: [],
      priceRange: { min: null, max: null, avg: null },
      materials: [],
      movements: [],
      colors: [],
    };
  }

  // Extrair marcas (contagem para priorizar as mais frequentes)
  const brandCount = {};
  wishlist.forEach(item => {
    const brand = item.watch.brand;
    brandCount[brand] = (brandCount[brand] || 0) + 1;
  });

  const sortedBrands = Object.entries(brandCount)
    .sort(([, a], [, b]) => b - a)
    .map(([brand]) => brand);

  const brands =
    sortedBrands.length <= 3
      ? sortedBrands
      : sortedBrands.filter(brand => brandCount[brand] >= 2);

  // Calcular faixa de preço
  const prices = wishlist.map(item => item.watch.price).filter(Boolean);
  const priceRange = {
    min: prices.length > 0 ? Math.min(...prices) : null,
    max: prices.length > 0 ? Math.max(...prices) : null,
    avg: prices.length > 0 ? prices.reduce((sum, p) => sum + p, 0) / prices.length : null,
  };

  // Materiais, movimentos e cores preferidos
  const materials = [
    ...new Set(wishlist.map(item => item.watch.caseMaterial).filter(Boolean)),
  ];
  const movements = [
    ...new Set(wishlist.map(item => item.watch.movement).filter(Boolean)),
  ];
  const colors = [...new Set(wishlist.map(item => item.watch.dialColor).filter(Boolean))];

  return {
    brands,
    priceRange,
    materials,
    movements,
    colors,
  };
}

/**
 * Calcula score de relevância para ordenar recomendações
 */
function calcularScoreRelevancia(watch, preferences) {
  let score = 0;

  // 1. Match de marca (peso alto: +50 pontos)
  if (
    preferences.brands.length > 0 &&
    preferences.brands.some(b => b.toLowerCase() === watch.brand.toLowerCase())
  ) {
    const brandIndex = preferences.brands.findIndex(
      b => b.toLowerCase() === watch.brand.toLowerCase()
    );
    score += 50 - brandIndex * 5;
  }

  // 2. Faixa de preço (peso médio: +30 pontos)
  if (preferences.priceRange.min && preferences.priceRange.max) {
    const targetPrice = preferences.priceRange.avg || preferences.priceRange.min;
    const priceDiff = Math.abs(watch.price - targetPrice);
    const maxDiff = preferences.priceRange.max - preferences.priceRange.min;

    if (maxDiff > 0) {
      const priceScore = Math.max(0, 30 * (1 - priceDiff / maxDiff));
      score += priceScore;
    }
  }

  // 3. Material da caixa (peso baixo: +10 pontos)
  if (
    preferences.materials.length > 0 &&
    watch.caseMaterial &&
    preferences.materials.includes(watch.caseMaterial)
  ) {
    score += 10;
  }

  // 4. Tipo de movimento (peso baixo: +10 pontos)
  if (
    preferences.movements.length > 0 &&
    watch.movement &&
    preferences.movements.includes(watch.movement)
  ) {
    score += 10;
  }

  // 5. Cor do mostrador (peso baixo: +5 pontos)
  if (
    preferences.colors.length > 0 &&
    watch.dialColor &&
    preferences.colors.includes(watch.dialColor)
  ) {
    score += 5;
  }

  // 6. Bonus para relógios recentes (peso baixo: até +20 pontos)
  const daysSinceCreation =
    (Date.now() - new Date(watch.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation <= 30) {
    score += 20 * (1 - daysSinceCreation / 30);
  }

  return score;
}

/**
 * Gera recomendações genéricas para usuário não autenticado
 * ✅ GARANTIA: Sempre retorna a quantidade solicitada (ou o máximo disponível)
 *
 * Estratégia de fallback:
 * 1. Tenta buscar de marcas premium
 * 2. Se insuficiente, complementa com outros relógios ativos (ordenados por data)
 */
async function gerarRecomendacoesGenericas(limit) {
  let recomendacoes = [];

  // 1️⃣ Primeira tentativa: Marcas premium
  const premiumWatches = await prisma.watch.findMany({
    where: {
      brand: {
        in: PREMIUM_BRANDS,
        mode: "insensitive",
      },
      listings: {
        some: {
          status: "ACTIVE",
        },
      },
    },
    include: WATCH_INCLUDE,
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });

  recomendacoes = premiumWatches;

  // 2️⃣ Se ainda não temos o limite necessário, buscar de todas as marcas
  if (recomendacoes.length < limit) {
    const remainingLimit = limit - recomendacoes.length;
    const excludeIds = recomendacoes.map(w => w.id);

    const additionalWatches = await prisma.watch.findMany({
      where: {
        id: {
          notIn: excludeIds, // Excluir os já retornados
        },
        listings: {
          some: {
            status: "ACTIVE",
          },
        },
      },
      include: WATCH_INCLUDE,
      orderBy: [{ createdAt: "desc" }], // Mais recentes primeiro
      take: remainingLimit,
    });

    recomendacoes = [...recomendacoes, ...additionalWatches];
  }

  return recomendacoes;
}

/**
 * Retorna insights sobre as preferências do usuário
 * GET /api/recommendations/insights
 */
const obterInsightsUsuario = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Autenticação necessária para visualizar insights.",
      });
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        watch: {
          select: {
            brand: true,
            price: true,
            caseMaterial: true,
            movement: true,
            dialColor: true,
            condition: true,
            year: true,
          },
        },
      },
    });

    if (wishlist.length === 0) {
      return res.json({
        message: "Adicione relógios à sua wishlist para ver insights personalizados.",
        insights: null,
      });
    }

    const preferences = analisarPreferencias(wishlist);

    const conditions = wishlist.map(item => item.watch.condition).filter(Boolean);
    const years = wishlist.map(item => item.watch.year).filter(Boolean);

    const insights = {
      totalWishlistItems: wishlist.length,
      favoriteBrands: preferences.brands,
      priceRange: {
        min: preferences.priceRange.min,
        max: preferences.priceRange.max,
        average: preferences.priceRange.avg
          ? Math.round(preferences.priceRange.avg)
          : null,
      },
      preferredMaterials: preferences.materials,
      preferredMovements: preferences.movements,
      preferredColors: preferences.colors,
      mostCommonCondition:
        conditions.length > 0
          ? conditions
              .sort(
                (a, b) =>
                  conditions.filter(c => c === b).length -
                  conditions.filter(c => c === a).length
              )
              .shift()
          : null,
      averageYear:
        years.length > 0
          ? Math.round(years.reduce((a, b) => a + b, 0) / years.length)
          : null,
    };

    res.json({
      insights,
      message: "Insights gerados com sucesso.",
    });
  } catch (err) {
    console.error("Erro ao gerar insights:", err);
    res.status(500).json({ error: "Erro ao gerar insights do usuário." });
  }
};

module.exports = {
  obterRecomendacoes,
  obterInsightsUsuario,
};
