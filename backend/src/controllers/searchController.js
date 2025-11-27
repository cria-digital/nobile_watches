const prisma = require("../config/prisma");

// Constantes para validação
const MAX_LIMIT = 100; // Limite máximo de itens por página
const DEFAULT_LIMIT = 20;
const MIN_SEARCH_CHARS = 2;

/**
 * Busca sugestões para autocompletar
 * GET /api/search/suggestions?query=rolex
 */
const buscarSugestoes = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < MIN_SEARCH_CHARS) {
      return res.json({ suggestions: [] });
    }

    const searchTerm = query.trim();

    const relogios = await prisma.watch.findMany({
      where: {
        OR: [
          { brand: { contains: searchTerm, mode: "insensitive" } },
          { model: { contains: searchTerm, mode: "insensitive" } },
          { referenceNumber: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        brand: true,
        model: true,
        referenceNumber: true,
        images: true,
        caseMaterial: true,
        caseDiameter: true,
        dialColor: true,
        movement: true,
        year: true,
        price: true,
      },
      take: 10,
      orderBy: [{ brand: "asc" }, { model: "asc" }],
    });

    const suggestions = relogios.map(watch => ({
      id: watch.id,
      label: `${watch.brand} ${watch.model}${
        watch.referenceNumber ? ` (Ref: ${watch.referenceNumber})` : ""
      }`,
      brand: watch.brand,
      model: watch.model,
      referenceNumber: watch.referenceNumber,
      imageUrl: watch.images?.[0] || null,
      caseMaterial: watch.caseMaterial,
      caseDiameter: watch.caseDiameter,
      dialColor: watch.dialColor,
      movement: watch.movement,
      year: watch.year,
      averagePrice: watch.price,
    }));

    res.json({ suggestions });
  } catch (err) {
    console.error("Erro ao buscar sugestões:", err);
    res.status(500).json({ error: "Erro ao buscar sugestões." });
  }
};

/**
 * Busca avançada com múltiplos filtros e paginação
 * GET /api/search/advanced?query=rolex&brand=Rolex&minPrice=50000&maxPrice=100000&page=1&limit=20
 */
