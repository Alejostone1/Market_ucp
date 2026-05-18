import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        correo: true,
        rol: true,
        facultad: true,
        avatarUrl: true,
        telefono: true,
        verificado: true,
        creadoEn: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { nombre, telefono, facultad, avatarUrl } = body;

    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        ...(nombre && { nombre }),
        ...(telefono !== undefined && { telefono }),
        ...(facultad !== undefined && { facultad }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        nombre: true,
        correo: true,
        rol: true,
        facultad: true,
        avatarUrl: true,
        telefono: true,
        verificado: true,
        creadoEn: true,
      },
    });

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}
