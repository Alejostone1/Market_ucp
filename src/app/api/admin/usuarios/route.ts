import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const updateUsuarioSchema = z.object({
  bloqueado: z.boolean(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rol = searchParams.get('rol');
    const bloqueado = searchParams.get('bloqueado');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};

    if (rol) {
      where.rol = rol;
    }

    if (bloqueado !== null && bloqueado !== undefined) {
      where.bloqueado = bloqueado === 'true';
    }

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        select: {
          id: true,
          nombre: true,
          correo: true,
          rol: true,
          facultad: true,
          avatarUrl: true,
          bloqueado: true,
          verificado: true,
          creadoEn: true,
          _count: {
            select: {
              publicaciones: true,
            },
          },
        },
        orderBy: {
          creadoEn: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.usuario.count({ where }),
    ]);

    return NextResponse.json({
      usuarios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, bloqueado } = body;

    const validatedData = updateUsuarioSchema.parse({ bloqueado });

    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data: {
        bloqueado: validatedData.bloqueado,
      },
      select: {
        id: true,
        nombre: true,
        correo: true,
        rol: true,
        bloqueado: true,
      },
    });

    return NextResponse.json(usuarioActualizado);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}
