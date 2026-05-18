import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function PATCH(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { itemId } = params;
    const { cantidad } = await request.json();

    if (cantidad < 1) {
      return NextResponse.json(
        { error: 'La cantidad debe ser mayor a 0' },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.carritoItem.update({
      where: { id: itemId },
      data: { cantidad },
      include: {
        publicacion: {
          include: {
            autor: true,
            medios: true,
          },
        },
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error al actualizar carrito:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { itemId } = params;

    await prisma.carritoItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: 'Item eliminado del carrito' });
  } catch (error) {
    console.error('Error al eliminar del carrito:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
