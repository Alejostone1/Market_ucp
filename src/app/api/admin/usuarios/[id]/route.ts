import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        nombre: true,
        correo: true,
        rol: true,
        facultad: true,
        avatarUrl: true,
        telefono: true,
        bloqueado: true,
        verificado: true,
        creadoEn: true,
        _count: {
          select: {
            publicaciones: true,
          },
        },
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}
