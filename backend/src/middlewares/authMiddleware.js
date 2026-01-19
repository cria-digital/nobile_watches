// backend/src/middlewares/authMiddleware.js

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // ✅ ATUALIZADO - Lê do cookie ao invés do header
  const token = req.cookies.token;

  // Verifica se o token foi enviado
  if (!token) {
    return res.status(401).json({ error: "Token de autenticação não fornecido." });
  }

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Injeta os dados do usuário na requisição
    req.user = decoded;

    // Continua para o próximo middleware/controller
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token inválido ou expirado." });
  }
};

module.exports = authMiddleware;
