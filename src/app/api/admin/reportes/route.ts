import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const updateReporteSchema = z.object({
  estado: z.enum(['REVISADO', 'DESCARTADO']),
  nota: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};

    if (estado) {
      where.estado = estado;
    }

    const [reportes, total] = await Promise.all([
      prisma.reporte.findMany({
        where,
        include: {
          reportante: {
            select: {
              id: true,
              nombre: true,
              correo: true,
            },
          },
          publicacion: {
            select: {
              id: true,
              titulo: true,
              estado: true,
              autor: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          },
        },
        orderBy: {
          creadoEn: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reporte.count({ where }),
    ]);

    return NextResponse.json({
      reportes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    return NextResponse.json(
      { error: 'Error al obtener reportes' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, estado, nota, eliminarPublicacion } = body;

    const validatedData = updateReporteSchema.parse({ estado, nota });

    // Actualizar reporte
    const reporteActualizado = await prisma.reporte.update({
      where: { id },
      data: {
        estado: validatedData.estado,
        descripcion: validatedData.nota,
      },
      include: {
        publicacion: true,
      },
    });

    // Eliminar publicación si se solicita
    if (eliminarPublicacion && reporteActualizado.publicacionId) {
      await prisma.publicacion.delete({
        where: { id: reporteActualizado.publicacionId },
      });
    }

    // Crear notificación para el reportante
    await prisma.notificacion.create({
      data: {
        usuarioId: reporteActualizado.reportanteId,
        tipo: 'REPORTE_RESUELTO',
        referenciaId: id,
        mensaje: `Tu reporte ha sido ${estado === 'REVISADO' ? 'revisado' : 'descartado'}`,
        leida: false,
      },
    });

    return NextResponse.json(reporteActualizado);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error al actualizar reporte:', error);
    return NextResponse.json(
      { error: 'Error al actualizar reporte' },
      { status: 500 }
    );
  }
}
