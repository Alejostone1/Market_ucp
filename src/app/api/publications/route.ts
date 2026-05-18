import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET() {
  try {
    console.log('🔍 Obteniendo todas las publicaciones...');

    const publicaciones = await prisma.publicacion.findMany({
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
      orderBy: {
        creadoEn: 'desc',
      },
    });

    console.log('📊 Total de publicaciones encontradas:', publicaciones.length);
    console.log('📋 IDs de publicaciones:', publicaciones.map((p: any) => ({ id: p.id, titulo: p.titulo, tipo: p.tipo })));

    return NextResponse.json(publicaciones);
  } catch (error) {
    console.error('❌ Error al obtener publicaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener publicaciones' },
      { status: 500 }
    );
  }
}
