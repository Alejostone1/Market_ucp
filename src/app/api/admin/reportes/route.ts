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

// GET — listar reportes con filtros y paginación
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));

    const where: Record<string, unknown> = {};
    if (estado && estado !== "todos") where.estado = estado;

    const [reportes, total, pendingCount] = await Promise.all([
      prisma.reporte.findMany({
        where,
        include: {
          reportante: { select: { id: true, nombre: true, correo: true } },
          publicacion: {
            select: {
              id: true,
              titulo: true,
              estado: true,
              tipo: true,
              medios: { select: { url: true }, orderBy: { orden: "asc" }, take: 1 },
              autor: { select: { id: true, nombre: true, correo: true } },
            },
          },
        },
        orderBy: { creadoEn: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reporte.count({ where }),
      prisma.reporte.count({ where: { estado: "PENDIENTE" } }),
    ]);

    return NextResponse.json({
      reportes,
      pendingCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error al obtener reportes:", error);
    return NextResponse.json({ error: "Error al obtener reportes" }, { status: 500 });
  }
}

// PATCH — resolver reporte (admin)
export async function PATCH(request: NextRequest) {
  const admin = getAdminFromCookie(request);
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      id,
      estado,          // "REVISADO" | "DESCARTADO"
      nota,            // nota del admin (va a HistorialPublicacion)
      accionPublicacion, // "ninguna" | "archivar" | "rechazar" | "eliminar"
    } = body;

    if (!id || !["REVISADO", "DESCARTADO"].includes(estado)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    // Cargar reporte actual
    const reporte = await prisma.reporte.findUnique({
      where: { id },
      include: {
        publicacion: { select: { id: true, estado: true, autorId: true, titulo: true } },
      },
    });

    if (!reporte) {
      return NextResponse.json({ error: "Reporte no encontrado" }, { status: 404 });
    }

    // Actualizar estado del reporte (SIN tocar descripcion del usuario)
    await prisma.reporte.update({
      where: { id },
      data: { estado },
    });

    // Acción sobre la publicación
    if (accionPublicacion !== "ninguna" && accionPublicacion !== "DESCARTADO") {
      const pub = reporte.publicacion;

      if (accionPublicacion === "eliminar") {
        await prisma.publicacion.delete({ where: { id: pub.id } });
      } else if (accionPublicacion === "archivar" || accionPublicacion === "rechazar") {
        const nuevoEstado =
          accionPublicacion === "archivar" ? "ARCHIVADA" : "RECHAZADA";

        await prisma.publicacion.update({
          where: { id: pub.id },
          data: { estado: nuevoEstado },
        });

        // Historial de moderación
        await prisma.historialPublicacion.create({
          data: {
            publicacionId: pub.id,
            estadoAnterior: pub.estado as "PENDIENTE" | "APROBADA" | "RECHAZADA" | "ARCHIVADA",
            estadoNuevo: nuevoEstado as "PENDIENTE" | "APROBADA" | "RECHAZADA" | "ARCHIVADA",
            nota: nota || `Reporte resuelto por administrador`,
            adminId: admin.id,
          },
        });

        // Notificar al autor de la publicación
        await prisma.notificacion.create({
          data: {
            usuarioId: pub.autorId,
            tipo: "PUBLICACION_RECHAZADA",
            referenciaId: pub.id,
            mensaje: `Tu publicación "${pub.titulo}" fue ${
              nuevoEstado === "ARCHIVADA" ? "archivada" : "rechazada"
            } debido a un reporte de contenido.`,
            leida: false,
          },
        });
      }
    }

    // Notificar al reportante que su reporte fue resuelto
    await prisma.notificacion.create({
      data: {
        usuarioId: reporte.reportanteId,
        tipo: "REPORTE_RESUELTO",
        referenciaId: id,
        mensaje:
          estado === "REVISADO"
            ? "Tu reporte fue revisado y se tomaron acciones correspondientes."
            : "Tu reporte fue revisado pero no se encontraron infracciones.",
        leida: false,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al actualizar reporte:", error);
    return NextResponse.json({ error: "Error al actualizar reporte" }, { status: 500 });
  }
}
