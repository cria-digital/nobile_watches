const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma = require("../config/prisma");
const { enviarEmail, templates } = require("../config/email");

// ========================================
// CONSTANTES
// ========================================

const TOKEN_EXPIRATION_HOURS = 1;
const MIN_PASSWORD_LENGTH = 6;

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Gera um código numérico de 6 dígitos
 */
const gerarCodigoNumerico = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Gera um token alfanumérico seguro
 */
const gerarTokenAlfanumerico = () => {
  return crypto.randomBytes(32).toString("hex");
};

// ========================================
// CONTROLLERS
// ========================================

/**
 * Solicita recuperação de senha
 * POST /api/auth/forgot-password
 * Body: { email }
 */
const solicitarRecuperacao = async (req, res) => {
  try {
    const { email } = req.body;

    // Validação básica
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email é obrigatório." });
    }

    const emailLowerCase = email.toLowerCase().trim();

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { email: emailLowerCase },
    });

    // ⚠️ SEGURANÇA: Sempre retorna sucesso, mesmo se o email não existir
    // Isso evita que atacantes descubram quais emails estão cadastrados
    if (!user) {
      console.log(
        `⚠️ Tentativa de recuperação para email não cadastrado: ${emailLowerCase}`
      );
      return res.status(200).json({
        success: true,
        message:
          "Se o email estiver cadastrado, você receberá instruções para recuperação de senha.",
      });
    }

    // Gera token (você pode escolher entre numérico ou alfanumérico)
    const resetToken = gerarCodigoNumerico(); // 6 dígitos
    // const resetToken = gerarTokenAlfanumerico(); // Token longo

    // Define data de expiração
    const resetExpires = new Date(Date.now() + TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000);

    // Salva token no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // Prepara template do email
    const emailTemplate = templates.recuperacaoSenha(
      user.name,
      resetToken,
      `${TOKEN_EXPIRATION_HOURS} hora${TOKEN_EXPIRATION_HOURS > 1 ? "s" : ""}`
    );

    // Envia email
    const emailResult = await enviarEmail({
      para: user.email,
      assunto: emailTemplate.assunto,
      texto: emailTemplate.texto,
      html: emailTemplate.html,
    });

    if (!emailResult.success) {
      console.error("❌ Falha ao enviar email:", emailResult.error);
      // Em produção, você pode querer retornar erro aqui
      // Por segurança, ainda retornamos sucesso para o cliente
    }

    console.log(`✅ Token de recuperação gerado para ${user.email}`);
    console.log(`🔑 Token: ${resetToken}`);
    console.log(`⏰ Expira em: ${resetExpires.toLocaleString("pt-BR")}`);

    res.json({
      success: true,
      message:
        "Se o email estiver cadastrado, você receberá instruções para recuperação de senha.",
      // ⚠️ REMOVA EM PRODUÇÃO - apenas para desenvolvimento:
      ...(process.env.NODE_ENV === "development" && {
        dev: {
          token: resetToken,
          expiresAt: resetExpires,
          email: user.email,
        },
      }),
    });
  } catch (error) {
    console.error("❌ Erro ao solicitar recuperação:", error);
    res.status(500).json({
      error: "Erro ao processar solicitação de recuperação de senha.",
    });
  }
};

/**
 * Valida se o token é válido
 * GET /api/auth/reset-password/:token
 */
const validarToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        valid: false,
        error: "Token não fornecido.",
      });
    }

    // Busca usuário com token válido (não expirado)
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gte: new Date(), // Token ainda não expirou
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        resetPasswordExpires: true,
      },
    });

    if (!user) {
      return res.status(400).json({
        valid: false,
        error: "Token inválido ou expirado.",
      });
    }

    // Calcula tempo restante
    const now = new Date();
    const expiresAt = new Date(user.resetPasswordExpires);
    const minutesRemaining = Math.floor((expiresAt - now) / 1000 / 60);

    console.log(
      `✅ Token validado para ${user.email} - ${minutesRemaining} minutos restantes`
    );

    res.json({
      valid: true,
      message: "Token válido.",
      email: user.email,
      expiresIn: `${minutesRemaining} minuto${minutesRemaining !== 1 ? "s" : ""}`,
    });
  } catch (error) {
    console.error("❌ Erro ao validar token:", error);
    res.status(500).json({
      valid: false,
      error: "Erro ao validar token.",
    });
  }
};

/**
 * Redefine a senha
 * POST /api/auth/reset-password
 * Body: { token, newPassword }
 */
const redefinirSenha = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validações
    if (!token || !newPassword) {
      return res.status(400).json({
        error: "Token e nova senha são obrigatórios.",
      });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        error: `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`,
      });
    }

    // Busca usuário com token válido
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        error: "Token inválido ou expirado. Solicite uma nova recuperação de senha.",
      });
    }

    // Criptografa a nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualiza senha e limpa os campos de reset
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    console.log(`✅ Senha redefinida para ${user.email}`);

    // Envia email de confirmação
    const emailTemplate = templates.senhaAlteradaComSucesso(user.name);
    await enviarEmail({
      para: user.email,
      assunto: emailTemplate.assunto,
      texto: emailTemplate.texto,
      html: emailTemplate.html,
    });

    res.json({
      success: true,
      message:
        "Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.",
    });
  } catch (error) {
    console.error("❌ Erro ao redefinir senha:", error);
    res.status(500).json({
      error: "Erro ao redefinir senha. Tente novamente.",
    });
  }
};

module.exports = {
  solicitarRecuperacao,
  validarToken,
  redefinirSenha,
};
