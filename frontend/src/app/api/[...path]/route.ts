// frontend/src/app/api/[...path]/route.ts

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const TOKEN_NAME = "token";

/**
 * Proxy genérico que encaminha todas as requisições para o backend
 * e adiciona o cookie de autenticação automaticamente
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, "PUT");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, "DELETE");
}

/**
 * Função principal que faz o proxy da requisição
 */
async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // Monta a URL completa
    const path = pathSegments.join("/");
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ""}`;

    console.log(`🔄 Proxy [${method}]: ${url}`);

    // Pega o cookie de autenticação
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;

    // Monta os headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Adiciona o cookie como header para o backend
    if (token) {
      headers["Cookie"] = `token=${token}`;
    }

    // Copia outros headers relevantes da requisição original
    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers["Content-Type"] = contentType;
    }

    // Monta o body se necessário
    let body: string | FormData | undefined = undefined;
    if (["POST", "PUT", "PATCH"].includes(method)) {
      const contentType = request.headers.get("content-type");

      if (contentType?.includes("multipart/form-data")) {
        // Para FormData, deixa o fetch lidar automaticamente
        body = await request.formData();
        delete headers["Content-Type"]; // Remove para o fetch definir automaticamente
      } else if (contentType?.includes("application/json")) {
        // Para JSON, converte para string
        const jsonBody = await request.json();
        body = JSON.stringify(jsonBody);
      }
    }

    // Faz a requisição para o backend
    //@ts-ignore
    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    // Pega a resposta do backend
    const data = await response.json().catch(() => null);

    // Retorna a resposta com o mesmo status code
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("❌ Erro no proxy:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao comunicar com o backend" },
      { status: 500 }
    );
  }
}
