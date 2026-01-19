const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
  listarEnderecos,
  buscarEndereco,
  criarEndereco,
  atualizarEndereco,
  deletarEndereco,
  definirComoPadrao,
} = require("../controllers/addressController");

// ============================================
// TODAS AS ROTAS EXIGEM AUTENTICAÇÃO
// ============================================
router.use(authMiddleware);

/**
 * @swagger
 * /api/addresses:
 *   get:
 *     summary: Lista todos os endereços do usuário
 *     tags: [Endereços]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de endereços retornada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 addresses:
 *                   type: array
 *                   items:
 *                     type: object
 *                 count:
 *                   type: integer
 */
router.get("/", listarEnderecos);

/**
 * @swagger
 * /api/addresses/{id}:
 *   get:
 *     summary: Busca um endereço específico
 *     tags: [Endereços]
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
 *         description: Endereço encontrado
 *       404:
 *         description: Endereço não encontrado
 */
router.get("/:id", buscarEndereco);

/**
 * @swagger
 * /api/addresses:
 *   post:
 *     summary: Cria um novo endereço
 *     tags: [Endereços]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientName
 *               - street
 *               - number
 *               - neighborhood
 *               - city
 *               - state
 *               - zipCode
 *               - country
 *             properties:
 *               label:
 *                 type: string
 *                 example: "Casa"
 *               recipientName:
 *                 type: string
 *                 example: "João Silva"
 *               street:
 *                 type: string
 *                 example: "Rua das Flores"
 *               number:
 *                 type: string
 *                 example: "123"
 *               complement:
 *                 type: string
 *                 example: "Apto 45"
 *               neighborhood:
 *                 type: string
 *                 example: "Centro"
 *               city:
 *                 type: string
 *                 example: "São Paulo"
 *               state:
 *                 type: string
 *                 example: "SP"
 *               zipCode:
 *                 type: string
 *                 example: "01234-567"
 *               country:
 *                 type: string
 *                 example: "Brasil"
 *               phone:
 *                 type: string
 *                 example: "+55 11 98765-4321"
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Endereço criado com sucesso
 *       400:
 *         description: Campos obrigatórios faltando
 */
router.post("/", criarEndereco);

/**
 * @swagger
 * /api/addresses/{id}:
 *   put:
 *     summary: Atualiza um endereço
 *     tags: [Endereços]
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
 *     responses:
 *       200:
 *         description: Endereço atualizado
 *       404:
 *         description: Endereço não encontrado
 */
router.put("/:id", atualizarEndereco);

/**
 * @swagger
 * /api/addresses/{id}:
 *   delete:
 *     summary: Remove um endereço (soft delete)
 *     tags: [Endereços]
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
 *         description: Endereço removido
 *       404:
 *         description: Endereço não encontrado
 */
router.delete("/:id", deletarEndereco);

/**
 * @swagger
 * /api/addresses/{id}/set-default:
 *   patch:
 *     summary: Define um endereço como padrão
 *     tags: [Endereços]
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
 *         description: Endereço definido como padrão
 *       404:
 *         description: Endereço não encontrado
 */
router.patch("/:id/set-default", definirComoPadrao);

module.exports = router;
