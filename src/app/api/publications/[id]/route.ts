import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 Buscando publicación con ID:', id);

    const publicacion = await prisma.publicacion.findUnique({
      where: {
        id: id,
      },
      include: {
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
    });

    console.log('📦 Resultado de búsqueda:', publicacion ? 'Encontrada' : 'No encontrada');

    if (!publicacion) {
      console.log('❌ Publicación no encontrada con ID:', id);
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      );
    }

    console.log('✅ Publicación encontrada:', publicacion.titulo);
    return NextResponse.json(publicacion);
  } catch (error) {
    console.error('❌ Error al obtener publicación:', error);
    return NextResponse.json(
      { error: 'Error al obtener publicación' },
      { status: 500 }
    );
  }
}
