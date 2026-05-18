import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';


const updatePublicacionSchema = z.object({
  estado: z.enum(['APROBADA', 'RECHAZADA', 'ARCHIVADA']),
  notaRechazo: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    const estado = searchParams.get('estado');
    const categoria = searchParams.get('categoria');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};

    if (tipo) {
      where.tipo = tipo;
    }

    if (estado) {
      where.estado = estado;
    }

    if (categoria) {
      where.categoriaId = categoria;
    }

    const [publicaciones, total] = await Promise.all([
      prisma.publicacion.findMany({
        where,
        include: {
          autor: {
            select: {
              id: true,
              nombre: true,
              correo: true,
              facultad: true,
            },
          },
          categoria: {
            select: {
              id: true,
              nombre: true,
            },
          },
          medios: {
            take: 1,
            orderBy: { orden: 'asc' },
          },
        },
        orderBy: {
          creadoEn: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.publicacion.count({ where }),
    ]);

    return NextResponse.json({
      publicaciones,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener publicaciones' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, estado, notaRechazo, adminId } = body;

    const validatedData = updatePublicacionSchema.parse({ estado, notaRechazo });

    // Obtener publicación actual
    const publicacionActual = await prisma.publicacion.findUnique({
      where: { id },
    });

    if (!publicacionActual) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar publicación
    const publicacionActualizada = await prisma.publicacion.update({
      where: { id },
      data: {
        estado: validatedData.estado,
        notaRechazo: validatedData.notaRechazo,
      },
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            correo: true,
          },
        },
      },
    });

    // Crear registro en historial
    await prisma.historialPublicacion.create({
      data: {
        publicacionId: id,
        estadoAnterior: publicacionActual.estado,
        estadoNuevo: validatedData.estado,
        nota: validatedData.notaRechazo || null,
        adminId: adminId,
      },
    });

    // Crear notificación para el usuario
    const tipoNotificacion = validatedData.estado === 'APROBADA' 
      ? 'PUBLICACION_APROBADA' 
      : 'PUBLICACION_RECHAZADA';

    await prisma.notificacion.create({
      data: {
        usuarioId: publicacionActual.autorId,
        tipo: tipoNotificacion,
        referenciaId: id,
        mensaje: validatedData.estado === 'APROBADA'
          ? 'Tu publicación ha sido aprobada'
          : 'Tu publicación ha sido rechazada',
        leida: false,
      },
    });

    return NextResponse.json(publicacionActualizada);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error al actualizar publicación:', error);
    return NextResponse.json(
      { error: 'Error al actualizar publicación' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de publicación es requerido' },
        { status: 400 }
      );
    }

    // Verificar que la publicación existe
    const publicacion = await prisma.publicacion.findUnique({
      where: { id },
    });

    if (!publicacion) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar registros relacionados primero
    await Promise.all([
      // Eliminar favoritos
      prisma.favorito.deleteMany({ where: { publicacionId: id } }),
      // Eliminar carrito items
      prisma.carritoItem.deleteMany({ where: { publicacionId: id } }),
      // Eliminar reportes
      prisma.reporte.deleteMany({ where: { publicacionId: id } }),
      // Eliminar etiquetas de publicación
      prisma.etiquetaEnPublicacion.deleteMany({ where: { publicacionId: id } }),
      // Eliminar medios
      prisma.medio.deleteMany({ where: { publicacionId: id } }),
      // Eliminar historial
      prisma.historialPublicacion.deleteMany({ where: { publicacionId: id } }),
    ]);

    // Eliminar la publicación
    await prisma.publicacion.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Publicación eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar publicación:', error);
    return NextResponse.json(
      { error: 'Error al eliminar publicación' },
      { status: 500 }
    );
  }
}
