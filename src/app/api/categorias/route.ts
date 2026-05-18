import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      include: {
        _count: {
          select: {
            publicaciones: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return NextResponse.json(categorias, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800', // 1 hora caché
      },
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, slug, color, icono, descripcion } = body;

    if (!nombre || !slug || !color) {
      return NextResponse.json(
        { error: 'Nombre, slug y color son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si ya existe una categoría con ese slug
    const categoriaExistente = await prisma.categoria.findUnique({
      where: { slug },
    });

    if (categoriaExistente) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese slug' },
        { status: 400 }
      );
    }

    const categoria = await prisma.categoria.create({
      data: {
        nombre,
        slug,
        color,
        icono,
        descripcion,
      },
    });

    return NextResponse.json(categoria, { status: 201 });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    return NextResponse.json(
      { error: 'Error al crear categoría' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nombre, slug, color, icono, descripcion } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    // Verificar si el nuevo slug ya existe (si se está cambiando)
    if (slug) {
      const categoriaExistente = await prisma.categoria.findFirst({
        where: { 
          slug,
          id: { not: id }
        },
      });

      if (categoriaExistente) {
        return NextResponse.json(
          { error: 'Ya existe una categoría con ese slug' },
          { status: 400 }
        );
      }
    }

    const categoria = await prisma.categoria.update({
      where: { id },
      data: {
        nombre,
        slug,
        color,
        icono,
        descripcion,
      },
    });

    return NextResponse.json(categoria);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    return NextResponse.json(
      { error: 'Error al actualizar categoría' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    // Verificar si hay publicaciones asociadas
    const publicacionesCount = await prisma.publicacion.count({
      where: { categoriaId: id },
    });

    if (publicacionesCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una categoría con publicaciones asociadas' },
        { status: 400 }
      );
    }

    await prisma.categoria.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    return NextResponse.json(
      { error: 'Error al eliminar categoría' },
      { status: 500 }
    );
  }
}
