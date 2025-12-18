// frontend/src/app/api/auth/login/route.ts

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const TOKEN_NAME = "token";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log(
      "🔷 Login - Fazendo requisição ao backend:",
      `${BACKEND_URL}/auth/login`
    );

    // Fazer login no backend
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Erro do backend:", error);
      return NextResponse.json(
        { error: error.error || "Erro ao fazer login" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("📦 Body da resposta:", data);

    // ✅ EXTRAIR TOKEN DO HEADER SET-COOKIE
    const setCookieHeader = response.headers.get("set-cookie");
    console.log("🍪 Set-Cookie header:", setCookieHeader);

    let token: string | null = null;

    if (setCookieHeader) {
      // Extrair token do header set-cookie
      const tokenMatch = setCookieHeader.match(/token=([^;]+)/);
      if (tokenMatch?.[1]) {
        token = tokenMatch[1];
        console.log(
          "✅ Token extraído do header:",
          token.substring(0, 20) + "..."
        );
      }
    }

    // Se não encontrou no header, tenta no body (fallback)
    if (!token && data.token) {
      token = data.token;
      ///@ts-ignore
      console.log("✅ Token extraído do body:", token.substring(0, 20) + "...");
    }

    if (!token) {
      console.error("❌ ERRO: Token não encontrado nem no header nem no body!");
      return NextResponse.json(
        { error: "Backend não retornou token de autenticação" },
        { status: 500 }
      );
    }

    // ✅ CONFIGURAÇÃO CORRETA DE COOKIE PARA PRODUÇÃO
    const cookieStore = await cookies();
    cookieStore.set(TOKEN_NAME, token, {
      httpOnly: true, // Protege contra XSS
      secure: process.env.NODE_ENV === "production", // HTTPS only em produção
      sameSite: "lax", // ✅ MUDANÇA: "lax" ao invés de "strict"
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/", // Disponível em todas as rotas
    });

    console.log("✅ Cookie definido com sameSite=lax");

    // Retornar dados do usuário
    return NextResponse.json({
      success: true,
      user: data.user,
      message: data.message || "Login realizado com sucesso",
    });
  } catch (error: any) {
    console.error("❌ Erro crítico no login:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao fazer login" },
      { status: 500 }
    );
  }
}

/**
 * DIFERENÇAS ENTRE sameSite VALUES:
 *
 * "strict" - Cookie NUNCA é enviado em requisições cross-site
 *            Problema: Não funciona com API Routes porque são consideradas
 *            "same-site" mas o navegador bloqueia em alguns casos
 *
 * "lax"    - Cookie É enviado em navegação GET de top-level
 *            ✅ IDEAL para nossa aplicação
 *            ✅ Funciona com API Routes
 *            ✅ Protege contra CSRF em POST/PUT/DELETE
 *
 * "none"   - Cookie é enviado em TODAS as requisições cross-site
 *            ⚠️ Requer secure: true (HTTPS)
 *            ⚠️ Menos seguro
 */
