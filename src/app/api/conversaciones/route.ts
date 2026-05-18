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

// GET /api/conversaciones — list conversations for the current user
export async function GET(request: NextRequest) {
  const userId = getUserFromCookie(request);
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const conversaciones = await prisma.conversacion.findMany({
      where: {
        OR: [{ participanteAId: userId }, { participanteBId: userId }],
      },
      include: {
        participanteA: {
          select: { id: true, nombre: true, correo: true, avatarUrl: true, rol: true },
        },
        participanteB: {
          select: { id: true, nombre: true, correo: true, avatarUrl: true, rol: true },
        },
        mensajes: {
          orderBy: { creadoEn: 'desc' },
          take: 1,
          select: {
            id: true,
            contenido: true,
            emisorId: true,
            leido: true,
            creadoEn: true,
          },
        },
      },
      orderBy: { ultimoMensajeEn: 'desc' },
    });

    // Count unread per conversation in one extra query to avoid N+1
    const conversationIds = conversaciones.map((c) => c.id);
    const unreadCounts = await prisma.mensaje.groupBy({
      by: ['conversacionId'],
      where: {
        conversacionId: { in: conversationIds },
        emisorId: { not: userId },
        leido: false,
      },
      _count: { id: true },
    });

    const unreadMap = new Map(unreadCounts.map((u) => [u.conversacionId, u._count.id]));

    const result = conversaciones.map((conv) => {
      const otherUser =
        conv.participanteAId === userId ? conv.participanteB : conv.participanteA;
      const lastMsg = conv.mensajes[0];

      return {
        id: conv.id,
        otherUser,
        lastMessage: lastMsg?.contenido ?? '',
        lastMessageTime: lastMsg?.creadoEn ?? conv.creadoEn,
        lastMessageIsOwn: lastMsg?.emisorId === userId,
        unread: unreadMap.get(conv.id) ?? 0,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/conversaciones error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST /api/conversaciones — find or create a conversation
export async function POST(request: NextRequest) {
  const userId = getUserFromCookie(request);
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { otherUserId } = body;

    if (!otherUserId || typeof otherUserId !== 'string') {
      return NextResponse.json({ error: 'otherUserId requerido' }, { status: 400 });
    }

    if (userId === otherUserId) {
      return NextResponse.json(
        { error: 'No puedes iniciar una conversación contigo mismo' },
        { status: 400 },
      );
    }

    const otherUser = await prisma.usuario.findUnique({
      where: { id: otherUserId },
      select: { id: true, nombre: true, correo: true, avatarUrl: true, rol: true },
    });

    if (!otherUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Find existing conversation (either order)
    let conversacion = await prisma.conversacion.findFirst({
      where: {
        OR: [
          { participanteAId: userId, participanteBId: otherUserId },
          { participanteAId: otherUserId, participanteBId: userId },
        ],
      },
    });

    if (!conversacion) {
      conversacion = await prisma.conversacion.create({
        data: { participanteAId: userId, participanteBId: otherUserId },
      });
    }

    return NextResponse.json({ id: conversacion.id, otherUser });
  } catch (error) {
    console.error('POST /api/conversaciones error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
