const express = require("express");
const router = express.Router();
const {
  obterRecomendacoes,
  obterInsightsUsuario,
} = require("../controllers/recommendationController");
const optionalAuthMiddleware = require("../middlewares/optionalAuthMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /api/recommendations:
 *   get:
 *     summary: Obtém recomendações personalizadas de relógios
 *     description: |
 *       Retorna recomendações baseadas no perfil do usuário.
 *
 *       **Para usuários autenticados:**
 *       - Recomendações personalizadas baseadas em wishlist, faixa de preço e preferências
 *       - Marcas favoritas extraídas da wishlist
 *       - Score de relevância combinando múltiplos fatores
 *       - Exclui relógios já na wishlist ou coleção
 *
 *       **Para usuários não autenticados:**
 *       - Recomendações de marcas premium (Rolex, Patek Philippe, Audemars Piguet, etc.)
 *       - Priorizados por data de criação (mais recentes primeiro)
 *       - Apenas relógios com anúncios ativos
 *
 *       **Nota:** Esta rota funciona com ou sem token de autenticação.
 *     tags: [Recomendações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 12
 *           minimum: 1
 *           maximum: 50
 *         description: Número de recomendações a retornar
 *         example: 12
 *     responses:
 *       200:
 *         description: Recomendações retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       brand:
 *                         type: string
 *                       model:
 *                         type: string
 *                       price:
 *                         type: number
 *                       condition:
 *                         type: string
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                       seller:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           isVerified:
 *                             type: boolean
 *                       listings:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             status:
 *                               type: string
 *                             negotiable:
 *                               type: boolean
 *                             deliveryTime:
 *                               type: string
 *                 isPersonalized:
 *                   type: boolean
 *                   description: Indica se as recomendações são personalizadas (true para autenticado, false para não autenticado)
 *                 count:
 *                   type: integer
 *                   description: Número total de recomendações retornadas
 *             examples:
 *               authenticated:
 *                 summary: Usuário autenticado (personalizado)
 *                 value:
 *                   recommendations:
 *                     - id: 1
 *                       brand: "Rolex"
 *                       model: "Submariner"
 *                       price: 45000
 *                       condition: "Novo"
 *                       images: ["https://cloudinary.com/..."]
 *                       seller:
 *                         id: 5
 *                         name: "João Silva"
 *                         email: "joao@email.com"
 *                         isVerified: true
 *                       listings:
 *                         - id: 10
 *                           status: "ACTIVE"
 *                           negotiable: true
 *                           deliveryTime: "5-7 dias úteis"
 *                   isPersonalized: true
 *                   count: 12
 *               guest:
 *                 summary: Usuário não autenticado (genérico)
 *                 value:
 *                   recommendations:
 *                     - id: 2
 *                       brand: "Omega"
 *                       model: "Speedmaster"
 *                       price: 32000
 *                       condition: "Excelente"
 *                       images: ["https://cloudinary.com/..."]
 *                       seller:
 *                         id: 8
 *                         name: "Maria Santos"
 *                         email: "maria@email.com"
 *                         isVerified: true
 *                       listings:
 *                         - id: 15
 *                           status: "ACTIVE"
 *                           negotiable: false
 *                           deliveryTime: "3-5 dias úteis"
 *                   isPersonalized: false
 *                   count: 12
 *       500:
 *         description: Erro interno ao gerar recomendações
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro ao gerar recomendações."
 */
router.get("/", optionalAuthMiddleware, obterRecomendacoes);

/**
 * @swagger
 * /api/recommendations/insights:
 *   get:
 *     summary: Obtém insights sobre preferências do usuário
 *     description: |
 *       Retorna análise detalhada das preferências do usuário baseada em sua wishlist.
 *
 *       **Insights incluídos:**
 *       - Total de itens na wishlist
 *       - Marcas favoritas (ordenadas por frequência)
 *       - Faixa de preço preferida (mínimo, máximo, média)
 *       - Materiais de caixa mais escolhidos
 *       - Movimentos preferidos
 *       - Cores de mostrador favoritas
 *       - Condição mais comum
 *       - Ano médio dos relógios favoritados
 *
 *       **Nota:** Requer autenticação. Se a wishlist estiver vazia, retorna mensagem informativa.
 *     tags: [Recomendações]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Insights retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 insights:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     totalWishlistItems:
 *                       type: integer
 *                       description: Número total de relógios na wishlist
 *                       example: 8
 *                     favoriteBrands:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Marcas favoritas ordenadas por frequência
 *                       example: ["Rolex", "Omega", "Cartier"]
 *                     priceRange:
 *                       type: object
 *                       properties:
 *                         min:
 *                           type: number
 *                           nullable: true
 *                           description: Preço mínimo dos relógios favoritados
 *                           example: 25000
 *                         max:
 *                           type: number
 *                           nullable: true
 *                           description: Preço máximo dos relógios favoritados
 *                           example: 85000
 *                         average:
 *                           type: number
 *                           nullable: true
 *                           description: Preço médio dos relógios favoritados
 *                           example: 52000
 *                     preferredMaterials:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Materiais de caixa preferidos
 *                       example: ["Aço inoxidável", "Ouro amarelo"]
 *                     preferredMovements:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Tipos de movimento preferidos
 *                       example: ["Automático", "Manual"]
 *                     preferredColors:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Cores de mostrador preferidas
 *                       example: ["Preto", "Azul", "Branco"]
 *                     mostCommonCondition:
 *                       type: string
 *                       nullable: true
 *                       description: Condição mais comum nos relógios favoritados
 *                       example: "Excelente"
 *                     averageYear:
 *                       type: integer
 *                       nullable: true
 *                       description: Ano médio dos relógios favoritados
 *                       example: 2020
 *                 message:
 *                   type: string
 *                   description: Mensagem de status
 *                   example: "Insights gerados com sucesso."
 *             examples:
 *               withData:
 *                 summary: Usuário com wishlist preenchida
 *                 value:
 *                   insights:
 *                     totalWishlistItems: 8
 *                     favoriteBrands: ["Rolex", "Omega", "Cartier"]
 *                     priceRange:
 *                       min: 25000
 *                       max: 85000
 *                       average: 52000
 *                     preferredMaterials: ["Aço inoxidável", "Ouro amarelo"]
 *                     preferredMovements: ["Automático"]
 *                     preferredColors: ["Preto", "Azul"]
 *                     mostCommonCondition: "Excelente"
 *                     averageYear: 2020
 *                   message: "Insights gerados com sucesso."
 *               emptyWishlist:
 *                 summary: Usuário com wishlist vazia
 *                 value:
 *                   message: "Adicione relógios à sua wishlist para ver insights personalizados."
 *                   insights: null
 *       401:
 *         description: Autenticação necessária
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Autenticação necessária para visualizar insights."
 *       500:
 *         description: Erro interno ao gerar insights
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro ao gerar insights do usuário."
 */
router.get("/insights", authMiddleware, obterInsightsUsuario);

module.exports = router;
