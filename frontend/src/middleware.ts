import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Rotas que só podem ser acessadas por usuários NÃO autenticados
const authRoutes = ["/login", "/cadastro", "/nova-senha", "/recuperar-senha"];

// Valor oficial do mock
const MOCK_TOKEN_VALUE = "mock_token_active";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const mockToken = req.cookies.get("mock_auth_token")?.value;

  // Usuário autenticado via mock
  const isMockAuthenticated = mockToken === MOCK_TOKEN_VALUE;

  // Usuário autenticado via token real
  const isAuthenticated = Boolean(token) || isMockAuthenticated;

  const isProtectedRoute = pathname.startsWith("/account");

  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|images|fonts).*)"],
};
