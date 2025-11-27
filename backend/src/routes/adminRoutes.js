const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdmin");
const { adminLimiter } = require("../config/rateLimiter");

// ============================================
// MIDDLEWARES - APLICADOS EM TODAS AS ROTAS
// ============================================
// Todas as rotas de admin exigem:
// 1. Autenticação válida (JWT)
// 2. Permissão de ADMIN
// 3. Rate limiting para proteção extra

router.use(authMiddleware);
router.use(isAdmin);
router.use(adminLimiter);

// ============================================
// ROTAS ADMINISTRATIVAS
// ============================================

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Gera relatórios administrativos do sistema
 *     description: |
 *       Retorna estatísticas gerais do sistema incluindo:
 *       - Total de usuários cadastrados
 *       - Total de relógios no marketplace
 *       - Total de pedidos realizados
 *       - Total de vendas concluídas (status "pago" ou "entregue")
 *
 *       **Apenas administradores** podem acessar esta rota.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Relatórios gerados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsuarios:
 *                   type: integer
 *                   example: 150
 *                 totalRelogios:
 *                   type: integer
 *                   example: 320
 *                 totalPedidos:
 *                   type: integer
 *                   example: 75
 *                 totalVendas:
 *                   type: integer
 *                   example: 62
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token de autenticação não fornecido."
 *       403:
 *         description: Acesso negado (não é admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Acesso restrito a administradores."
 *       429:
 *         description: Limite de requisições excedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Limite de ações administrativas excedido."
 *                 retryAfter:
 *                   type: string
 *                   example: "15 minutos"
 *       500:
 *         description: Erro interno ao gerar relatórios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro ao gerar relatórios administrativos."
 */
router.get("/reports", adminController.gerarRelatorios);

module.exports = router;
