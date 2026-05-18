import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { publicacionId, cantidad, precioUnitario } = await request.json();

    // Obtener el usuario del token (aquí deberías implementar tu lógica de autenticación)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Por ahora, simulamos obtener el usuario ID del token
    // En producción, deberías verificar el JWT y obtener el usuario
    const token = authHeader.replace('Bearer ', '');
    const usuarioId = 'temp-user-id'; // Reemplazar con lógica real

    // Verificar si la publicación existe y está aprobada
    const publicacion = await prisma.publicacion.findUnique({
      where: { id: publicacionId },
    });

    if (!publicacion) {
      return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 });
    }

    if (publicacion.estado !== 'APROBADA') {
      return NextResponse.json({ error: 'Publicación no disponible' }, { status: 400 });
    }

    // Verificar si el producto ya está en el carrito
    const existingItem = await prisma.carritoItem.findUnique({
      where: {
        usuarioId_publicacionId: {
          usuarioId,
          publicacionId,
        },
      },
    });

    if (existingItem) {
      // Actualizar cantidad
      const updatedItem = await prisma.carritoItem.update({
        where: { id: existingItem.id },
        data: {
          cantidad: existingItem.cantidad + cantidad,
        },
        include: {
          publicacion: {
            include: {
              autor: true,
              medios: true,
            },
          },
        },
      });

      return NextResponse.json(updatedItem);
    } else {
      // Crear nuevo item en el carrito
      const newItem = await prisma.carritoItem.create({
        data: {
          usuarioId,
          publicacionId,
          cantidad,
          precioUnitario,
        },
        include: {
          publicacion: {
            include: {
              autor: true,
              medios: true,
            },
          },
        },
      });

      return NextResponse.json(newItem);
    }
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