const buscaAvancada = async (req, res) => {
  try {
    const {
      query,
      brand,
      minPrice,
      maxPrice,
      condition,
      movement,
      caseMaterial,
      braceletMaterial,
      dialColor,
      gender,
      minYear,
      maxYear,
      minDiameter,
      maxDiameter,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // Validação de paginação com limites seguros
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit) || DEFAULT_LIMIT));
    const skip = (pageNum - 1) * limitNum;

    // Construir filtros dinâmicos
    const where = {};

    // Busca textual
    if (query && query.trim()) {
      const searchTerm = query.trim();
      where.OR = [
        { brand: { contains: searchTerm, mode: "insensitive" } },
        { model: { contains: searchTerm, mode: "insensitive" } },
        { referenceNumber: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    // Filtro por marca
    if (brand) {
      where.brand = { equals: brand, mode: "insensitive" };
    }

    // Filtro por faixa de preço com validação
    if (minPrice || maxPrice) {
      where.price = {};
      const parsedMinPrice = parseFloat(minPrice);
      const parsedMaxPrice = parseFloat(maxPrice);

      if (minPrice && !isNaN(parsedMinPrice) && parsedMinPrice >= 0) {
        where.price.gte = parsedMinPrice;
      }
      if (maxPrice && !isNaN(parsedMaxPrice) && parsedMaxPrice >= 0) {
        where.price.lte = parsedMaxPrice;
      }
    }

    // Filtro por condição
    if (condition) {
      where.condition = { equals: condition, mode: "insensitive" };
    }

    // Filtro por movimento
    if (movement) {
      where.movement = { equals: movement, mode: "insensitive" };
    }

    // Filtro por material da caixa
    if (caseMaterial) {
      where.caseMaterial = { equals: caseMaterial, mode: "insensitive" };
    }

    // Filtro por material da pulseira
    if (braceletMaterial) {
      where.braceletMaterial = { equals: braceletMaterial, mode: "insensitive" };
    }

    // Filtro por cor do mostrador
    if (dialColor) {
      where.dialColor = { equals: dialColor, mode: "insensitive" };
    }

    // Filtro por gênero
    if (gender) {
      where.gender = { equals: gender, mode: "insensitive" };
    }

    // MELHORADO: Filtro por ano com validação
    if (minYear || maxYear) {
      where.year = {};
      const parsedMinYear = parseInt(minYear);
      const parsedMaxYear = parseInt(maxYear);

      if (minYear && !isNaN(parsedMinYear) && parsedMinYear > 0) {
        where.year.gte = parsedMinYear;
      }
      if (maxYear && !isNaN(parsedMaxYear) && parsedMaxYear > 0) {
        where.year.lte = parsedMaxYear;
      }
    }

    // Filtro por diâmetro com validação
    if (minDiameter || maxDiameter) {
      where.caseDiameter = {};
      const parsedMinDiameter = parseFloat(minDiameter);
      const parsedMaxDiameter = parseFloat(maxDiameter);

      if (minDiameter && !isNaN(parsedMinDiameter) && parsedMinDiameter > 0) {
        where.caseDiameter.gte = parsedMinDiameter;
      }
      if (maxDiameter && !isNaN(parsedMaxDiameter) && parsedMaxDiameter > 0) {
        where.caseDiameter.lte = parsedMaxDiameter;
      }
    }

    // Ordenação
    const orderBy = {};
    const validSortFields = [
      "price",
      "createdAt",
      "brand",
      "model",
      "year",
      "caseDiameter",
    ];

    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = order === "asc" ? "asc" : "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    // Buscar relógios com filtros
    const [relogios, total] = await Promise.all([
      prisma.watch.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy,
      }),
      prisma.watch.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      watches: relogios,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasMore: pageNum < totalPages,
      },
      appliedFilters: {
        query,
        brand,
        minPrice,
        maxPrice,
        condition,
        movement,
        caseMaterial,
        braceletMaterial,
        dialColor,
        gender,
        minYear,
        maxYear,
        minDiameter,
        maxDiameter,
        sortBy,
        order,
      },
    });
  } catch (err) {
    console.error("Erro na busca avançada:", err);
    res.status(500).json({ error: "Erro ao realizar busca." });
  }
};

/**
 * Retorna todos os valores únicos disponíveis para cada filtro
 * GET /api/search/filters
 */
