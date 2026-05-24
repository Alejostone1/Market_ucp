import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── Utilidades ────────────────────────────────────────────────────────────────

function getUserFromCookie(request: NextRequest): { id: string; rol: string } | null {
  const cookie = request.cookies.get("usuario");
  if (!cookie) return null;
  try {
    return JSON.parse(decodeURIComponent(cookie.value));
  } catch {
    return null;
  }
}

const MOTIVOS_VALIDOS = [
  "SPAM",
  "CONTENIDO_INAPROPIADO",
  "INFORMACION_FALSA",
  "DUPLICADO",
  "OTRO",
] as const;

// Umbral de reportes pendientes que activa la moderación automática
const UMBRAL_AUTO_MODERACION = 5;

// ── GET — comprobar si el usuario ya reportó esta publicación ─────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromCookie(request);
  if (!user) return NextResponse.json({ reportado: false });

  const { id: publicacionId } = await params;

  const existente = await prisma.reporte.findUnique({
    where: {
      reportanteId_publicacionId: { reportanteId: user.id, publicacionId },
    },
    select: { id: true, estado: true, motivo: true },
  });

  return NextResponse.json({
    reportado: !!existente,
    estado: existente?.estado ?? null,
    motivo: existente?.motivo ?? null,
  });
}

// ── POST — crear reporte ──────────────────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Autenticación obligatoria
  const user = getUserFromCookie(request);
  if (!user) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para reportar" },
      { status: 401 }
    );
  }

  const { id: publicacionId } = await params;

  // 2. Validar que la publicación existe y obtener datos necesarios
  const publicacion = await prisma.publicacion.findUnique({
    where: { id: publicacionId },
    select: { id: true, autorId: true, titulo: true, estado: true },
  });

  if (!publicacion) {
    return NextResponse.json(
      { error: "Publicación no encontrada" },
      { status: 404 }
    );
  }

  // 3. No puede reportar su propia publicación
  if (publicacion.autorId === user.id) {
    return NextResponse.json(
      { error: "No puedes reportar tu propia publicación" },
      { status: 400 }
    );
  }

  // 4. Validar body
  const body = await request.json();
  const { motivo, descripcion } = body;

  if (!MOTIVOS_VALIDOS.includes(motivo)) {
    return NextResponse.json({ error: "Motivo inválido" }, { status: 400 });
  }

  // 5. Crear reporte — la constraint @@unique captura duplicados a nivel DB
  try {
    await prisma.reporte.create({
      data: {
        reportanteId: user.id,
        publicacionId,
        motivo,
        descripcion: descripcion?.trim().slice(0, 500) || null,
        estado: "PENDIENTE",
      },
    });

    // 6. Notificar a todos los administradores con el tipo correcto REPORTE_NUEVO
    const admins = await prisma.usuario.findMany({
      where: { rol: "ADMIN" },
      select: { id: true },
    });

    if (admins.length > 0) {
      await prisma.notificacion.createMany({
        data: admins.map((admin) => ({
          usuarioId: admin.id,
          tipo: "REPORTE_NUEVO" as const,
          referenciaId: publicacionId,
          mensaje: `Nueva publicación reportada: "${publicacion.titulo}" · Motivo: ${motivo}`,
          leida: false,
        })),
        skipDuplicates: true,
      });
    }

    // 7. Contar reportes PENDIENTES en la publicación
    const reportCount = await prisma.reporte.count({
      where: { publicacionId, estado: "PENDIENTE" },
    });

    // 8. Moderación automática al alcanzar el umbral (solo si está APROBADA)
    if (reportCount >= UMBRAL_AUTO_MODERACION && publicacion.estado === "APROBADA") {
      await prisma.publicacion.update({
        where: { id: publicacionId },
        data: { estado: "SUSPENDIDA" },
      });

      // Auditoría del sistema (adminId: null = acción automática)
      await prisma.historialPublicacion.create({
        data: {
          publicacionId,
          estadoAnterior: publicacion.estado,
          estadoNuevo: "SUSPENDIDA",
          nota: `[SISTEMA] Publicación suspendida automáticamente al acumular ${reportCount} reportes pendientes. Pendiente de revisión administrativa.`,
          adminId: null,
          esAutomatico: true,
        },
      });

      // Notificar al autor de la publicación
      await prisma.notificacion.create({
        data: {
          usuarioId: publicacion.autorId,
          tipo: "PUBLICACION_SUSPENDIDA",
          referenciaId: publicacionId,
          mensaje: `Tu publicación "${publicacion.titulo}" fue suspendida temporalmente de forma automática al recibir múltiples reportes. Un administrador la revisará pronto.`,
          leida: false,
        },
      });

      // Notificar a admins sobre la suspensión automática
      if (admins.length > 0) {
        await prisma.notificacion.createMany({
          data: admins.map((admin) => ({
            usuarioId: admin.id,
            tipo: "REPORTE_NUEVO" as const,
            referenciaId: publicacionId,
            mensaje: `⚠️ Publicación "${publicacion.titulo}" suspendida automáticamente tras ${reportCount} reportes. Requiere revisión.`,
            leida: false,
          })),
          skipDuplicates: true,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Reporte enviado correctamente",
    });
  } catch (error: unknown) {
    // Unique constraint violation → ya reportó anteriormente
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Ya reportaste esta publicación anteriormente" },
        { status: 409 }
      );
    }
    console.error("[POST /reportar] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
