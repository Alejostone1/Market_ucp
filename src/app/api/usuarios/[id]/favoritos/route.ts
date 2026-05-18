import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const favoritos = await prisma.favorito.findMany({
      where: { usuarioId: id },
      include: {
        publicacion: {
          include: {
            categoria: true,
            autor: { select: { id: true, nombre: true, avatarUrl: true, telefono: true, correo: true } },
            medios: { orderBy: { orden: 'asc' } },
            etiquetas: { include: { etiqueta: true } },
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });

    return NextResponse.json(favoritos.map((f) => f.publicacion));
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
