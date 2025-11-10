import { NextRequest, NextResponse } from "next/server";

// Rotas que requerem autenticação
const protectedRoutes = [
  "/perfil",
  "/colecao",
  "/minhas-compras",
  "/meus-anuncios",
  "/vender-relogio",
  "/carrinho",
  "/checkout",
];

// Rotas que só podem ser acessadas por usuários não autenticados
const authRoutes = ["/login", "/cadastro"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("nobile_token")?.value;

  // Verifica se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Verifica se é uma rota de autenticação
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Se é rota protegida e não tem token, redireciona para login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se está autenticado e tenta acessar login/cadastro, redireciona para home
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|images|fonts).*)",
  ],
};
