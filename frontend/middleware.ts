import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

const protectedRoutes = [
  "/dashboard",
  "/obras",
  "/usuarios",
  "/fornecedores",
  "/cotacoes",
  "/etapas",
  "/documentos",
  "/materiais",
  "/custos",
  "/financiamento",
  "/relatorios",
  "/auditoria",
  "/configuracoes",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_FILE.test(pathname) || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("crm_obras_token")?.value;

  const isLogin = pathname === "/login" || pathname === "/";

  if (!token && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (token && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/obras/:path*", "/usuarios/:path*", "/fornecedores/:path*", "/cotacoes/:path*", "/etapas/:path*", "/documentos/:path*", "/materiais/:path*", "/custos/:path*", "/financiamento/:path*", "/relatorios/:path*", "/auditoria/:path*", "/configuracoes/:path*", "/login", "/"],
};
