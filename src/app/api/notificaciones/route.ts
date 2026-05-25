import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ── Util: leer usuario desde cookie ───────────────────────────────────────────
function getUserFromCookie(request: NextRequest): string | null {
  const cookie = request.cookies.get('usuario');
  if (!cookie) return null;
  try {
    const user = JSON.parse(decodeURIComponent(cookie.value));
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// ── GET /api/notificaciones ────────────────────────────────────────────────────
// Query params:
//   soloNoLeidas — "true" para filtrar solo las no leídas
//   page         — número de página (default: 1)
//   limit        — tamaño de página (default: 20, max: 50)
//
// Devuelve: { notificaciones, unreadCount, pagination }

export async function GET(request: NextRequest) {
  const usuarioId = getUserFromCookie(request);
  if (!usuarioId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const soloNoLeidas = searchParams.get('soloNoLeidas') === 'true';
    const page  = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    const where = {
      usuarioId,
      ...(soloNoLeidas ? { leida: false } : {}),
    };

    const [notificaciones, total, unreadCount] = await Promise.all([
      prisma.notificacion.findMany({
        where,
        orderBy: { creadoEn: 'desc' },
        skip:  (page - 1) * limit,
        take:  limit,
      }),
      prisma.notificacion.count({ where }),
      prisma.notificacion.count({ where: { usuarioId, leida: false } }),
    ]);

    return NextResponse.json({
      notificaciones,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[GET /api/notificaciones]', error);
    return NextResponse.json({ error: 'Error al obtener notificaciones' }, { status: 500 });
  }
}

// ── PATCH /api/notificaciones ─────────────────────────────────────────────────
// Body: { ids?: string[] }  — si se omite ids, marca TODAS como leídas
//
// Devuelve: { updated: number }

export async function PATCH(request: NextRequest) {
  const usuarioId = getUserFromCookie(request);
  if (!usuarioId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const ids: string[] | undefined = body?.ids;

    const result = await prisma.notificacion.updateMany({
      where: {
        usuarioId,
        leida: false,
        ...(ids && ids.length > 0 ? { id: { in: ids } } : {}),
      },
      data: { leida: true },
    });

    return NextResponse.json({ updated: result.count });
  } catch (error) {
    console.error('[PATCH /api/notificaciones]', error);
    return NextResponse.json({ error: 'Error al marcar notificaciones' }, { status: 500 });
  }
}
