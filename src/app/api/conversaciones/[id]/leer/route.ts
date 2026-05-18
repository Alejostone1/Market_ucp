import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitSocketEvent } from '@/lib/socket-emit';

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

// POST /api/conversaciones/[id]/leer — mark incoming messages as read
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = getUserFromCookie(request);
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id: conversationId } = await params;

  const conversacion = await prisma.conversacion.findFirst({
    where: {
      id: conversationId,
      OR: [{ participanteAId: userId }, { participanteBId: userId }],
    },
  });

  if (!conversacion) {
    return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
  }

  try {
    await prisma.mensaje.updateMany({
      where: {
        conversacionId: conversationId,
        emisorId: { not: userId },
        leido: false,
      },
      data: { leido: true, leidoEn: new Date() },
    });

    await emitSocketEvent(`conv:${conversationId}`, 'message:read', {
      conversationId,
      readBy: userId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/conversaciones/[id]/leer error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
