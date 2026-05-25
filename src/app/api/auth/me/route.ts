import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/me
 * Verifica y retorna el estado fresco del usuario autenticado desde la DB.
 * Usado por AuthContext en el montaje para detectar cambios de estado
 * (bloqueo, verificación, avatar, etc.) que ocurrieron en otra sesión.
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get("usuario")?.value;

  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let cookieData: { id?: string } | null = null;
  try {
    cookieData = JSON.parse(decodeURIComponent(token));
  } catch {
    return NextResponse.json({ error: "Cookie inválida" }, { status: 401 });
  }

  if (!cookieData?.id) {
    return NextResponse.json({ error: "ID de usuario inválido" }, { status: 401 });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: cookieData.id },
      select: {
        id:            true,
        nombre:        true,
        correo:        true,
        rol:           true,
        facultad:      true,
        semestre:      true,
        avatarUrl:     true,
        telefono:      true,
        verificado:    true,
        bloqueado:     true,
        motivoBloqueo: true,
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(usuario);
  } catch {
    return NextResponse.json({ error: "Error al verificar sesión" }, { status: 500 });
  }
}
