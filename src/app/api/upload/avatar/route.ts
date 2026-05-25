import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

/**
 * POST /api/upload/avatar
 * FormData: { file: File, usuarioId: string }
 *
 * Producción (Vercel): sube a Vercel Blob (requiere BLOB_READ_WRITE_TOKEN).
 * Desarrollo local:   guarda en public/uploads/avatars/ como fallback.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file      = formData.get("file")      as File   | null;
    const usuarioId = formData.get("usuarioId") as string | null;

    // ── Validaciones básicas ───────────────────────────────────────────────────
    if (!file)      return NextResponse.json({ error: "No se proporcionó archivo"            }, { status: 400 });
    if (!usuarioId) return NextResponse.json({ error: "usuarioId requerido"                  }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type))
                    return NextResponse.json({ error: "Solo se permiten imágenes JPG, PNG o WebP" }, { status: 400 });
    if (file.size > MAX_SIZE)
                    return NextResponse.json({ error: "La imagen no puede superar los 2 MB"  }, { status: 400 });

    // ── Verificar que el usuario existe ────────────────────────────────────────
    const usuario = await prisma.usuario.findUnique({
      where:  { id: usuarioId },
      select: { id: true },
    });
    if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    // ── Generar nombre único ───────────────────────────────────────────────────
    const ext      = file.type === "image/jpeg" ? "jpg"
                   : file.type === "image/png"  ? "png"
                   : "webp";
    const filename = `avatar_${usuarioId}_${Date.now()}.${ext}`;

    let avatarUrl: string;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // ── Vercel Blob (producción) ─────────────────────────────────────────────
      const { put } = await import("@vercel/blob");
      const blob = await put(`avatars/${filename}`, file, {
        access:      "public",
        contentType: file.type,
      });
      avatarUrl = blob.url;
    } else {
      // ── Filesystem local (desarrollo) ────────────────────────────────────────
      const { writeFile, mkdir } = await import("fs/promises");
      const { join } = await import("path");
      const dir = join(process.cwd(), "public", "uploads", "avatars");
      await mkdir(dir, { recursive: true });
      const bytes = await file.arrayBuffer();
      await writeFile(join(dir, filename), Buffer.from(bytes));
      avatarUrl = `/uploads/avatars/${filename}`;
    }

    // ── Actualizar DB ──────────────────────────────────────────────────────────
    await prisma.usuario.update({
      where: { id: usuarioId },
      data:  { avatarUrl },
    });

    return NextResponse.json({ url: avatarUrl });
  } catch (error) {
    console.error("[POST /api/upload/avatar]", error);
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
  }
}
