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

/**
 * Gera recomendações personalizadas baseadas no perfil do usuário
 * GET /api/recommendations
 */
const obterRecomendacoes = async (req, res) => {
  try {
    const userId = req.user?.id; // Opcional - pode ser null para não autenticados
    const { limit = 12 } = req.query;
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12));

    let recomendacoes;

    if (userId) {
      // Usuário autenticado - recomendações personalizadas
      recomendacoes = await gerarRecomendacoesPersonalizadas(userId, limitNum);
    } else {
      // Usuário não autenticado - recomendações genéricas
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
    // IMPORTANTE: Apenas relógios com anúncios ativos
    listings: {
      some: {
        status: "ACTIVE",
      },
    },
  };

  // Se o usuário tem preferências claras, usar filtros
  if (preferences.brands.length > 0) {
    where.OR = [
      // Priorizar marcas favoritas
      { brand: { in: preferences.brands, mode: "insensitive" } },
      // Incluir também relógios na faixa de preço de interesse
      ...(preferences.priceRange.min && preferences.priceRange.max
        ? [
            {
              price: {
                gte: preferences.priceRange.min * 0.7, // 30% abaixo
                lte: preferences.priceRange.max * 1.3, // 30% acima
              },
            },
          ]
        : []),
    ];
  } else if (preferences.priceRange.min && preferences.priceRange.max) {
    // Se não tem marcas favoritas mas tem faixa de preço
    where.price = {
      gte: preferences.priceRange.min * 0.7,
      lte: preferences.priceRange.max * 1.3,
    };
  }

  // 5. Buscar relógios recomendados
  const recomendacoes = await prisma.watch.findMany({
    where,
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          isVerified: true,
        },
      },
      // Incluir informações de anúncios ativos
      listings: {
        where: { status: "ACTIVE" },
        select: {
          id: true,
          status: true,
          negotiable: true,
          deliveryTime: true,
        },
        take: 1,
      },
    },
    take: limit * 2, // Buscar mais para aplicar score
    orderBy: [
      { createdAt: "desc" }, // Priorizar mais recentes
    ],
  });

  // 6. Calcular score de relevância e ordenar
  const recomendacoesComScore = recomendacoes.map(watch => ({
    ...watch,
    relevanceScore: calcularScoreRelevancia(watch, preferences),
  }));

  // Ordenar por score e limitar
  return recomendacoesComScore
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit)
    .map(({ relevanceScore, ...watch }) => watch); // Remove score do retorno
}

/**
 * Analisa preferências do usuário baseado na wishlist
 */
function analisarPreferencias(wishlist) {
  if (!wishlist || wishlist.length === 0) {
    return {
      brands: [],
      priceRange: { min: null, max: null },
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

  // Pegar marcas que aparecem pelo menos 2 vezes, ou as 3 mais frequentes
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
    avg: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null,
  };

  // Extrair outros atributos favoritos
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
 * Calcula score de relevância de um relógio para as preferências do usuário
 */
function calcularScoreRelevancia(watch, preferences) {
  let score = 0;

  // Score por marca favorita (peso alto)
  if (
    preferences.brands.length > 0 &&
    preferences.brands.some(b => b.toLowerCase() === watch.brand.toLowerCase())
  ) {
    score += 50;
  }

  // Score por faixa de preço (peso médio)
  if (preferences.priceRange.min && preferences.priceRange.max) {
    const { min, max, avg } = preferences.priceRange;
    if (watch.price >= min && watch.price <= max) {
      score += 30;
    } else if (watch.price >= min * 0.7 && watch.price <= max * 1.3) {
      score += 15;
    }

    // Bonus se está próximo da média
    if (avg && Math.abs(watch.price - avg) <= avg * 0.3) {
      score += 10;
    }
  }

  // Score por material da caixa (peso baixo)
  if (
    preferences.materials.length > 0 &&
    preferences.materials.includes(watch.caseMaterial)
  ) {
    score += 10;
  }

  // Score por movimento (peso baixo)
  if (
    preferences.movements.length > 0 &&
    preferences.movements.includes(watch.movement)
  ) {
    score += 10;
  }

  // Score por cor do mostrador (peso baixo)
  if (preferences.colors.length > 0 && preferences.colors.includes(watch.dialColor)) {
    score += 5;
  }

  // Bonus por vendedor verificado
  if (watch.seller?.isVerified) {
    score += 15;
  }

  // Bonus por ter anúncio ativo
  if (watch.listings && watch.listings.length > 0) {
    score += 10;
  }

  // Bonus por relógio recente (últimos 30 dias)
  const daysSinceCreation =
    (Date.now() - new Date(watch.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation <= 30) {
    score += 20 * (1 - daysSinceCreation / 30); // Decai linearmente
  }

  return score;
}

/**
 * Gera recomendações genéricas para usuário não autenticado
 */
async function gerarRecomendacoesGenericas(limit) {
  // Buscar relógios de marcas premium com anúncios ativos, priorizando mais recentes
  const recomendacoes = await prisma.watch.findMany({
    where: {
      brand: {
        in: PREMIUM_BRANDS,
        mode: "insensitive",
      },
      // IMPORTANTE: Apenas relógios com anúncios ativos
      listings: {
        some: {
          status: "ACTIVE",
        },
      },
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          isVerified: true,
        },
      },
      listings: {
        where: { status: "ACTIVE" },
        select: {
          id: true,
          status: true,
          negotiable: true,
          deliveryTime: true,
        },
        take: 1,
      },
    },
    orderBy: [
      { createdAt: "desc" }, // Mais recentes primeiro
    ],
    take: limit,
  });

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

    // Buscar wishlist
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

    // Calcular estatísticas adicionais
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