const obterFiltrosDisponiveis = async (req, res) => {
  try {
    // Buscar valores únicos de cada campo
    const [
      brands,
      caseMaterials,
      braceletMaterials,
      movements,
      conditions,
      dialColors,
      genders,
      priceRange,
      yearRange,
      diameterRange,
    ] = await Promise.all([
      // Marcas
      prisma.watch.findMany({
        select: { brand: true },
        distinct: ["brand"],
        orderBy: { brand: "asc" },
      }),

      // Material da caixa
      prisma.watch.findMany({
        select: { caseMaterial: true },
        distinct: ["caseMaterial"],
        orderBy: { caseMaterial: "asc" },
      }),

      // Material da pulseira
      prisma.watch.findMany({
        select: { braceletMaterial: true },
        distinct: ["braceletMaterial"],
        orderBy: { braceletMaterial: "asc" },
      }),

      // Movimento
      prisma.watch.findMany({
        select: { movement: true },
        distinct: ["movement"],
        orderBy: { movement: "asc" },
      }),

      // Condição
      prisma.watch.findMany({
        select: { condition: true },
        distinct: ["condition"],
        orderBy: { condition: "asc" },
      }),

      // Cor do mostrador
      prisma.watch.findMany({
        select: { dialColor: true },
        distinct: ["dialColor"],
        orderBy: { dialColor: "asc" },
      }),

      // Gênero
      prisma.watch.findMany({
        select: { gender: true },
        distinct: ["gender"],
        orderBy: { gender: "asc" },
      }),

      // Faixa de preço (min/max)
      prisma.watch.aggregate({
        _min: { price: true },
        _max: { price: true },
      }),

      // Faixa de ano (min/max)
      prisma.watch.aggregate({
        _min: { year: true },
        _max: { year: true },
      }),

      // Faixa de diâmetro (min/max)
      prisma.watch.aggregate({
        _min: { caseDiameter: true },
        _max: { caseDiameter: true },
      }),
    ]);

    res.json({
      brands: brands.map(w => w.brand).filter(Boolean),
      caseMaterials: caseMaterials.map(w => w.caseMaterial).filter(Boolean),
      braceletMaterials: braceletMaterials.map(w => w.braceletMaterial).filter(Boolean),
      movements: movements.map(w => w.movement).filter(Boolean),
      conditions: conditions.map(w => w.condition).filter(Boolean),
      dialColors: dialColors.map(w => w.dialColor).filter(Boolean),
      genders: genders.map(w => w.gender).filter(Boolean),
      priceRange: {
        min: priceRange._min.price || 0,
        max: priceRange._max.price || 0,
      },
      yearRange: {
        min: yearRange._min.year || null,
        max: yearRange._max.year || null,
      },
      diameterRange: {
        min: diameterRange._min.caseDiameter || null,
        max: diameterRange._max.caseDiameter || null,
      },
    });
  } catch (err) {
    console.error("Erro ao obter filtros:", err);
    res.status(500).json({ error: "Erro ao carregar filtros." });
  }
};

/**
 * Conta quantos resultados existem para determinados filtros
 * POST /api/search/count
 */
const contarResultados = async (req, res) => {
  try {
    const {
      query,
      brand,
      minPrice,
      maxPrice,
      condition,
      movement,
      caseMaterial,
      braceletMaterial,
    } = req.body;

    const where = {};

    if (query && query.trim()) {
      const searchTerm = query.trim();
      where.OR = [
        { brand: { contains: searchTerm, mode: "insensitive" } },
        { model: { contains: searchTerm, mode: "insensitive" } },
        { referenceNumber: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    if (brand) where.brand = { equals: brand, mode: "insensitive" };
    if (condition) where.condition = { equals: condition, mode: "insensitive" };
    if (movement) where.movement = { equals: movement, mode: "insensitive" };
    if (caseMaterial) where.caseMaterial = { equals: caseMaterial, mode: "insensitive" };
    if (braceletMaterial)
      where.braceletMaterial = { equals: braceletMaterial, mode: "insensitive" };

    // Validação de valores numéricos
    if (minPrice || maxPrice) {
      where.price = {};
      const parsedMinPrice = parseFloat(minPrice);
      const parsedMaxPrice = parseFloat(maxPrice);

      if (minPrice && !isNaN(parsedMinPrice) && parsedMinPrice >= 0) {
        where.price.gte = parsedMinPrice;
      }
      if (maxPrice && !isNaN(parsedMaxPrice) && parsedMaxPrice >= 0) {
        where.price.lte = parsedMaxPrice;
      }
    }

    const count = await prisma.watch.count({ where });

    res.json({ count });
  } catch (err) {
    console.error("Erro ao contar resultados:", err);
    res.status(500).json({ error: "Erro ao contar resultados." });
  }
};

/**
 * Lista apenas as marcas disponíveis
 * GET /api/search/brands
 */
const listarMarcas = async (req, res) => {
  try {
    const brands = await prisma.watch.findMany({
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    });

    // O .filter(Boolean) já remove null, undefined e strings vazias
    res.json(brands.map(w => w.brand).filter(Boolean));
  } catch (err) {
    console.error("Erro ao listar marcas:", err);
    res.status(500).json({ error: "Erro ao listar marcas." });
  }
};

module.exports = {
  buscarSugestoes,
  buscaAvancada,
  obterFiltrosDisponiveis,
  contarResultados,
  listarMarcas,
};
