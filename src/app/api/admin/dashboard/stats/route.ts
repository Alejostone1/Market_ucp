import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalPublicaciones,
      publicacionesPendientes,
      usuariosActivos,
      reportesPendientes,
      // Publicaciones por tipo (conteos individuales)
      totalProductos,
      totalServicios,
      totalEventos,
      totalConvocatorias,
      // Publicaciones por estado (conteos individuales)
      totalAprobadas,
      totalRechazadas,
      totalArchivadas,
      totalSuspendidas,
    ] = await Promise.all([
      prisma.publicacion.count(),
      prisma.publicacion.count({ where: { estado: 'PENDIENTE' } }),
      prisma.usuario.count({ where: { rol: { in: ['ESTUDIANTE', 'ALIADO'] } } }),
      prisma.reporte.count({ where: { estado: 'PENDIENTE' } }),
      // Por tipo
      prisma.publicacion.count({ where: { tipo: 'PRODUCTO' } }),
      prisma.publicacion.count({ where: { tipo: 'SERVICIO' } }),
      prisma.publicacion.count({ where: { tipo: 'EVENTO' } }),
      prisma.publicacion.count({ where: { tipo: 'CONVOCATORIA' } }),
      // Por estado
      prisma.publicacion.count({ where: { estado: 'APROBADA' } }),
      prisma.publicacion.count({ where: { estado: 'RECHAZADA' } }),
      prisma.publicacion.count({ where: { estado: 'ARCHIVADA' } }),
      prisma.publicacion.count({ where: { estado: 'SUSPENDIDA' } }),
    ]);

    const publicacionesPorTipoFormatted = [
      { tipo: 'PRODUCTO',     count: totalProductos },
      { tipo: 'SERVICIO',     count: totalServicios },
      { tipo: 'EVENTO',       count: totalEventos },
      { tipo: 'CONVOCATORIA', count: totalConvocatorias },
    ].filter((i) => i.count > 0);

    const publicacionesPorEstadoFormatted = [
      { estado: 'PENDIENTE',  count: publicacionesPendientes },
      { estado: 'APROBADA',   count: totalAprobadas },
      { estado: 'RECHAZADA',  count: totalRechazadas },
      { estado: 'ARCHIVADA',  count: totalArchivadas },
      { estado: 'SUSPENDIDA', count: totalSuspendidas },
    ].filter((i) => i.count > 0);

    // Actividad reciente (historial moderación)
    const actividadReciente = await prisma.historialPublicacion.findMany({
      take: 10,
      orderBy: { creadoEn: 'desc' },
      include: {
        publicacion: { select: { titulo: true } },
        admin:       { select: { nombre: true } },
      },
    });

    const actividadRecienteFormatted = actividadReciente.map((item) => ({
      id: item.id,
      accion: `Cambio de ${item.estadoAnterior} a ${item.estadoNuevo}`,
      publicacionTitulo: item.publicacion.titulo,
      adminNombre: item.admin?.nombre ?? 'Sistema',   // admin puede ser null (moderación automática)
      fecha: item.creadoEn,
    }));

    return NextResponse.json({
      stats: {
        totalPublicaciones,
        publicacionesPendientes,
        usuariosActivos,
        reportesPendientes,
      },
      publicacionesPorTipo:   publicacionesPorTipoFormatted,
      publicacionesPorEstado: publicacionesPorEstadoFormatted,
      actividadReciente:      actividadRecienteFormatted,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
