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
 * GET /api/admin/reportes/stats
 *
 * Devuelve KPIs del sistema de reportes para el panel administrativo:
 * - Conteos por estado de reporte
 * - Publicaciones actualmente suspendidas
 * - Top 5 publicaciones más reportadas (pendientes)
 */
export async function GET(request: NextRequest) {
  const admin = getAdminFromCookie(request);
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const [pendientes, revisados, descartados, suspendidas, topReportadas] =
      await Promise.all([
        // Conteo por estado de reporte
        prisma.reporte.count({ where: { estado: "PENDIENTE" } }),
        prisma.reporte.count({ where: { estado: "REVISADO" } }),
        prisma.reporte.count({ where: { estado: "DESCARTADO" } }),

        // Publicaciones actualmente suspendidas por reportes
        prisma.publicacion.count({ where: { estado: "SUSPENDIDA" } }),

        // Top 5 publicaciones con más reportes pendientes
        prisma.reporte.groupBy({
          by: ["publicacionId"],
          where: { estado: "PENDIENTE" },
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 5,
        }),
      ]);

    // Enriquecer el top con datos de la publicación
    const topConDatos = await Promise.all(
      topReportadas.map(async (item) => {
        const pub = await prisma.publicacion.findUnique({
          where: { id: item.publicacionId },
          select: {
            id: true,
            titulo: true,
            estado: true,
            tipo: true,
            medios: {
              select: { url: true },
              orderBy: { orden: "asc" },
              take: 1,
            },
            autor: { select: { nombre: true } },
          },
        });
        return {
          publicacionId: item.publicacionId,
          count: item._count.id,
          publicacion: pub,
        };
      })
    );

    return NextResponse.json({
      pendientes,
      revisados,
      descartados,
      total: pendientes + revisados + descartados,
      suspendidas,
      topReportadas: topConDatos,
    });
  } catch (error) {
    console.error("[GET /admin/reportes/stats] Error:", error);
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 });
  }
}
