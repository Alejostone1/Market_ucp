import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// ── Util: escribir imagen al sistema de archivos ───────────────────────────────
async function guardarImagen(file: File, orden: number, publicacionId: string, titulo: string) {
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const rawExt = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const ext = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(rawExt) ? rawExt : 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filepath = join(uploadsDir, filename);

  await writeFile(filepath, buffer);

  return prisma.medio.create({
    data: {
      url:          `/uploads/${filename}`,
      tipo:         'IMAGEN',
      orden,
      altText:      titulo,
      tamanoBytes:  file.size,
      publicacionId,
    },
  });
}

// ── PUT /api/usuarios/[id]/publicaciones/[publicationId] ───────────────────────
// Sube imágenes para una publicación recién creada.
// Body: FormData con campo "imagenes" (uno o varios File)
// Devuelve: { medios, message }

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; publicationId: string }> }
) {
  try {
    const { id: userId, publicationId } = await params;

    const formData = await request.formData();
    const imagenes = formData.getAll('imagenes') as File[];

    if (!imagenes || imagenes.length === 0) {
      return NextResponse.json({ error: 'No se enviaron imágenes' }, { status: 400 });
    }

    // Verificar que la publicación pertenece al usuario
    const publicacion = await prisma.publicacion.findFirst({
      where: { id: publicationId, autorId: userId },
      select: { id: true, titulo: true },
    });

    if (!publicacion) {
      return NextResponse.json(
        { error: 'Publicación no encontrada o no autorizada' },
        { status: 404 }
      );
    }

    const existingCount = await prisma.medio.count({ where: { publicacionId: publicationId } });
    const medios = [];
    const maxImages = Math.min(imagenes.length, 5 - existingCount);

    for (let i = 0; i < maxImages; i++) {
      const file = imagenes[i];
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 10 * 1024 * 1024) continue;

      const medio = await guardarImagen(file, existingCount + i, publicationId, publicacion.titulo);
      medios.push(medio);
    }

    if (medios.length === 0) {
      return NextResponse.json(
        { error: 'No se pudo guardar ninguna imagen (formato inválido o tamaño excedido)' },
        { status: 400 }
      );
    }

    return NextResponse.json({ medios, message: `${medios.length} imagen(es) subida(s)` });
  } catch (error) {
    console.error('[PUT /api/usuarios/[id]/publicaciones/[publicationId]]', error);
    return NextResponse.json({ error: 'Error interno al subir imágenes' }, { status: 500 });
  }
}

// ── PATCH /api/usuarios/[id]/publicaciones/[publicationId] ─────────────────────
// Edita datos de una publicación existente y gestiona sus medios.
// Body: FormData con campos de texto + "medios" (File[]) + "mediosAEliminar" (JSON)

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; publicationId: string }> }
) {
  try {
    const { id, publicationId } = await params;
    const formData = await request.formData();

    // Verificar que la publicación pertenece al usuario
    const publicacion = await prisma.publicacion.findFirst({
      where: { id: publicationId, autorId: id },
      select: { id: true, titulo: true },
    });

    if (!publicacion) {
      return NextResponse.json(
        { error: 'Publicación no encontrada o no pertenece al usuario' },
        { status: 404 }
      );
    }

    // Campos de texto
    const titulo       = formData.get('titulo')      as string;
    const descripcion  = formData.get('descripcion') as string;
    const tipo         = formData.get('tipo')        as string;
    const categoriaId  = formData.get('categoriaId') as string;
    const precio       = formData.get('precio')      as string | null;
    const tipoPrecio   = formData.get('tipoPrecio')  as string | null;
    const mediosAEliminar: string[] = JSON.parse(
      (formData.get('mediosAEliminar') as string) || '[]'
    );

    const updateData: Record<string, unknown> = { titulo, descripcion, tipo, categoriaId };
    if (precio) {
      updateData.precio    = parseFloat(precio);
      updateData.tipoPrecio = tipoPrecio;
    }

    await prisma.publicacion.update({ where: { id: publicationId }, data: updateData });

    // Eliminar medios marcados
    if (mediosAEliminar.length > 0) {
      await prisma.medio.deleteMany({ where: { id: { in: mediosAEliminar } } });
    }

    // Agregar nuevos medios (escribe al disco antes de crear el registro)
    const mediosFiles = formData.getAll('medios') as File[];
    if (mediosFiles.length > 0) {
      const existingCount = await prisma.medio.count({ where: { publicacionId: publicationId } });

      for (let i = 0; i < mediosFiles.length; i++) {
        const file = mediosFiles[i];
        if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) continue;
        await guardarImagen(file, existingCount + i, publicationId, titulo || publicacion.titulo);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PATCH /api/usuarios/[id]/publicaciones/[publicationId]]', error);
    return NextResponse.json({ error: 'Error al actualizar publicación' }, { status: 500 });
  }
}
