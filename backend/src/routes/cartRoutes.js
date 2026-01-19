const express = require("express");
const router = express.Router();

const {
  adicionarItemAoCarrinho,
  listarItensDoCarrinho,
  removerItemDoCarrinho,
  limparCarrinho,
  contarItensDoCarrinho,
} = require("../controllers/cartController");

const authMiddleware = require("../middlewares/authMiddleware");

// ============================================
// TODAS AS ROTAS EXIGEM AUTENTICAÇÃO
// ============================================
router.use(authMiddleware);

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     summary: Adiciona um item ao carrinho
 *     description: Adiciona um relógio ao carrinho do usuário logado
 *     tags: [Carrinho]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - watchId
 *             properties:
 *               watchId:
 *                 type: integer
 *                 description: ID do relógio
 *                 example: 1
 *               listingId:
 *                 type: integer
 *                 description: ID do anúncio (opcional)
 *                 example: 5
 *     responses:
 *       201:
 *         description: Item adicionado com sucesso
 *       400:
 *         description: Relógio já está no carrinho ou é do próprio usuário
 *       404:
 *         description: Relógio não encontrado
 */
router.post("/items", adicionarItemAoCarrinho);

/**
 * @swagger
 * /api/cart/items:
 *   get:
 *     summary: Lista todos os itens do carrinho
 *     description: Retorna todos os itens do carrinho do usuário logado
 *     tags: [Carrinho]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de itens retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/items", listarItensDoCarrinho);

/**
 * @swagger
 * /api/cart/items/{itemId}:
 *   delete:
 *     summary: Remove um item do carrinho
 *     description: Remove um item específico do carrinho
 *     tags: [Carrinho]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: itemId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do item do carrinho
 *     responses:
 *       200:
 *         description: Item removido com sucesso
 *       403:
 *         description: Sem permissão para remover este item
 *       404:
 *         description: Item não encontrado
 */
router.delete("/items/:itemId", removerItemDoCarrinho);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Limpa todo o carrinho
 *     description: Remove todos os itens do carrinho do usuário
 *     tags: [Carrinho]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrinho limpo com sucesso
 */
router.delete("/", limparCarrinho);

/**
 * @swagger
 * /api/cart/count:
 *   get:
 *     summary: Conta itens no carrinho
 *     description: Retorna o número de itens no carrinho
 *     tags: [Carrinho]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contagem retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 3
 */
router.get("/count", contarItensDoCarrinho);

module.exports = router;
