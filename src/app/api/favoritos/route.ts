import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getUserFromCookie(request: NextRequest): string | null {
  const cookie = request.cookies.get("usuario");
  if (!cookie) return null;
  try {
    const user = JSON.parse(decodeURIComponent(cookie.value));
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// GET /api/favoritos — devuelve las publicaciones favoritas del usuario logueado
export async function GET(request: NextRequest) {
  const usuarioId = getUserFromCookie(request);
  if (!usuarioId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const favoritos = await prisma.favorito.findMany({
      where: { usuarioId },
      include: {
        publicacion: {
          include: {
            categoria: true,
            autor: {
              select: {
                id: true,
                nombre: true,
                correo: true,
                avatarUrl: true,
                telefono: true,
              },
            },
            medios: { orderBy: { orden: "asc" } },
            etiquetas: { include: { etiqueta: true } },
          },
        },
      },
      orderBy: { creadoEn: "desc" },
    });

    return NextResponse.json(favoritos.map((f) => f.publicacion));
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
