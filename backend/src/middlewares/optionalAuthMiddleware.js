const jwt = require("jsonwebtoken");

/**
 * Middleware de autenticação opcional
 *
 * Diferente do authMiddleware normal, este não retorna erro 401
 * se o token não existir. Apenas injeta req.user se houver token válido.
 *
 * Uso: Para rotas que funcionam tanto para usuários autenticados
 * quanto não autenticados, mas com comportamentos diferentes.
 *
 * Exemplos:
 * - Recomendações personalizadas vs genéricas
 * - Conteúdo público com recursos extras para logados
 * - Features que se adaptam ao estado de autenticação
 */
const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Se não há token, continua sem autenticação
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Injeta os dados do usuário na requisição
    req.user = decoded;

    // Continua para o próximo middleware/controller
    next();
  } catch (err) {
    // Se o token é inválido/expirado, continua sem autenticação
    // (não retorna erro)
    req.user = null;
    next();
  }
};

module.exports = optionalAuthMiddleware;
