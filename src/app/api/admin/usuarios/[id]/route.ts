import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// ── Validation ────────────────────────────────────────────────────────────────

const patchSchema = z.object({
  nombre: z.string().min(2).max(100).trim().optional(),
  correo: z.string().email().toLowerCase().trim().optional(),
  rol: z.enum(['ESTUDIANTE', 'ALIADO']).optional(),
  facultad: z.string().max(100).trim().optional().nullable(),
  semestre: z.coerce.number().int().min(1).max(12).optional().nullable(),
  telefono: z.string().max(20).trim().optional().nullable(),
  verificado: z.boolean().optional(),
  bloqueado: z.boolean().optional(),
});

// ── SELECT helper ─────────────────────────────────────────────────────────────

const USUARIO_SELECT = {
  id: true,
  nombre: true,
  correo: true,
  rol: true,
  facultad: true,
  semestre: true,
  avatarUrl: true,
  telefono: true,
  bloqueado: true,
  verificado: true,
  creadoEn: true,
  _count: { select: { publicaciones: true } },
} as const;

// ── GET — obtener usuario individual ─────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: USUARIO_SELECT,
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('[GET /api/admin/usuarios/[id]]', error);
    return NextResponse.json({ error: 'Error al obtener el usuario' }, { status: 500 });
  }
}

// ── PATCH — editar usuario individual ────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const existente = await prisma.usuario.findUnique({ where: { id } });
    if (!existente) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar unicidad de correo si cambia
    if (parsed.data.correo && parsed.data.correo !== existente.correo) {
      const conMismoCorreo = await prisma.usuario.findUnique({
        where: { correo: parsed.data.correo },
      });
      if (conMismoCorreo) {
        return NextResponse.json(
          { error: 'Ya existe otro usuario con ese correo electrónico' },
          { status: 409 }
        );
      }
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: parsed.data,
      select: USUARIO_SELECT,
    });

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('[PATCH /api/admin/usuarios/[id]]', error);
    return NextResponse.json({ error: 'Error al actualizar el usuario' }, { status: 500 });
  }
}
