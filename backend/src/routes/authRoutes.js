const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  submitVerification,
  verifyUser,
  getVerificationStatus,
} = require("../controllers/authController");
const {
  solicitarRecuperacao,
  validarToken,
  redefinirSenha,
} = require("../controllers/passwordResetController");

const authMiddleware = require("../middlewares/authMiddleware");
const { uploadVerification } = require("../config/cloudinary");

const {
  authLimiter,
  authIpLimiter,
  verificationLimiter,
} = require("../config/rateLimiter");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *               - tipo
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [SELLER, BUYER, ADMIN]
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Dados inválidos ou e-mail já existente
 */
router.post("/register", authIpLimiter, authLimiter, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza o login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login bem-sucedido com token JWT
 *       401:
 *         description: Credenciais inválidas
 */
router.post("/login", authIpLimiter, authLimiter, login);

/**
 * @swagger
 * /api/auth/submit-verification:
 *   post:
 *     summary: Envia documentos para verificação de usuário
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - documentFront
 *               - documentBack
 *               - selfie
 *             properties:
 *               documentFront:
 *                 type: string
 *                 format: binary
 *                 description: Foto da frente do documento
 *               documentBack:
 *                 type: string
 *                 format: binary
 *                 description: Foto do verso do documento
 *               selfie:
 *                 type: string
 *                 format: binary
 *                 description: Selfie do usuário
 *     responses:
 *       200:
 *         description: Documentos enviados com sucesso
 *       400:
 *         description: Faltam documentos
 */
router.post(
  "/submit-verification",
  authMiddleware,
  verificationLimiter,
  uploadVerification.fields([
    { name: "documentFront", maxCount: 1 },
    { name: "documentBack", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  submitVerification
);

/**
 * @swagger
 * /api/auth/verification-status:
 *   get:
 *     summary: Consulta o status da verificação do usuário logado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status da verificação retornado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
router.get("/verification-status", authMiddleware, getVerificationStatus);

/**
 * @swagger
 * /api/auth/verify/{userId}:
 *   put:
 *     summary: Aprova ou rejeita verificação de usuário (apenas admin)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID do usuário a ser verificado
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: Status da verificação
 *     responses:
 *       200:
 *         description: Verificação processada com sucesso
 *       403:
 *         description: Sem permissão (não é admin)
 *       404:
 *         description: Usuário não encontrado
 */
router.put("/verify/:userId", authMiddleware, verifyUser);

// ========================================
// RECUPERAÇÃO DE SENHA
// ========================================

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicita recuperação de senha
 *     description: Envia um código de verificação para o email do usuário para recuperação de senha
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@exemplo.com
 *     responses:
 *       200:
 *         description: Instruções enviadas se o email existir
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Email não fornecido
 *       429:
 *         description: Muitas tentativas
 */
router.post("/forgot-password", authIpLimiter, authLimiter, solicitarRecuperacao);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   get:
 *     summary: Valida se o token de recuperação é válido
 *     description: Verifica se o token existe e ainda não expirou
 *     tags: [Auth]
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de recuperação (6 dígitos)
 *         example: "123456"
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 email:
 *                   type: string
 *                 expiresIn:
 *                   type: string
 *       400:
 *         description: Token inválido ou expirado
 */
router.get("/reset-password/:token", validarToken);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Redefine a senha usando o token
 *     description: Redefine a senha do usuário após validação do token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "NovaSenha123!"
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Token inválido, expirado ou senha inválida
 *       429:
 *         description: Muitas tentativas
 */
router.post("/reset-password", authIpLimiter, redefinirSenha);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Realiza logout do usuário (limpa cookie)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 */
router.post("/logout", authMiddleware, logout);

module.exports = router;
