import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Aumentar límite de body para subida de imágenes (Vercel: 4.5 MB por defecto → 10 MB)
export const maxDuration = 30; // segundos máximos de ejecución en Vercel

// ── Util: convertir File a base64 data URL y guardar en BD ────────────────────
// Usamos data URLs (base64) para evitar dependencias de sistema de archivos.
// Es la solución más portable para entornos de desarrollo locales.
async function guardarImagen(
  file: File,
  orden: number,
  publicacionId: string,
  titulo: string,
) {
  // Leer el contenido del archivo como buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer      = Buffer.from(arrayBuffer);
  const base64      = buffer.toString('base64');

  // Determinar MIME type (fallback a jpeg si está vacío)
  const mimeType = file.type && file.type.startsWith('image/')
    ? file.type
    : 'image/jpeg';

  const dataUrl = `data:${mimeType};base64,${base64}`;

  return prisma.medio.create({
    data: {
      url:          dataUrl,
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

    // Parsear FormData
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (parseErr) {
      console.error('[PUT upload] Error al parsear FormData:', parseErr);
      return NextResponse.json(
        { error: 'No se pudo leer el cuerpo de la petición' },
        { status: 400 }
      );
    }

    const imagenes = formData.getAll('imagenes') as File[];

    if (!imagenes || imagenes.length === 0) {
      return NextResponse.json(
        { error: 'No se enviaron imágenes' },
        { status: 400 }
      );
    }

    // Verificar publicación
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

    const existingCount = await prisma.medio.count({
      where: { publicacionId: publicationId },
    });

    const medios   = [];
    const maxImages = Math.min(imagenes.length, 5 - existingCount);

    for (let i = 0; i < maxImages; i++) {
      const file = imagenes[i];

      // Validar que sea imagen
      if (!file || typeof file === 'string') continue;
      if (!file.type || !file.type.startsWith('image/')) continue;
      // Validar tamaño (máx. 10 MB)
      if (file.size > 10 * 1024 * 1024) continue;

      try {
        const medio = await guardarImagen(
          file,
          existingCount + i,
          publicationId,
          publicacion.titulo,
        );
        medios.push(medio);
      } catch (imgErr) {
        console.error(`[PUT upload] Error procesando imagen ${i}:`, imgErr);
        // Continúa con las demás imágenes
      }
    }

    if (medios.length === 0) {
      return NextResponse.json(
        { error: 'No se pudo guardar ninguna imagen. Verifica formato (JPG/PNG/WEBP) y tamaño (máx. 10 MB).' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      medios,
      message: `${medios.length} imagen(es) subida(s) correctamente`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[PUT /api/usuarios/[id]/publicaciones/[publicationId]]', msg);
    return NextResponse.json(
      { error: `Error interno al subir imágenes: ${msg}` },
      { status: 500 }
    );
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

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (parseErr) {
      console.error('[PATCH publicacion] Error al parsear FormData:', parseErr);
      return NextResponse.json(
        { error: 'No se pudo leer el cuerpo de la petición' },
        { status: 400 }
      );
    }

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

    // ── Campos de texto ────────────────────────────────────────────────────────
    const titulo      = formData.get('titulo')      as string | null;
    const descripcion = formData.get('descripcion') as string | null;
    const tipo        = formData.get('tipo')        as string | null;
    const categoriaId = formData.get('categoriaId') as string | null;
    const precioRaw   = formData.get('precio')      as string | null;
    const tipoPrecio  = formData.get('tipoPrecio')  as string | null;

    // Parsear mediosAEliminar con fallback seguro
    let mediosAEliminar: string[] = [];
    try {
      const raw = formData.get('mediosAEliminar') as string | null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) mediosAEliminar = parsed;
      }
    } catch {
      mediosAEliminar = [];
    }

    // Construir datos de actualización con solo campos presentes
    const updateData: Record<string, unknown> = {};
    if (titulo      !== null) updateData.titulo      = titulo;
    if (descripcion !== null) updateData.descripcion = descripcion;
    if (tipo        !== null) updateData.tipo        = tipo;
    if (categoriaId !== null) updateData.categoriaId = categoriaId;

    if (precioRaw) {
      const precioNum = parseFloat(precioRaw);
      if (!isNaN(precioNum)) updateData.precio = precioNum;
      if (tipoPrecio) updateData.tipoPrecio = tipoPrecio;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.publicacion.update({
        where: { id: publicationId },
        data:  updateData,
      });
    }

    // ── Eliminar medios marcados ────────────────────────────────────────────────
    if (mediosAEliminar.length > 0) {
      await prisma.medio.deleteMany({
        where: { id: { in: mediosAEliminar } },
      });
    }

    // ── Agregar nuevos medios ──────────────────────────────────────────────────
    const mediosFiles = formData.getAll('medios') as File[];
    if (mediosFiles.length > 0) {
      const existingCount = await prisma.medio.count({
        where: { publicacionId: publicationId },
      });

      for (let i = 0; i < mediosFiles.length; i++) {
        const file = mediosFiles[i];
        if (!file || typeof file === 'string') continue;
        if (!file.type || !file.type.startsWith('image/')) continue;
        if (file.size > 10 * 1024 * 1024) continue;

        try {
          await guardarImagen(
            file,
            existingCount + i,
            publicationId,
            (titulo || publicacion.titulo),
          );
        } catch (imgErr) {
          console.error(`[PATCH publicacion] Error procesando imagen ${i}:`, imgErr);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[PATCH /api/usuarios/[id]/publicaciones/[publicationId]]', msg);
    return NextResponse.json(
      { error: `Error al actualizar publicación: ${msg}` },
      { status: 500 }
    );
  }
}
