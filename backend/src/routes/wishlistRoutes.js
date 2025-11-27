const express = require("express");
const router = express.Router();
const {
  adicionarRelogioNaWishlist,
  listarWishlistDoUsuario,
  removerRelogioDaWishlist,
  verificarSeEstaNaWishlist,
} = require("../controllers/wishlistController");

const authMiddleware = require("../middlewares/authMiddleware");

// Todas as rotas exigem autenticação
router.use(authMiddleware);

/**
 * @swagger
 * /api/wishlist:
 *   post:
 *     summary: Adiciona um relógio à wishlist do usuário logado
 *     tags: [Wishlist]
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
 *                 description: ID do relógio a ser adicionado
 *                 example: 1
 *     responses:
 *       201:
 *         description: Relógio adicionado à wishlist com sucesso
 *       400:
 *         description: Relógio já está na wishlist
 *       404:
 *         description: Relógio não encontrado
 */
router.post("/", adicionarRelogioNaWishlist);

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Lista todos os relógios da wishlist do usuário logado
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de relógios da wishlist retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   userId:
 *                     type: integer
 *                   watchId:
 *                     type: integer
 *                   addedAt:
 *                     type: string
 *                     format: date-time
 *                   watch:
 *                     type: object
 */
router.get("/", listarWishlistDoUsuario);

/**
 * @swagger
 * /api/wishlist/check/{watchId}:
 *   get:
 *     summary: Verifica se um relógio está na wishlist do usuário
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: watchId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do relógio a ser verificado
 *     responses:
 *       200:
 *         description: Status verificado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isInWishlist:
 *                   type: boolean
 *                 wishlistId:
 *                   type: integer
 *                   nullable: true
 */
router.get("/check/:watchId", verificarSeEstaNaWishlist);

/**
 * @swagger
 * /api/wishlist/{watchId}:
 *   delete:
 *     summary: Remove um relógio da wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: watchId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do relógio a ser removido
 *     responses:
 *       200:
 *         description: Relógio removido da wishlist com sucesso
 *       404:
 *         description: Relógio não encontrado na wishlist
 */
router.delete("/:watchId", removerRelogioDaWishlist);

module.exports = router;
