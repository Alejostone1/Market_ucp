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

// GET /api/conversaciones/[id]/mensajes?cursor=ISO_DATE&limit=50
export async function GET(
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

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);

  try {
    const mensajes = await prisma.mensaje.findMany({
      where: {
        conversacionId: conversationId,
        ...(cursor ? { creadoEn: { lt: new Date(cursor) } } : {}),
      },
      include: {
        emisor: { select: { id: true, nombre: true, avatarUrl: true } },
      },
      orderBy: { creadoEn: 'desc' },
      take: limit,
    });

    // Return chronological order to the client
    const ordered = mensajes.reverse();

    return NextResponse.json({
      mensajes: ordered,
      hasMore: mensajes.length === limit,
      nextCursor: ordered.length > 0 ? ordered[0].creadoEn.toISOString() : null,
    });
  } catch (error) {
    console.error('GET /api/conversaciones/[id]/mensajes error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST /api/conversaciones/[id]/mensajes — send a message
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
    const body = await request.json();
    const contenido: string = body?.contenido?.trim() ?? '';

    if (!contenido) {
      return NextResponse.json({ error: 'El mensaje no puede estar vacío' }, { status: 400 });
    }

    if (contenido.length > 2000) {
      return NextResponse.json({ error: 'El mensaje es demasiado largo (máx 2000 caracteres)' }, { status: 400 });
    }

    // Rate limiting: max 20 messages per minute per user in this conversation
    const oneMinuteAgo = new Date(Date.now() - 60_000);
    const recentCount = await prisma.mensaje.count({
      where: {
        conversacionId: conversationId,
        emisorId: userId,
        creadoEn: { gte: oneMinuteAgo },
      },
    });

    if (recentCount >= 20) {
      return NextResponse.json(
        { error: 'Demasiados mensajes. Espera un momento.' },
        { status: 429 },
      );
    }

    const mensaje = await prisma.mensaje.create({
      data: {
        contenido,
        conversacionId: conversationId,
        emisorId: userId,
        leido: false,
      },
      include: {
        emisor: { select: { id: true, nombre: true, avatarUrl: true } },
      },
    });

    // Update last activity timestamp on conversation
    await prisma.conversacion.update({
      where: { id: conversationId },
      data: { ultimoMensajeEn: new Date() },
    });

    // Persist notification for the other participant
    const otherUserId =
      conversacion.participanteAId === userId
        ? conversacion.participanteBId
        : conversacion.participanteAId;

    await prisma.notificacion.create({
      data: {
        usuarioId: otherUserId,
        tipo: 'MENSAJE_NUEVO',
        referenciaId: conversationId,
        mensaje: 'Tienes un nuevo mensaje',
        leida: false,
      },
    });

    const payload = {
      ...mensaje,
      creadoEn: mensaje.creadoEn.toISOString(),
      leidoEn: mensaje.leidoEn ? mensaje.leidoEn.toISOString() : null,
    };

    // Emit real-time event to everyone in the conversation room
    if (global.io) {
      global.io.to(`conv:${conversationId}`).emit('message:new', payload);
      // Also notify the other user's personal room (for sidebar unread badge)
      global.io.to(`user:${otherUserId}`).emit('conversation:updated', {
        conversationId,
        lastMessage: contenido,
        lastMessageTime: payload.creadoEn,
      });
    }

    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    console.error('POST /api/conversaciones/[id]/mensajes error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
