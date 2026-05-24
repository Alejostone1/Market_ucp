import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getAdminFromCookie(request: NextRequest): { id: string; rol: string } | null {
  const cookie = request.cookies.get("usuario");
  if (!cookie) return null;
  try {
    const user = JSON.parse(decodeURIComponent(cookie.value));
    return user?.rol === "ADMIN" ? user : null;
  } catch {
    return null;
  }
}

/**
 * GET /api/admin/publicaciones/[id]/reportes
 *
 * Devuelve el detalle completo de una publicación con:
 * - Datos de la publicación
 * - Todos los reportes recibidos (con datos del reportante)
 * - Historial de moderación
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = getAdminFromCookie(request);
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: publicacionId } = await params;

  try {
    const publicacion = await prisma.publicacion.findUnique({
      where: { id: publicacionId },
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            correo: true,
            avatarUrl: true,
            rol: true,
            facultad: true,
          },
        },
        categoria: { select: { id: true, nombre: true, color: true } },
        medios: { orderBy: { orden: "asc" } },
        etiquetas: { include: { etiqueta: { select: { nombre: true } } } },
        reportes: {
          include: {
            reportante: {
              select: {
                id: true,
                nombre: true,
                correo: true,
                avatarUrl: true,
                rol: true,
              },
            },
          },
          orderBy: { creadoEn: "desc" },
        },
        historial: {
          include: {
            admin: {
              select: { id: true, nombre: true, avatarUrl: true },
            },
          },
          orderBy: { creadoEn: "desc" },
        },
      },
    });

    if (!publicacion) {
      return NextResponse.json(
        { error: "Publicación no encontrada" },
        { status: 404 }
      );
    }

    // Calcular conteos por estado de reporte
    const reportesPorEstado = {
      pendientes:  publicacion.reportes.filter((r) => r.estado === "PENDIENTE").length,
      revisados:   publicacion.reportes.filter((r) => r.estado === "REVISADO").length,
      descartados: publicacion.reportes.filter((r) => r.estado === "DESCARTADO").length,
    };

    // Calcular reportes por motivo
    const porMotivo = publicacion.reportes.reduce<Record<string, number>>(
      (acc, r) => {
        acc[r.motivo] = (acc[r.motivo] || 0) + 1;
        return acc;
      },
      {}
    );

    return NextResponse.json({
      publicacion,
      stats: {
        totalReportes: publicacion.reportes.length,
        reportesPorEstado,
        porMotivo,
      },
    });
  } catch (error) {
    console.error("[GET /admin/publicaciones/[id]/reportes] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener detalle de la publicación" },
      { status: 500 }
    );
  }
}
