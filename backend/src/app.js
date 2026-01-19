const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
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

// ========================================
// MIDDLEWARES PADRÃO
// ========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ========================================
// ✅ HEALTH CHECK - SUPER RÁPIDO (SEM RATE LIMIT)
// ========================================
// Este endpoint é usado para:
// 1. Serviços de uptime monitoring (UptimeRobot, etc)
// 2. Verificar se o servidor está acordado (cold start)
// 3. Health checks do Render
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ========================================
// RATE LIMITER - APLICADO APÓS HEALTH CHECK
// ========================================
const { generalLimiter } = require("./config/rateLimiter");
app.use("/api/", generalLimiter);

// ========================================
// ROTAS
// ========================================
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const addressRoutes = require("./routes/addressRoutes");
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
const cartRoutes = require("./routes/cartRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerConfig");

// ========================================
// REGISTRAR ROTAS
// ========================================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/addresses", addressRoutes);
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
app.use("/api/cart", cartRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ========================================
// ROTA RAIZ
// ========================================
app.get("/", (req, res) => {
  res.json({
    message: "API Nobile está no ar 🚀",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      health: "/health",
      docs: "/api-docs",
      testDb: "/teste-bd",
    },
  });
});

// ========================================
// ROTA DE TESTE DO BANCO (OTIMIZADA)
// ========================================
app.get("/teste-bd", async (req, res) => {
  try {
    // ✅ Usa $queryRaw que é mais rápido que count() múltiplos
    const [result] = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM "User") as users,
        (SELECT COUNT(*) FROM "Watch") as watches,
        (SELECT COUNT(*) FROM "Order") as orders,
        (SELECT COUNT(*) FROM "Message") as messages,
        (SELECT COUNT(*) FROM "Collection") as collections
    `;

    res.json({
      status: "✅ Banco acessado com sucesso!",
      statistics: {
        users: Number(result.users),
        watches: Number(result.watches),
        orders: Number(result.orders),
        messages: Number(result.messages),
        collections: Number(result.collections),
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
    availableEndpoints: {
      root: "/",
      health: "/health",
      api: "/api/*",
      docs: "/api-docs",
    },
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
const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   🚀 Servidor Nobile Iniciado       ║
╟──────────────────────────────────────╢
║  📍 Porta: ${PORT.toString().padEnd(27)}║
║  🌍 Ambiente: ${(process.env.NODE_ENV || "development").padEnd(21)}║
║  📚 Docs: http://localhost:${PORT}/api-docs  ║
║  ❤️  Health: http://localhost:${PORT}/health    ║
╚══════════════════════════════════════╝
  `);
});

// ========================================
// GRACEFUL SHUTDOWN DO SERVIDOR
// ========================================
const gracefulShutdown = signal => {
  console.log(`\n🛑 Recebido sinal ${signal}. Encerrando servidor...`);

  server.close(() => {
    console.log("✅ Servidor HTTP encerrado");
  });

  // Se não fechar em 10 segundos, força saída
  setTimeout(() => {
    console.error("⚠️ Forçando saída...");
    process.exit(1);
  }, 10000);
};

// ========================================
// TRATAMENTO DE ERROS NÃO CAPTURADOS
// ========================================
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
  // Não encerra o processo, apenas loga
});

process.on("uncaughtException", error => {
  console.error("❌ Uncaught Exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
