import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── Utilidades ────────────────────────────────────────────────────────────────

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

// ── GET — listar reportes con filtros, búsqueda y paginación ─────────────────

export async function GET(request: NextRequest) {
  // 🔒 SEGURIDAD: solo administradores
  const admin = getAdminFromCookie(request);
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const estado  = searchParams.get("estado");
    const motivo  = searchParams.get("motivo");
    const buscar  = searchParams.get("buscar")?.trim();
    const page    = Math.max(1, parseInt(searchParams.get("page")  || "1"));
    const limit   = Math.min(50, parseInt(searchParams.get("limit") || "20"));

    // Construir filtro dinámico
    const where: Record<string, unknown> = {};

    if (estado && estado !== "todos") where.estado = estado;
    if (motivo && motivo !== "todos") where.motivo = motivo;

    // Búsqueda por texto: reportante nombre/correo o título de publicación
    if (buscar) {
      where.OR = [
        { reportante: { nombre:  { contains: buscar, mode: "insensitive" } } },
        { reportante: { correo:  { contains: buscar, mode: "insensitive" } } },
        { publicacion: { titulo: { contains: buscar, mode: "insensitive" } } },
      ];
    }

    const [reportes, total, pendingCount] = await Promise.all([
      prisma.reporte.findMany({
        where,
        include: {
          reportante: {
            select: { id: true, nombre: true, correo: true, avatarUrl: true, rol: true },
          },
          publicacion: {
            select: {
              id: true,
              titulo: true,
              descripcion: true,
              estado: true,
              tipo: true,
              medios: {
                select: { url: true, altText: true },
                orderBy: { orden: "asc" },
                take: 1,
              },
              autor: {
                select: { id: true, nombre: true, correo: true, avatarUrl: true },
              },
              _count: { select: { reportes: true } },
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
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /admin/reportes] Error:", error);
    return NextResponse.json({ error: "Error al obtener reportes" }, { status: 500 });
  }
}

// ── PATCH — resolver reporte y aplicar acción sobre publicación (admin) ───────

export async function PATCH(request: NextRequest) {
  const admin = getAdminFromCookie(request);
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      id,
      estado,              // "REVISADO" | "DESCARTADO"
      nota,                // observación del admin (va a HistorialPublicacion)
      accionPublicacion,   // "ninguna" | "suspender" | "archivar" | "rechazar" | "eliminar"
    } = body;

    // Validación de datos de entrada
    if (!id || !["REVISADO", "DESCARTADO"].includes(estado)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    if (
      accionPublicacion &&
      !["ninguna", "suspender", "archivar", "rechazar", "eliminar"].includes(accionPublicacion)
    ) {
      return NextResponse.json({ error: "Acción sobre publicación inválida" }, { status: 400 });
    }

    // Cargar reporte actual con su publicación
    const reporte = await prisma.reporte.findUnique({
      where: { id },
      include: {
        publicacion: {
          select: { id: true, estado: true, autorId: true, titulo: true },
        },
      },
    });

    if (!reporte) {
      return NextResponse.json({ error: "Reporte no encontrado" }, { status: 404 });
    }

    // ── 1. Actualizar estado del reporte + timestamp de resolución ──────────
    await prisma.reporte.update({
      where: { id },
      data: {
        estado,
        resolvidoEn:    new Date(),
        resolvidoPorId: admin.id,
      },
    });

    // ── 2. Aplicar acción sobre la publicación (si corresponde) ─────────────
    const pub = reporte.publicacion;
    const debeActuar =
      accionPublicacion &&
      accionPublicacion !== "ninguna" &&
      estado !== "DESCARTADO";    // al descartar el reporte no se toca la pub

    if (debeActuar && pub) {
      if (accionPublicacion === "eliminar") {
        // Borrado definitivo — cascade limpia reportes, historial, medios, etc.
        await prisma.publicacion.delete({ where: { id: pub.id } });

      } else {
        // Cambio de estado de la publicación
        const mapaEstado: Record<string, string> = {
          suspender: "SUSPENDIDA",
          archivar:  "ARCHIVADA",
          rechazar:  "RECHAZADA",
        };
        const nuevoEstado = mapaEstado[accionPublicacion] as
          | "SUSPENDIDA"
          | "ARCHIVADA"
          | "RECHAZADA";

        if (nuevoEstado) {
          await prisma.publicacion.update({
            where: { id: pub.id },
            data: { estado: nuevoEstado },
          });

          // Historial de moderación manual
          await prisma.historialPublicacion.create({
            data: {
              publicacionId:  pub.id,
              estadoAnterior: pub.estado,
              estadoNuevo:    nuevoEstado,
              nota:           nota?.trim() || `Reporte resuelto por administrador — acción: ${accionPublicacion}`,
              adminId:        admin.id,
              esAutomatico:   false,
            },
          });

          // Notificar al autor de la publicación
          const mensajeAutor: Record<string, string> = {
            SUSPENDIDA: `Tu publicación "${pub.titulo}" fue suspendida temporalmente por un administrador debido a un reporte de contenido.`,
            ARCHIVADA:  `Tu publicación "${pub.titulo}" fue archivada por un administrador debido a un reporte de contenido.`,
            RECHAZADA:  `Tu publicación "${pub.titulo}" fue rechazada por un administrador debido a un reporte de contenido.`,
          };

          await prisma.notificacion.create({
            data: {
              usuarioId:    pub.autorId,
              tipo:         nuevoEstado === "SUSPENDIDA"
                              ? "PUBLICACION_SUSPENDIDA"
                              : "PUBLICACION_RECHAZADA",
              referenciaId: pub.id,
              mensaje:      mensajeAutor[nuevoEstado] || `Tu publicación fue moderada.`,
              leida:        false,
            },
          });
        }
      }
    }

    // ── 3. Notificar al reportante que su reporte fue atendido ───────────────
    await prisma.notificacion.create({
      data: {
        usuarioId:    reporte.reportanteId,
        tipo:         "REPORTE_RESUELTO",
        referenciaId: id,
        mensaje:
          estado === "REVISADO"
            ? "Tu reporte fue revisado y se tomaron las acciones correspondientes. Gracias por ayudar a mantener el marketplace seguro."
            : "Tu reporte fue revisado por el equipo de moderación pero no se encontraron infracciones en esta ocasión.",
        leida: false,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PATCH /admin/reportes] Error:", error);
    return NextResponse.json({ error: "Error al actualizar reporte" }, { status: 500 });
  }
}
