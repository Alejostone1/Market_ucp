import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: usuarioId } = params;

    const carritoItems = await prisma.carritoItem.findMany({
      where: { usuarioId },
      include: {
        publicacion: {
          include: {
            autor: true,
            medios: {
              orderBy: { orden: 'asc' },
            },
            categoria: true,
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });

    return NextResponse.json(carritoItems);
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
