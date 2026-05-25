import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// ── PUT /api/usuarios/[id]/publicaciones/[pubId] ──────────────────────────────
// Recibe FormData con campo "imagenes" (uno o varios File) y los guarda en
// /public/uploads/, registrando cada uno como Medio en la BD.
// Devuelve: { medios: Medio[], message: string }

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pubId: string }> }
) {
  try {
    const { id: userId, pubId: publicacionId } = await params;

    // ── Leer FormData ──────────────────────────────────────────────────────────
    const formData = await request.formData();
    const imagenes = formData.getAll('imagenes') as File[];

    if (!imagenes || imagenes.length === 0) {
      return NextResponse.json(
        { error: 'No se enviaron imágenes' },
        { status: 400 }
      );
    }

    // ── Verificar que la publicación existe y pertenece al usuario ─────────────
    const publicacion = await prisma.publicacion.findFirst({
      where: { id: publicacionId, autorId: userId },
      select: { id: true, titulo: true },
    });

    if (!publicacion) {
      return NextResponse.json(
        { error: 'Publicación no encontrada o no autorizada' },
        { status: 404 }
      );
    }

    // ── Crear directorio uploads si no existe ─────────────────────────────────
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // ── Obtener el orden actual de medios para no pisar ───────────────────────
    const existingCount = await prisma.medio.count({
      where: { publicacionId },
    });

    const medios = [];

    // ── Procesar cada imagen (máximo 5 en total por publicación) ──────────────
    const maxImages = Math.min(imagenes.length, 5 - existingCount);

    for (let i = 0; i < maxImages; i++) {
      const file = imagenes[i];

      // Solo aceptar imágenes
      if (!file.type.startsWith('image/')) continue;
      // Límite de 10 MB
      if (file.size > 10 * 1024 * 1024) continue;

      const buffer = Buffer.from(await file.arrayBuffer());

      // Extensión segura
      const rawExt = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const ext = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(rawExt)
        ? rawExt
        : 'jpg';

      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filepath = join(uploadsDir, filename);

      await writeFile(filepath, buffer);

      const medio = await prisma.medio.create({
        data: {
          url:          `/uploads/${filename}`,
          tipo:         'IMAGEN',
          orden:        existingCount + i,
          altText:      publicacion.titulo,
          tamanoBytes:  file.size,
          publicacionId,
        },
      });

      medios.push(medio);
    }

    if (medios.length === 0) {
      return NextResponse.json(
        { error: 'No se pudo guardar ninguna imagen (formato inválido o tamaño excedido)' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { medios, message: `${medios.length} imagen(es) subida(s) exitosamente` },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PUT /api/usuarios/[id]/publicaciones/[pubId]]', error);
    return NextResponse.json(
      { error: 'Error interno al subir imágenes' },
      { status: 500 }
    );
  }
}
