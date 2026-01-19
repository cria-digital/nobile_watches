// backend/src/config/rateLimiter.js
const rateLimit = require("express-rate-limit");

// ========================================
// CONFIGURAÇÃO BASE OTIMIZADA
// ========================================
const defaultConfig = {
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

// ========================================
// RATE LIMITER GERAL - MAIS PERMISSIVO
// ========================================
const generalLimiter = rateLimit({
  ...defaultConfig,
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // ✅ Aumentado de 100 para 200
  message: {
    error: "Muitas requisições deste IP. Tente novamente em 15 minutos.",
  },
  // ✅ Skip automático para health checks (não gasta rate limit)
  skip: req => {
    return (
      req.path === "/health" ||
      req.path === "/teste-bd" ||
      req.path === "/" ||
      req.path === "/api-docs"
    );
  },
  handler: (req, res) => {
    console.warn(`⚠️ Rate limit geral excedido: ${req.ip} - ${req.method} ${req.path}`);
    res.status(429).json({
      error: "Muitas requisições deste IP. Tente novamente em 15 minutos.",
      retryAfter: "15 minutos",
    });
  },
});

// ========================================
// AUTH LIMITERS - MENOS RESTRITIVOS
// ========================================
const authLimiter = rateLimit({
  ...defaultConfig,
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // ✅ Aumentado de 5 para 10 tentativas
  keyGenerator: req => {
    if (req.body && req.body.email) {
      return `email:${req.body.email.toLowerCase()}`;
    }
    return undefined;
  },
  skipSuccessfulRequests: true, // ✅ Não conta logins bem-sucedidos
  message: {
    error: "Muitas tentativas de login nesta conta. Tente novamente em 15 minutos.",
  },
  handler: (req, res) => {
    const identifier = req.body?.email || req.ip;
    console.warn(`🚨 Tentativa de brute force bloqueada: ${identifier}`);
    res.status(429).json({
      error: "Muitas tentativas de login. Tente novamente em 15 minutos.",
      retryAfter: "15 minutos",
    });
  },
});

const authIpLimiter = rateLimit({
  ...defaultConfig,
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // ✅ Aumentado de 15 para 30 tentativas
  message: {
    error: "Muitas tentativas de login deste IP. Tente novamente em 15 minutos.",
  },
  handler: (req, res) => {
    console.warn(`🚨 IP bloqueado por excesso de tentativas: ${req.ip}`);
    res.status(429).json({
      error: "Muitas tentativas de login deste IP. Tente novamente em 15 minutos.",
      retryAfter: "15 minutos",
    });
  },
});

// ========================================
// OUTROS LIMITERS
// ========================================
const uploadLimiter = rateLimit({
  ...defaultConfig,
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 15, // ✅ Aumentado de 10 para 15 uploads
  message: {
    error: "Limite de uploads atingido. Tente novamente em 1 hora.",
  },
  handler: (req, res) => {
    console.warn(`⚠️ Limite de upload excedido: ${req.ip} - ${req.path}`);
    res.status(429).json({
      error: "Limite de uploads atingido. Tente novamente em 1 hora.",
      retryAfter: "1 hora",
    });
  },
});

const verificationLimiter = rateLimit({
  ...defaultConfig,
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // ✅ Aumentado de 3 para 5 tentativas
  message: {
    error: "Limite de envio de documentos atingido. Tente novamente em 1 hora.",
  },
  handler: (req, res) => {
    console.warn(`⚠️ Limite de verificação excedido: ${req.user?.email || req.ip}`);
    res.status(429).json({
      error: "Limite de envio de documentos atingido. Tente novamente em 1 hora.",
      retryAfter: "1 hora",
    });
  },
});

const searchLimiter = rateLimit({
  ...defaultConfig,
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 60, // ✅ Aumentado de 30 para 60 buscas
  message: {
    error: "Muitas buscas em pouco tempo. Aguarde um momento.",
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "Muitas buscas em pouco tempo. Aguarde um momento.",
      retryAfter: "1 minuto",
    });
  },
});

const adminLimiter = rateLimit({
  ...defaultConfig,
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // ✅ Aumentado de 50 para 100 ações
  message: {
    error: "Limite de ações administrativas excedido.",
  },
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
