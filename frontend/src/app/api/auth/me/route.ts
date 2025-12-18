import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const TOKEN_NAME = "token";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;

    // Verificar se token existe
    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado", code: "NO_TOKEN" },
        { status: 401 }
      );
    }

    // VALIDAR TOKEN NO BACKEND fazendo requisição DIRETA com cookie
    try {
      const response = await fetch(`${BACKEND_URL}/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Envia cookie como header Cookie para o backend
          Cookie: `token=${token}`,
        },
      });

      // Token inválido ou expirado
      if (!response.ok) {
        // Limpar cookie inválido
        cookieStore.delete(TOKEN_NAME);

        if (response.status === 401) {
          return NextResponse.json(
            { error: "Token inválido ou expirado", code: "INVALID_TOKEN" },
            { status: 401 }
          );
        }

        // Outro erro do backend
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          {
            error: errorData.error || "Erro ao validar token",
            code: "VALIDATION_ERROR",
          },
          { status: response.status }
        );
      }

      // Token válido - retornar dados do usuário
      const userData = await response.json();

      return NextResponse.json(
        {
          user: userData,
          authenticated: true,
        },
        { status: 200 }
      );
    } catch (fetchError: any) {
      // Erro de rede ou timeout
      console.error("Erro ao validar token no backend:", fetchError);

      return NextResponse.json(
        {
          error: "Erro ao conectar com servidor de autenticação",
          code: "BACKEND_ERROR",
          details: fetchError.message,
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error("Erro crítico no endpoint /api/auth/me:", error);

    return NextResponse.json(
      {
        error: "Erro interno no servidor",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
