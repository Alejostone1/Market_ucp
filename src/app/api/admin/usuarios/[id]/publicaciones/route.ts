import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const publicaciones = await prisma.publicacion.findMany({
      where: {
        autorId: params.id,
      },
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true,
            color: true,
          },
        },
        medios: {
          select: {
            id: true,
            url: true,
            tipo: true,
            orden: true,
            altText: true,
          },
          orderBy: {
            orden: 'asc',
          },
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
        autor: {
          select: {
            id: true,
            nombre: true,
            correo: true,
            avatarUrl: true,
            telefono: true,
            facultad: true,
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
      { error: 'Error al obtener publicaciones del usuario' },
      { status: 500 }
    );
  }
}
