const express = require("express");
const router = express.Router();
const { buscarUsuarioLogado } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// Todas as rotas exigem autenticação
router.use(authMiddleware);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Retorna os dados do usuário logado
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário retornados com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       404:
 *         description: Usuário não encontrado
 */
router.get("/me", buscarUsuarioLogado);

module.exports = router;
