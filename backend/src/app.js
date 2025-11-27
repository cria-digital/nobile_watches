const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const prisma = require("./config/prisma");

// ========================================
// CONFIGURAÇÃO PARA PRODUÇÃO (PROXY)
// ========================================

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "https://res.cloudinary.com", "data:"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL
      : ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

const { generalLimiter } = require("./config/rateLimiter");
app.use("/api/", generalLimiter);

// ========================================
// MIDDLEWARES PADRÃO
// ========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// ROTAS
// ========================================

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const watchRoutes = require("./routes/watchRoutes");
const orderRoutes = require("./routes/orderRoutes");
const listingRoutes = require("./routes/listingRoutes");
const messageRoutes = require("./routes/messageRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const priceHistoryRoutes = require("./routes/priceHistoryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminLogRoutes = require("./routes/adminLogRoutes");
const searchRoutes = require("./routes/searchRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerConfig");

// ========================================
// REGISTRAR ROTAS
// ========================================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/watches", watchRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/price-history", priceHistoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminLogRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ========================================
// ROTA RAIZ
// ========================================

app.get("/", (req, res) => {
  res.json({
    message: "API Nobile está no ar 🚀",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// ========================================
// ROTA DE TESTE DO BANCO
// ========================================

app.get("/teste-bd", async (req, res) => {
  try {
    const [users, watches, orders, messages, collections] = await Promise.all([
      prisma.user.count(),
      prisma.watch.count(),
      prisma.order.count(),
      prisma.message.count(),
      prisma.collection.count(),
    ]);

    res.json({
      status: "✅ Banco acessado com sucesso!",
      statistics: {
        users,
        watches,
        orders,
        messages,
        collections,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Erro ao acessar banco:", err);
    res.status(500).json({
      error: "Falha ao consultar banco de dados",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// ========================================
// ROTA 404
// ========================================

app.use((req, res) => {
  res.status(404).json({
    error: "Rota não encontrada",
    path: req.path,
    method: req.method,
  });
});

// ========================================
// MIDDLEWARE DE ERRO GLOBAL
// ========================================

app.use((err, req, res, next) => {
  console.error("❌ Erro:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Erro do Prisma
  if (err.code?.startsWith("P")) {
    return res.status(400).json({
      error: "Erro no banco de dados",
      ...(process.env.NODE_ENV === "development" && { details: err.message }),
    });
  }

  // Erro de validação do Multer
  if (err.name === "MulterError") {
    return res.status(400).json({
      error: "Erro no upload de arquivo",
      details: err.message,
    });
  }

  // Erro do JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Token inválido" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expirado" });
  }

  // Erro genérico
  res.status(err.status || 500).json({
    error: err.message || "Erro interno do servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ========================================
// INICIAR SERVIDOR
// ========================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   🚀 Servidor Nobile Iniciado       ║
╟──────────────────────────────────────╢
║  📍 Porta: ${PORT.toString().padEnd(27)}║
║  🌍 Ambiente: ${(process.env.NODE_ENV || "development").padEnd(21)}║
║  📚 Docs: http://localhost:${PORT}/api-docs  ║
╚══════════════════════════════════════╝
  `);
});

// ========================================
// TRATAMENTO DE ERROS NÃO CAPTURADOS
// ========================================

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", error => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});
