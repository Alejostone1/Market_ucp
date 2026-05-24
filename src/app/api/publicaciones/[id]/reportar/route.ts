import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

// GET — comprobar si el usuario ya reportó esta publicación
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromCookie(request);
  if (!user) return NextResponse.json({ reportado: false });

  const { id: publicacionId } = await params;

  const existente = await prisma.reporte.findUnique({
    where: { reportanteId_publicacionId: { reportanteId: user.id, publicacionId } },
  });

  return NextResponse.json({ reportado: !!existente });
}

// POST — crear reporte
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromCookie(request);
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión para reportar" }, { status: 401 });
  }

  const { id: publicacionId } = await params;

  // Validar que la publicación existe
  const publicacion = await prisma.publicacion.findUnique({
    where: { id: publicacionId },
    select: { id: true, autorId: true, titulo: true },
  });

  if (!publicacion) {
    return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 });
  }

  // No puede reportar su propia publicación
  if (publicacion.autorId === user.id) {
    return NextResponse.json(
      { error: "No puedes reportar tu propia publicación" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { motivo, descripcion } = body;

  if (!MOTIVOS_VALIDOS.includes(motivo)) {
    return NextResponse.json({ error: "Motivo inválido" }, { status: 400 });
  }

  // Intentar crear — la constraint @@unique captura duplicados
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

    // Notificar a todos los administradores
    const admins = await prisma.usuario.findMany({
      where: { rol: "ADMIN" },
      select: { id: true },
    });

    if (admins.length > 0) {
      await prisma.notificacion.createMany({
        data: admins.map((admin) => ({
          usuarioId: admin.id,
          tipo: "REPORTE_RESUELTO" as const, // reutilizamos el tipo disponible
          referenciaId: publicacionId,
          mensaje: `Nueva publicación reportada: "${publicacion.titulo}"`,
          leida: false,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ ok: true, message: "Reporte enviado correctamente" });
  } catch (error: unknown) {
    // Unique constraint violation → ya reportado
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
    console.error("Error al crear reporte:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
