const express = require("express");
const router = express.Router();
const {
  buscarSugestoes,
  buscaAvancada,
  obterFiltrosDisponiveis,
  contarResultados,
  listarMarcas,
} = require("../controllers/searchController");
const { searchLimiter } = require("../config/rateLimiter");

// ============================================
// RATE LIMITER
// ============================================

router.use(searchLimiter);

// ============================================
// ROTAS DE BUSCA
// ============================================

/**
 * @swagger
 * /api/search/suggestions:
 *   get:
 *     summary: Busca sugestões para autocompletar (mínimo 2 caracteres)
 *     tags: [Busca]
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Termo de busca
 *         example: rolex
 *     responses:
 *       200:
 *         description: Lista de sugestões retornada com sucesso
 *       429:
 *         description: Muitas buscas em pouco tempo
 */
router.get("/suggestions", buscarSugestoes);

/**
 * @swagger
 * /api/search/brands:
 *   get:
 *     summary: Lista todas as marcas disponíveis
 *     tags: [Busca]
 *     responses:
 *       200:
 *         description: Lista de marcas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["Rolex", "Omega", "Patek Philippe"]
 *       429:
 *         description: Muitas buscas em pouco tempo
 */
router.get("/brands", listarMarcas);

/**
 * @swagger
 * /api/search/advanced:
 *   get:
 *     summary: Busca avançada com múltiplos filtros e paginação
 *     tags: [Busca]
 *     parameters:
 *       - name: query
 *         in: query
 *         schema:
 *           type: string
 *         description: Termo de busca geral
 *       - name: brand
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por marca
 *       - name: minPrice
 *         in: query
 *         schema:
 *           type: number
 *         description: Preço mínimo
 *       - name: maxPrice
 *         in: query
 *         schema:
 *           type: number
 *         description: Preço máximo
 *       - name: condition
 *         in: query
 *         schema:
 *           type: string
 *         description: Condição do relógio
 *       - name: movement
 *         in: query
 *         schema:
 *           type: string
 *         description: Tipo de movimento
 *       - name: caseMaterial
 *         in: query
 *         schema:
 *           type: string
 *         description: Material da caixa
 *       - name: braceletMaterial
 *         in: query
 *         schema:
 *           type: string
 *         description: Material da pulseira
 *       - name: dialColor
 *         in: query
 *         schema:
 *           type: string
 *         description: Cor do mostrador
 *       - name: gender
 *         in: query
 *         schema:
 *           type: string
 *         description: Gênero
 *       - name: minYear
 *         in: query
 *         schema:
 *           type: integer
 *         description: Ano mínimo
 *       - name: maxYear
 *         in: query
 *         schema:
 *           type: integer
 *         description: Ano máximo
 *       - name: minDiameter
 *         in: query
 *         schema:
 *           type: number
 *         description: Diâmetro mínimo da caixa
 *       - name: maxDiameter
 *         in: query
 *         schema:
 *           type: number
 *         description: Diâmetro máximo da caixa
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Itens por página
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           enum: [price, createdAt, brand, model, year, caseDiameter]
 *           default: createdAt
 *         description: Campo para ordenação
 *       - name: order
 *         in: query
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordem de classificação
 *     responses:
 *       200:
 *         description: Resultados da busca retornados com sucesso
 *       429:
 *         description: Muitas buscas em pouco tempo
 */
router.get("/advanced", buscaAvancada);

/**
 * @swagger
 * /api/search/filters:
 *   get:
 *     summary: Retorna todos os valores únicos disponíveis para filtros
 *     tags: [Busca]
 *     responses:
 *       200:
 *         description: Filtros disponíveis retornados com sucesso
 *       429:
 *         description: Muitas buscas em pouco tempo
 */
router.get("/filters", obterFiltrosDisponiveis);

/**
 * @swagger
 * /api/search/count:
 *   post:
 *     summary: Conta quantos resultados existem para determinados filtros
 *     tags: [Busca]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *               brand:
 *                 type: string
 *               minPrice:
 *                 type: number
 *               maxPrice:
 *                 type: number
 *               condition:
 *                 type: string
 *               movement:
 *                 type: string
 *               caseMaterial:
 *                 type: string
 *               braceletMaterial:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contagem retornada com sucesso
 *       429:
 *         description: Muitas buscas em pouco tempo
 */
router.post("/count", contarResultados);

module.exports = router;
