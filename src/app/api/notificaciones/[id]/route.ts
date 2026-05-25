import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

// ── PATCH /api/notificaciones/[id] ────────────────────────────────────────────
// Marca una notificación específica como leída
// Body: { leida: boolean }

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuarioId = getUserFromCookie(request);
  if (!usuarioId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json().catch(() => ({}));
    const leida = body?.leida ?? true;

    // Solo puede modificar sus propias notificaciones
    const updated = await prisma.notificacion.updateMany({
      where: { id, usuarioId },
      data: { leida },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PATCH /api/notificaciones/[id]]', error);
    return NextResponse.json(
      { error: 'Error al actualizar notificación' },
      { status: 500 }
    );
  }
}

// ── DELETE /api/notificaciones/[id] ───────────────────────────────────────────
// Elimina una notificación específica del usuario

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuarioId = getUserFromCookie(request);
  if (!usuarioId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const deleted = await prisma.notificacion.deleteMany({
      where: { id, usuarioId },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/notificaciones/[id]]', error);
    return NextResponse.json(
      { error: 'Error al eliminar notificación' },
      { status: 500 }
    );
  }
}
