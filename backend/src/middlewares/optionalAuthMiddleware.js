// backend/src/middlewares/optionalAuthMiddleware.js

const jwt = require("jsonwebtoken");

const optionalAuthMiddleware = (req, res, next) => {
  // ✅ ATUALIZADO - Lê do cookie ao invés do header
  const token = req.cookies.token;

  // Se não há token, continua sem autenticação
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Injeta os dados do usuário na requisição
    req.user = decoded;

    // Continua para o próximo middleware/controller
    next();
  } catch (err) {
    // Se o token é inválido/expirado, continua sem autenticação
    req.user = null;
    next();
  }
};

module.exports = optionalAuthMiddleware;
