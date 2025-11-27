const rateLimit = require("express-rate-limit");

// ========================================
// RATE LIMITER GERAL
// ========================================

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Muitas requisições deste IP. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    console.warn(`⚠️ Rate limit excedido: ${req.ip} - ${req.method} ${req.path}`);
    res.status(429).json({
      error: "Muitas requisições deste IP. Tente novamente em 15 minutos.",
      retryAfter: "15 minutos",
    });
  },
});

// ========================================
// RATE LIMITER PARA AUTENTICAÇÃO (POR EMAIL)
// ========================================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,

  // ✅ Usa email como chave (cada conta tem seu próprio limite)
  keyGenerator: (req, res) => {
    // Se tem email no body, usa email
    // Senão, usa a função padrão (que trata IPv6 corretamente)
    if (req.body && req.body.email) {
      return `email:${req.body.email.toLowerCase()}`;
    }
    // Retorna undefined para usar a chave padrão (IP)
    return undefined;
  },

  message: {
    error: "Muitas tentativas de login nesta conta. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,

  handler: (req, res) => {
    const identifier = req.body?.email || req.ip;
    console.warn(`🚨 Tentativa de brute force bloqueada: ${identifier}`);
    res.status(429).json({
      error: "Muitas tentativas de login. Tente novamente em 15 minutos.",
      retryAfter: "15 minutos",
    });
  },
});

// ========================================
// RATE LIMITER GLOBAL POR IP
// ========================================

const authIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,

  // ✅ Usa a chave padrão (IP) - não precisa keyGenerator customizado
  // A biblioteca já trata IPv6 corretamente por padrão

  message: {
    error: "Muitas tentativas de login deste IP. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    console.warn(`🚨 IP bloqueado por excesso de tentativas: ${req.ip}`);
    res.status(429).json({
      error: "Muitas tentativas de login deste IP. Tente novamente em 15 minutos.",
      retryAfter: "15 minutos",
    });
  },
});

// ========================================
// RATE LIMITER PARA UPLOADS
// ========================================

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    error: "Limite de uploads atingido. Tente novamente em 1 hora.",
  },
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    console.warn(`⚠️ Limite de upload excedido: ${req.ip} - ${req.path}`);
    res.status(429).json({
      error: "Limite de uploads atingido. Tente novamente em 1 hora.",
      retryAfter: "1 hora",
    });
  },
});

// ========================================
// RATE LIMITER PARA VERIFICAÇÃO
// ========================================

const verificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    error: "Limite de envio de documentos atingido. Tente novamente em 1 hora.",
  },
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    console.warn(`⚠️ Limite de verificação excedido: ${req.user?.email || req.ip}`);
    res.status(429).json({
      error: "Limite de envio de documentos atingido. Tente novamente em 1 hora.",
      retryAfter: "1 hora",
    });
  },
});

// ========================================
// RATE LIMITER PARA BUSCA
// ========================================

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: {
    error: "Muitas buscas em pouco tempo. Aguarde um momento.",
  },
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    res.status(429).json({
      error: "Muitas buscas em pouco tempo. Aguarde um momento.",
      retryAfter: "1 minuto",
    });
  },
});

// ========================================
// RATE LIMITER PARA ADMIN
// ========================================

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    error: "Limite de ações administrativas excedido.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ========================================
// EXPORTS
// ========================================

module.exports = {
  generalLimiter,
  authLimiter,
  authIpLimiter,
  uploadLimiter,
  verificationLimiter,
  searchLimiter,
  adminLimiter,
};
