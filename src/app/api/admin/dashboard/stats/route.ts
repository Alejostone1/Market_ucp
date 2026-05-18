import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET() {
  try {
    // Obtener estadísticas generales
    const [
      totalPublicaciones,
      publicacionesPendientes,
      usuariosActivos,
      reportesPendientes,
    ] = await Promise.all([
      prisma.publicacion.count(),
      prisma.publicacion.count({ where: { estado: 'PENDIENTE' } }),
      prisma.usuario.count({ where: { rol: { in: ['ESTUDIANTE', 'ALIADO'] } } }),
      prisma.reporte.count({ where: { estado: 'PENDIENTE' } }),
    ]);

    // Obtener publicaciones por tipo
    const publicacionesPorTipo = await prisma.publicacion.groupBy({
      by: ['tipo'],
      _count: { id: true },
    }) as any[];

    const publicacionesPorTipoFormatted = publicacionesPorTipo.map((item) => ({
      tipo: item.tipo,
      count: item._count.id,
    }));

    // Obtener publicaciones por estado
    const publicacionesPorEstado = await prisma.publicacion.groupBy({
      by: ['estado'],
      _count: { id: true },
    }) as any[];

    const publicacionesPorEstadoFormatted = publicacionesPorEstado.map((item) => ({
      estado: item.estado,
      count: item._count.id,
    }));

    // Obtener actividad reciente (historial)
    const actividadReciente = await prisma.historialPublicacion.findMany({
      take: 10,
      orderBy: { creadoEn: 'desc' },
      include: {
        publicacion: {
          select: { titulo: true },
        },
        admin: {
          select: { nombre: true },
        },
      },
    });

    const actividadRecienteFormatted = actividadReciente.map((item) => ({
      id: item.id,
      accion: `Cambio de ${item.estadoAnterior} a ${item.estadoNuevo}`,
      publicacionTitulo: item.publicacion.titulo,
      adminNombre: item.admin.nombre,
      fecha: item.creadoEn,
    }));

    return NextResponse.json({
      stats: {
        totalPublicaciones,
        publicacionesPendientes,
        usuariosActivos,
        reportesPendientes,
      },
      publicacionesPorTipo: publicacionesPorTipoFormatted,
      publicacionesPorEstado: publicacionesPorEstadoFormatted,
      actividadReciente: actividadRecienteFormatted,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
