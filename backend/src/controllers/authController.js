// backend/src/controllers/authController.js

const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");

// ========================================
// CONFIGURAÇÃO DE COOKIES
// ========================================

const COOKIE_OPTIONS = {
  httpOnly: true, // Não acessível via JavaScript (proteção XSS)
  secure: process.env.NODE_ENV === "production", // HTTPS only em produção
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' para cross-origin em produção
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias em milissegundos
  path: "/", // Cookie disponível em todas as rotas
};

const register = async (req, res) => {
  try {
    const { name, email, password, phone, country, state, city, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email já cadastrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        country,
        state,
        city,
        role: role?.toUpperCase() || "BUYER",
      },
    });

    // ✅ Gera token e envia como cookie
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, COOKIE_OPTIONS);

    res.status(201).json({
      message: "Usuário registrado com sucesso.",
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error("Erro no register:", error);
    res.status(500).json({ error: "Erro ao registrar usuário." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Email ou senha inválidos." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Email ou senha inválidos." });
    }

    // ✅ Gera token e envia como cookie
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, COOKIE_OPTIONS);

    res.status(200).json({
      message: "Login realizado com sucesso.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro ao realizar login." });
  }
};

// ✅ NOVO - Endpoint de logout
const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.json({
      message: "Logout realizado com sucesso.",
    });
  } catch (error) {
    console.error("Erro no logout:", error);
    res.status(500).json({ error: "Erro ao realizar logout." });
  }
};

// Endpoint para enviar documentos de verificação
const submitVerification = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("=== DEBUG SUBMIT VERIFICATION ===");
    console.log("User ID:", userId);
    console.log("req.files:", req.files);

    if (
      !req.files ||
      !req.files.documentFront ||
      !req.files.documentBack ||
      !req.files.selfie
    ) {
      console.log("Arquivos faltando!");
      return res.status(400).json({
        error: "É necessário enviar 3 imagens: documentFront, documentBack e selfie.",
      });
    }

    const documentFront = req.files.documentFront[0];
    const documentBack = req.files.documentBack[0];
    const selfie = req.files.selfie[0];

    console.log("Document Front:", documentFront.path);
    console.log("Document Back:", documentBack.path);
    console.log("Selfie:", selfie.path);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        documentFrontUrl: documentFront.path,
        documentBackUrl: documentBack.path,
        selfieUrl: selfie.path,
        verificationStatus: "pending",
        verificationSubmittedAt: new Date(),
      },
    });

    console.log("Usuário atualizado com sucesso!");

    res.json({
      message: "Documentos enviados com sucesso! Sua verificação está em análise.",
      user: {
        id: updatedUser.id,
        verificationStatus: updatedUser.verificationStatus,
        verificationSubmittedAt: updatedUser.verificationSubmittedAt,
      },
    });
  } catch (error) {
    console.error("=== ERRO DETALHADO ===");
    console.error("Mensagem:", error.message);
    console.error("Stack:", error.stack);
    console.error("Erro completo:", JSON.stringify(error, null, 2));
    res.status(500).json({
      error: "Erro ao enviar documentos de verificação.",
      details: error.message,
    });
  }
};

const verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    const requestingUserRole = req.user.role;

    if (requestingUserRole !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Apenas administradores podem verificar usuários." });
    }

    const userToVerify = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!userToVerify) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        error: 'Status inválido. Use "approved" ou "rejected".',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        isVerified: status === "approved",
        verificationStatus: status,
        role: status === "approved" ? "SELLER" : userToVerify.role,
      },
    });

    res.json({
      message:
        status === "approved"
          ? "Usuário verificado e promovido a vendedor com sucesso."
          : "Verificação rejeitada.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        verificationStatus: updatedUser.verificationStatus,
      },
    });
  } catch (error) {
    console.error("Erro na verificação:", error);
    res.status(500).json({ error: "Erro ao processar verificação." });
  }
};

const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        verificationStatus: true,
        verificationSubmittedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.json({
      user,
    });
  } catch (error) {
    console.error("Erro ao consultar status:", error);
    res.status(500).json({ error: "Erro ao consultar status de verificação." });
  }
};

module.exports = {
  register,
  login,
  logout,
  submitVerification,
  verifyUser,
  getVerificationStatus,
};
