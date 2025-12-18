// frontend/src/app/api/auth/register/route.ts
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const TOKEN_NAME = "token";
// ✅ CORREÇÃO CRÍTICA: Porta 8000 (backend Python)
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * ✅ CORREÇÕES:
 * 1. URL do backend corrigida (8000 ao invés de 3000)
 * 2. Extração de token melhorada
 * 3. Logs detalhados para debug
 * 4. Headers otimizados na resposta
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // -----------------------------------------------
    // 1. FAZER REGISTRO NO BACKEND
    // -----------------------------------------------
    console.log("📝 Iniciando registro para:", body.email);
    console.log("🌐 Backend URL:", BACKEND_URL);

    const registerResponse = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.json().catch(() => ({}));
      console.error("❌ Erro no registro:", error);
      return NextResponse.json(
        { error: error.error || "Erro ao fazer registro" },
        { status: registerResponse.status }
      );
    }

    const registerData = await registerResponse.json();
    console.log("✅ Registro concluído:", registerData.user?.email);

    // -----------------------------------------------
    // 2. FAZER LOGIN AUTOMÁTICO
    // -----------------------------------------------
    console.log("🔐 Fazendo login automático...");

    const loginResponse = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
    });

    if (!loginResponse.ok) {
      console.error(
        "⚠️ Login automático falhou, mas registro foi bem-sucedido"
      );
      return NextResponse.json({
        success: true,
        user: registerData.user,
        message: "Cadastro realizado com sucesso. Faça login para continuar.",
        needsLogin: true,
      });
    }

    const loginData = await loginResponse.json();

    // -----------------------------------------------
    // 3. EXTRAIR TOKEN
    // -----------------------------------------------
    let token = loginData.token; // Tenta do body primeiro

    // Se não veio no body, verifica header Authorization
    if (!token) {
      const authHeader = loginResponse.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    // Verifica header Set-Cookie como fallback
    if (!token) {
      const setCookieHeader = loginResponse.headers.get("set-cookie");
      if (setCookieHeader) {
        const tokenMatch = setCookieHeader.match(/token=([^;]+)/);
        if (tokenMatch?.[1]) {
          token = tokenMatch[1];
        }
      }
    }

    if (!token) {
      console.error("❌ Token não encontrado na resposta do login");
      return NextResponse.json(
        { error: "Erro ao processar autenticação após registro" },
        { status: 500 }
      );
    }

    console.log("✅ Token obtido:", token.substring(0, 20) + "...");

    // -----------------------------------------------
    // 4. DEFINIR COOKIE
    // -----------------------------------------------
    const cookieStore = await cookies();

    cookieStore.set(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    });

    console.log("✅ Cookie definido com sucesso");

    // -----------------------------------------------
    // 5. RETORNAR RESPOSTA
    // -----------------------------------------------
    const response = NextResponse.json({
      success: true,
      user: loginData.user,
      message: "Cadastro realizado com sucesso",
      authenticated: true,
    });

    // Headers que ajudam o navegador a processar o cookie
    response.headers.set("Cache-Control", "no-store, must-revalidate");
    response.headers.set("X-Auth-Status", "authenticated");

    return response;
  } catch (error: any) {
    console.error("❌ Erro crítico no registro:", error);
    return NextResponse.json(
      {
        error: error.message || "Erro ao fazer registro",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
