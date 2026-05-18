import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const publicacionId = formData.get('publicacionId') as string;
    const altText = formData.get('altText') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo se permiten imágenes.' },
        { status: 400 }
      );
    }

    // Validar tamaño (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Máximo 5MB.' },
        { status: 400 }
      );
    }

    // Crear directorio de uploads si no existe
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directorio ya existe
    }

    // Generar nombre único
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const filename = `${timestamp}_${random}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filepath = join(uploadsDir, filename);

    // Guardar archivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Guardar en base de datos si se proporciona publicacionId
    if (publicacionId) {
      // Obtener el orden actual (para mantener el orden)
      const lastMedio = await prisma.medio.findFirst({
        where: { publicacionId },
        orderBy: { orden: 'desc' }
      });

      const medio = await prisma.medio.create({
        data: {
          url: `/uploads/${filename}`,
          tipo: 'IMAGEN',
          orden: (lastMedio?.orden || 0) + 1,
          altText: altText || null,
          tamanoBytes: file.size,
          publicacionId
        }
      });

      return NextResponse.json({
        success: true,
        url: `/uploads/${filename}`,
        medio
      });
    }

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      filename,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json(
      { error: 'Error al subir el archivo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const medioId = searchParams.get('medioId');

    if (!medioId) {
      return NextResponse.json(
        { error: 'Se requiere medioId' },
        { status: 400 }
      );
    }

    // Obtener información del medio
    const medio = await prisma.medio.findUnique({
      where: { id: medioId }
    });

    if (!medio) {
      return NextResponse.json(
        { error: 'Medio no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar de la base de datos
    await prisma.medio.delete({
      where: { id: medioId }
    });

    // Opcional: eliminar archivo físico (requiere fs.unlink)
    // const filepath = join(process.cwd(), 'public', medio.url);
    // await unlink(filepath);

    return NextResponse.json({
      success: true,
      message: 'Medio eliminado correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar medio:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el medio' },
      { status: 500 }
    );
  }
}
