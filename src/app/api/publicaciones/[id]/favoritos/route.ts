import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getUserFromCookie(request: NextRequest): string | null {
  const cookie = request.cookies.get('usuario');
  if (!cookie) return null;
  try {
    const user = JSON.parse(decodeURIComponent(cookie.value));
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuarioId = getUserFromCookie(request);
  if (!usuarioId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { id: publicacionId } = await params;

    const existente = await prisma.favorito.findUnique({
      where: { usuarioId_publicacionId: { usuarioId, publicacionId } },
    });

    if (existente) {
      await prisma.favorito.delete({ where: { id: existente.id } });
      return NextResponse.json({ favorito: false, message: 'Eliminado de favoritos' });
    } else {
      await prisma.favorito.create({ data: { usuarioId, publicacionId } });
      return NextResponse.json({ favorito: true, message: 'Agregado a favoritos' });
    }
  } catch (error) {
    console.error('Error al gestionar favoritos:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const usuarioId = getUserFromCookie(request);
  if (!usuarioId) {
    return NextResponse.json({ favorito: false });
  }

  const { id: publicacionId } = await params;
  const existente = await prisma.favorito.findUnique({
    where: { usuarioId_publicacionId: { usuarioId, publicacionId } },
  });

  return NextResponse.json({ favorito: !!existente });
}
