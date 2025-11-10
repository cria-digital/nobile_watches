// frontend/src/app/api/auth/logout/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const TOKEN_NAME = "nobile_token";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(TOKEN_NAME);

    return NextResponse.json(
      { success: true, message: "Logout realizado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return NextResponse.json({ error: "Erro ao fazer logout" }, { status: 500 });
  }
}
