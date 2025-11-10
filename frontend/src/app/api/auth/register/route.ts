// frontend/src/app/api/auth/register/route.ts
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const TOKEN_NAME = "nobile_token";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Fazer registro no backend
    const response = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || "Erro ao fazer registro" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Fazer login automático após registro
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

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();

      // Salvar token em cookie
      (await cookies()).set(TOKEN_NAME, loginData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        path: "/",
      });

      return NextResponse.json({
        success: true,
        user: loginData.user,
        message: "Cadastro realizado com sucesso",
      });
    }

    // Se login automático falhar, retorna sucesso do registro
    return NextResponse.json({
      success: true,
      user: data.user,
      message: "Cadastro realizado com sucesso",
    });
  } catch (error: any) {
    console.error("Erro no registro:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao fazer registro" },
      { status: 500 }
    );
  }
}
