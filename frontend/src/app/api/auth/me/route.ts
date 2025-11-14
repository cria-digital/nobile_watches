// frontend/src/app/api/auth/me/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const TOKEN_NAME = "token";

interface JWTPayload {
  id: number;
  name?: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Decodifica um JWT manualmente (base64)
 */
function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1]; //@ts-ignore
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString());
    return decoded;
  } catch (error) {
    console.error("Erro ao decodificar JWT:", error);
    return null;
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Decodificar JWT
    const decoded = decodeJWT(token);

    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Verificar se está expirado
    if (decoded.exp * 1000 < Date.now()) {
      // Remover cookie expirado
      cookieStore.delete(TOKEN_NAME);
      return NextResponse.json({ error: "Token expirado" }, { status: 401 });
    }

    // Recuperar name do localStorage (se disponível no cliente)
    // Como estamos no servidor, retornamos sem name por enquanto
    const user = {
      id: decoded.id,
      name: decoded.name || "",
      email: decoded.email,
      role: decoded.role as "BUYER" | "SELLER" | "ADMIN",
    };

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 });
  }
}
