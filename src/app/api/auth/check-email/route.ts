import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/check-email?correo=xxx
 * Verifica si un correo ya está registrado en el sistema.
 * Usado por el formulario de registro para validación en tiempo real.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const correo = searchParams.get("correo")?.toLowerCase().trim();

  if (!correo || correo.length < 3) {
    return NextResponse.json({ exists: false });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { correo },
      select: { id: true },
    });

    return NextResponse.json({ exists: !!usuario });
  } catch {
    // En caso de error de DB, no bloquear el formulario
    return NextResponse.json({ exists: false });
  }
}
