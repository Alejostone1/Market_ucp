import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const publicaciones = await prisma.publicacion.findMany({
      where: {
        autorId: id,
      },
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true,
            slug: true,
            color: true,
          },
        },
        medios: {
          orderBy: { orden: 'asc' },
        },
        etiquetas: {
          include: {
            etiqueta: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: {
        creadoEn: 'desc',
      },
    });

    return NextResponse.json(publicaciones);
  } catch (error) {
    console.error('Error al obtener publicaciones del usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener publicaciones' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { publicationId } = await request.json();

    // Verificar que la publicación pertenece al usuario
    const publicacion = await prisma.publicacion.findFirst({
      where: {
        id: publicationId,
        autorId: id,
      },
    });

    if (!publicacion) {
      return NextResponse.json(
        { error: 'Publicación no encontrada o no pertenece al usuario' },
        { status: 404 }
      );
    }

    // Eliminar medios asociados
    await prisma.medio.deleteMany({
      where: {
        publicacionId: publicationId,
      },
    });

    // Eliminar etiquetas asociadas
    await prisma.etiquetaEnPublicacion.deleteMany({
      where: {
        publicacionId: publicationId,
      },
    });

    // Eliminar la publicación
    await prisma.publicacion.delete({
      where: {
        id: publicationId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar publicación:', error);
    return NextResponse.json(
      { error: 'Error al eliminar publicación' },
      { status: 500 }
    );
  }
}
