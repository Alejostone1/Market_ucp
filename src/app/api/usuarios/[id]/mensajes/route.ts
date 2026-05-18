import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Obtener conversaciones del usuario
    const conversaciones = await prisma.conversacion.findMany({
      where: {
        OR: [
          { participanteAId: id },
          { participanteBId: id },
        ],
      },
      include: {
        participanteA: {
          select: {
            id: true,
            nombre: true,
            correo: true,
            avatarUrl: true,
          },
        },
        participanteB: {
          select: {
            id: true,
            nombre: true,
            correo: true,
            avatarUrl: true,
          },
        },
        mensajes: {
          orderBy: {
            creadoEn: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        ultimoMensajeEn: 'desc',
      },
    });

    // Formatear conversaciones para el frontend
    const conversacionesFormateadas = conversaciones.map((conv: any) => {
      const otherUser = conv.participanteAId === id ? conv.participanteB : conv.participanteA;
      const lastMessage = conv.mensajes[0];
      
      // Contar mensajes no leídos
      const unreadCount = conv.mensajes.filter((m: any) => m.emisorId !== id && !m.leido).length;

      return {
        id: conv.id,
        otherUser,
        lastMessage: lastMessage?.contenido || '',
        timestamp: lastMessage?.creadoEn || conv.ultimoMensajeEn || conv.creadoEn,
        unread: unreadCount,
      };
    });

    return NextResponse.json(conversacionesFormateadas);
  } catch (error) {
    console.error('Error al obtener mensajes del usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener mensajes' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { destinatarioId, contenido } = await request.json();

    // Buscar o crear conversación
    let conversacion = await prisma.conversacion.findFirst({
      where: {
        OR: [
          { participanteAId: id, participanteBId: destinatarioId },
          { participanteAId: destinatarioId, participanteBId: id },
        ],
      },
    });

    if (!conversacion) {
      conversacion = await prisma.conversacion.create({
        data: {
          participanteAId: id,
          participanteBId: destinatarioId,
        },
      });
    }

    // Crear mensaje
    const mensaje = await prisma.mensaje.create({
      data: {
        contenido,
        conversacionId: conversacion.id,
        emisorId: id,
        leido: false,
      },
      include: {
        emisor: {
          select: {
            id: true,
            nombre: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Actualizar último mensaje de la conversación
    await prisma.conversacion.update({
      where: { id: conversacion.id },
      data: { ultimoMensajeEn: new Date() },
    });

    // Crear notificación para el destinatario
    await prisma.notificacion.create({
      data: {
        usuarioId: destinatarioId,
        tipo: 'MENSAJE_NUEVO',
        referenciaId: conversacion.id,
        mensaje: `Tienes un nuevo mensaje`,
        leida: false,
      },
    });

    return NextResponse.json(mensaje);
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    return NextResponse.json(
      { error: 'Error al enviar mensaje' },
      { status: 500 }
    );
  }
}
