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

export async function GET(request: NextRequest) {
  const usuarioId = getUserFromCookie(request);
  if (!usuarioId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const items = await prisma.carritoItem.findMany({
      where: { usuarioId },
      include: {
        publicacion: {
          include: {
            autor: { select: { id: true, nombre: true, avatarUrl: true } },
            medios: { orderBy: { orden: 'asc' }, take: 1 },
            categoria: true,
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const usuarioId = getUserFromCookie(request);
  if (!usuarioId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { publicacionId, cantidad = 1, precioUnitario } = await request.json();

    const publicacion = await prisma.publicacion.findUnique({
      where: { id: publicacionId },
    });

    if (!publicacion) {
      return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 });
    }

    if (publicacion.estado !== 'APROBADA') {
      return NextResponse.json({ error: 'Publicación no disponible' }, { status: 400 });
    }

    // Prevent users from adding their own publications to the cart
    if (publicacion.autorId === usuarioId) {
      return NextResponse.json(
        { error: 'No puedes agregar tus propias publicaciones al carrito' },
        { status: 403 },
      );
    }

    const precioFinal = precioUnitario ?? publicacion.precio ?? 0;

    const existente = await prisma.carritoItem.findUnique({
      where: { usuarioId_publicacionId: { usuarioId, publicacionId } },
    });

    if (existente) {
      const updated = await prisma.carritoItem.update({
        where: { id: existente.id },
        data: { cantidad: existente.cantidad + cantidad },
        include: { publicacion: { include: { medios: true } } },
      });
      return NextResponse.json(updated);
    }

    const newItem = await prisma.carritoItem.create({
      data: { usuarioId, publicacionId, cantidad, precioUnitario: precioFinal },
      include: { publicacion: { include: { medios: true } } },
    });
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
