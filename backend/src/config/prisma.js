// backend/src/config/prisma.js
const { PrismaClient } = require("@prisma/client");

// ========================================
// CONFIGURAÇÃO OTIMIZADA PARA RENDER FREE TIER + NEON
// ========================================

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],

    // ✅ OTIMIZAÇÕES PARA COLD START
    errorFormat: "minimal",
  });
};

// ========================================
// SINGLETON PATTERN - EVITA MÚLTIPLAS CONEXÕES
// ========================================
// Em desenvolvimento, o HMR pode criar múltiplas instâncias
// Este pattern garante que só existe UMA instância do Prisma
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// Preserva a instância em desenvolvimento (hot reload)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ========================================
// GRACEFUL SHUTDOWN
// ========================================
// Garante que conexões sejam fechadas corretamente
let isShuttingDown = false;

const shutdown = async signal => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n🔌 Recebido sinal ${signal}. Desconectando Prisma...`);

  try {
    await prisma.$disconnect();
    console.log("✅ Prisma desconectado com sucesso");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao desconectar Prisma:", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// ========================================
// CONEXÃO INICIAL (LAZY)
// ========================================
// Não conecta imediatamente, deixa o Prisma conectar no primeiro uso
// Isso é MAIS RÁPIDO no cold start do Render

if (process.env.NODE_ENV === "development") {
  // Só em dev mostramos confirmação de conexão
  prisma
    .$connect()
    .then(() => {
      console.log("✅ Prisma conectado ao banco (desenvolvimento)");
    })
    .catch(err => {
      console.error("❌ Erro ao conectar Prisma:", err.message);
    });
}

// ========================================
// EXPORT
// ========================================
module.exports = prisma;
