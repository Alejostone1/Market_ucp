import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const etiquetas = await prisma.etiqueta.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });

    return NextResponse.json(etiquetas, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('Error al obtener etiquetas:', error);
    return NextResponse.json(
      { error: 'Error al obtener etiquetas' },
      { status: 500 }
    );
  }
}
