import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ── Helper para parsear la cookie de sesión ───────────────────────────────────

function getUsuario(request: NextRequest): {
  id: string;
  rol: 'ESTUDIANTE' | 'ALIADO' | 'ADMIN';
  verificado: boolean;
  bloqueado: boolean;
} | null {
  const token = request.cookies.get('usuario')?.value;
  if (!token) return null;
  try {
    return JSON.parse(decodeURIComponent(token));
  } catch {
    return null;
  }
}

// ── Middleware ────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Protección del dashboard de estudiantes / aliados ──────────────────────
  if (pathname.startsWith('/dashboard/student')) {
    const usuario = getUsuario(request);

    // Sin sesión → login
    if (!usuario) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Aliado pendiente de aprobación → página informativa
    if (usuario.rol === 'ALIADO' && !usuario.verificado) {
      return NextResponse.redirect(new URL('/pending-approval', request.url));
    }

    // Cuenta bloqueada → login con mensaje
    if (usuario.bloqueado) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      // Limpiar cookie de sesión inválida
      response.cookies.set('usuario', '', { path: '/', maxAge: 0 });
      return response;
    }
  }

  // ── Protección del dashboard de admin ─────────────────────────────────────
  if (
    pathname.startsWith('/admin/dashboard') ||
    pathname.startsWith('/dashboard/admin')
  ) {
    const usuario = getUsuario(request);

    if (!usuario) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (usuario.rol !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard/student', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/student/:path*',
    '/admin/dashboard/:path*',
    '/dashboard/admin/:path*',
  ],
};
