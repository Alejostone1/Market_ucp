import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: publicacionId } = params;

    // Aquí deberías obtener el usuarioId del token de autenticación
    // Por ahora, lo simulamos
    const usuarioId = 'temp-user-id'; // Reemplazar con lógica real

    // Verificar si ya es favorito
    const favoritoExistente = await prisma.favorito.findUnique({
      where: {
        usuarioId_publicacionId: {
          usuarioId,
          publicacionId,
        },
      },
    });

    if (favoritoExistente) {
      // Eliminar de favoritos
      await prisma.favorito.delete({
        where: {
          id: favoritoExistente.id,
        },
      });

      return NextResponse.json({ message: 'Eliminado de favoritos' });
    } else {
      // Agregar a favoritos
      await prisma.favorito.create({
        data: {
          usuarioId,
          publicacionId,
        },
      });

      return NextResponse.json({ message: 'Agregado a favoritos' });
    }
  } catch (error) {
    console.error('Error al gestionar favoritos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
