import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const publicaciones = await prisma.publicacion.findMany({
      select: {
        id: true,
        titulo: true,
        tipo: true,
        estado: true,
      },
      orderBy: {
        creadoEn: 'desc',
      },
    });

    const ids = publicaciones.map(p => ({
      id: p.id,
      titulo: p.titulo,
      tipo: p.tipo,
      estado: p.estado,
      url: `http://localhost:3000/publication/${p.id}`,
    }));

    return NextResponse.json({
      total: publicaciones.length,
      publicaciones: ids,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener publicaciones' },
      { status: 500 }
    );
  }
}
