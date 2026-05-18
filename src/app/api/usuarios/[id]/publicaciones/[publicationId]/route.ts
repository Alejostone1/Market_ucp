import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; publicationId: string }> }
) {
  try {
    const { id, publicationId } = await params;
    const formData = await request.formData();

    // Verificar que la publicación pertenece al usuario
    const publicacion = await prisma.publicacion.findFirst({
      where: {
        id: publicationId,
        autorId: id,
      },
    });

    if (!publicacion) {
      return NextResponse.json(
        { error: 'Publicación no encontrada o no pertenece al usuario' },
        { status: 404 }
      );
    }

    // Actualizar datos básicos
    const titulo = formData.get('titulo') as string;
    const descripcion = formData.get('descripcion') as string;
    const tipo = formData.get('tipo') as string;
    const categoriaId = formData.get('categoriaId') as string;
    const precio = formData.get('precio') as string;
    const tipoPrecio = formData.get('tipoPrecio') as string;
    const mediosAEliminar = JSON.parse(formData.get('mediosAEliminar') as string || '[]');

    const updateData: any = {
      titulo,
      descripcion,
      tipo,
      categoriaId,
    };

    if (precio) {
      updateData.precio = parseFloat(precio);
      updateData.tipoPrecio = tipoPrecio;
    }

    await prisma.publicacion.update({
      where: { id: publicationId },
      data: updateData,
    });

    // Eliminar medios marcados
    if (mediosAEliminar.length > 0) {
      await prisma.medio.deleteMany({
        where: {
          id: { in: mediosAEliminar },
        },
      });
    }

    // Agregar nuevos medios
    const medios = formData.getAll('medios') as File[];
    if (medios && medios.length > 0) {
      for (let i = 0; i < medios.length; i++) {
        const medio = medios[i];
        const bytes = await medio.arrayBuffer();
        const buffer = Buffer.from(bytes);

        await prisma.medio.create({
          data: {
            publicacionId: publicationId,
            url: `/uploads/${Date.now()}-${medio.name}`,
            tipo: medio.type,
            orden: i,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar publicación:', error);
    return NextResponse.json(
      { error: 'Error al actualizar publicación' },
      { status: 500 }
    );
  }
}
