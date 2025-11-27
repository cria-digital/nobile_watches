const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, password, phone, country, state, city, role } = req.body;

    // Verifica se o email já está cadastrado
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email já cadastrado." });
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário
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

    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Email ou senha inválidos." });
    }

    // Compara as senhas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Email ou senha inválidos." });
    }

    // Gera o token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET, // deve estar no .env
      { expiresIn: "7d" }
    );

    // Retorna o token + dados
    res.status(200).json({
      message: "Login realizado com sucesso.",
      token,
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

// Endpoint para enviar documentos de verificação
const submitVerification = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("=== DEBUG SUBMIT VERIFICATION ===");
    console.log("User ID:", userId);
    console.log("req.files:", req.files);

    // Verifica se os arquivos foram enviados
    // Quando usamos upload.fields(), req.files é um objeto, não array
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

    // Os arquivos vêm do multer (Cloudinary) como arrays
    const documentFront = req.files.documentFront[0];
    const documentBack = req.files.documentBack[0];
    const selfie = req.files.selfie[0];

    console.log("Document Front:", documentFront.path);
    console.log("Document Back:", documentBack.path);
    console.log("Selfie:", selfie.path);

    // Atualiza o usuário com as URLs das imagens
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

// Endpoint para admin aprovar/rejeitar verificação
const verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // "approved" ou "rejected"
    const requestingUserRole = req.user.role;

    // Apenas admins podem verificar usuários
    if (requestingUserRole !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Apenas administradores podem verificar usuários." });
    }

    // Verifica se o usuário existe
    const userToVerify = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!userToVerify) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Verifica se o status é válido
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        error: 'Status inválido. Use "approved" ou "rejected".',
      });
    }

    // Atualiza o status de verificação e role
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        isVerified: status === "approved",
        verificationStatus: status,
        // Promove automaticamente para SELLER quando aprovado
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

// Endpoint para usuário consultar status da verificação
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
  submitVerification,
  verifyUser,
  getVerificationStatus,
};
