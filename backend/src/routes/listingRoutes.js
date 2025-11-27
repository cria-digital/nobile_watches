const express = require("express");
const router = express.Router();
const {
  criarAnuncio,
  listarMeusAnuncios,
  listarAnunciosAtivos,
  buscarAnuncioPorId,
  atualizarAnuncio,
  publicarAnuncio,
  pausarAnuncio,
  reativarAnuncio,
  cancelarAnuncio,
  deletarAnuncio,
  marcarComoVendido,
} = require("../controllers/listingController");
const authMiddleware = require("../middlewares/authMiddleware");

// ============================================
// ROTAS PÚBLICAS
// ============================================

/**
 * @swagger
 * /api/listings/active:
 *   get:
 *     summary: Lista todos os anúncios ativos (público)
 *     tags: [Anúncios]
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista de anúncios ativos retornada com sucesso
 */
router.get("/active", listarAnunciosAtivos);

// ============================================
// ROTAS PRIVADAS (exigem autenticação)
// ============================================

router.use(authMiddleware);

/**
 * @swagger
 * /api/listings/my-listings:
 *   get:
 *     summary: Lista todos os anúncios do vendedor logado
 *     tags: [Anúncios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, PAUSED, SOLD, CANCELLED]
 *         description: Filtrar por status do anúncio
 *     responses:
 *       200:
 *         description: Lista de anúncios retornada com sucesso
 */
router.get("/my-listings", listarMeusAnuncios);

/**
 * @swagger
 * /api/listings:
 *   post:
 *     summary: Cria um novo anúncio (rascunho ou publicado)
 *     tags: [Anúncios]
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
 *                 description: ID do relógio a ser anunciado
 *               shippingInfo:
 *                 type: string
 *                 description: Informações de envio
 *               returnPolicy:
 *                 type: string
 *                 description: Política de devolução
 *               deliveryTime:
 *                 type: string
 *                 description: Prazo de entrega estimado
 *               negotiable:
 *                 type: boolean
 *                 description: Se o preço é negociável
 *               publishNow:
 *                 type: boolean
 *                 description: Se true, publica imediatamente; se false, cria como rascunho
 *     responses:
 *       201:
 *         description: Anúncio criado com sucesso
 *       400:
 *         description: Erro ao criar anúncio
 */
router.post("/", criarAnuncio);

/**
 * @swagger
 * /api/listings/{id}:
 *   get:
 *     summary: Busca um anúncio específico por ID
 *     tags: [Anúncios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Anúncio encontrado
 *       404:
 *         description: Anúncio não encontrado
 */
router.get("/:id", buscarAnuncioPorId);

/**
 * @swagger
 * /api/listings/{id}:
 *   put:
 *     summary: Atualiza informações de um anúncio
 *     tags: [Anúncios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shippingInfo:
 *                 type: string
 *               returnPolicy:
 *                 type: string
 *               deliveryTime:
 *                 type: string
 *               negotiable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Anúncio atualizado com sucesso
 *       403:
 *         description: Sem permissão para atualizar este anúncio
 *       404:
 *         description: Anúncio não encontrado
 */
router.put("/:id", atualizarAnuncio);

/**
 * @swagger
 * /api/listings/{id}/publish:
 *   put:
 *     summary: Publica um anúncio que estava em rascunho
 *     tags: [Anúncios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Anúncio publicado com sucesso
 *       400:
 *         description: Anúncio não está em rascunho
 *       403:
 *         description: Sem permissão para publicar este anúncio
 */
router.put("/:id/publish", publicarAnuncio);

/**
 * @swagger
 * /api/listings/{id}/pause:
 *   put:
 *     summary: Pausa um anúncio ativo
 *     tags: [Anúncios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Anúncio pausado com sucesso
 *       400:
 *         description: Anúncio não está ativo
 */
router.put("/:id/pause", pausarAnuncio);

/**
 * @swagger
 * /api/listings/{id}/reactivate:
 *   put:
 *     summary: Reativa um anúncio pausado
 *     tags: [Anúncios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Anúncio reativado com sucesso
 *       400:
 *         description: Anúncio não está pausado
 */
router.put("/:id/reactivate", reativarAnuncio);

/**
 * @swagger
 * /api/listings/{id}/cancel:
 *   put:
 *     summary: Cancela um anúncio
 *     tags: [Anúncios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Anúncio cancelado com sucesso
 *       400:
 *         description: Não é possível cancelar anúncio vendido
 */
router.put("/:id/cancel", cancelarAnuncio);

/**
 * @swagger
 * /api/listings/{id}/mark-sold:
 *   put:
 *     summary: Marca um anúncio como vendido
 *     tags: [Anúncios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Anúncio marcado como vendido
 */
router.put("/:id/mark-sold", marcarComoVendido);

/**
 * @swagger
 * /api/listings/{id}:
 *   delete:
 *     summary: Deleta um anúncio (apenas rascunhos ou cancelados sem pedidos)
 *     tags: [Anúncios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Anúncio deletado com sucesso
 *       400:
 *         description: Não é possível deletar este anúncio
 */
router.delete("/:id", deletarAnuncio);

module.exports = router;
