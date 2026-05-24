import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import * as bcrypt from 'bcryptjs';

// ── Validation schemas ────────────────────────────────────────────────────────

const createSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'Nombre demasiado largo').trim(),
  correo: z.string().email('Correo inválido').toLowerCase().trim(),
  contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100),
  rol: z.enum(['ESTUDIANTE', 'ALIADO']),
  facultad: z.string().max(100).trim().optional().nullable(),
  semestre: z.coerce.number().int().min(1, 'Semestre mínimo: 1').max(12, 'Semestre máximo: 12').optional().nullable(),
  telefono: z.string().max(20).trim().optional().nullable(),
  verificado: z.boolean().optional().default(false),
});

const patchSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  nombre: z.string().min(2).max(100).trim().optional(),
  correo: z.string().email().toLowerCase().trim().optional(),
  rol: z.enum(['ESTUDIANTE', 'ALIADO']).optional(),
  facultad: z.string().max(100).trim().optional().nullable(),
  semestre: z.preprocess(
    (v) => (v === null || v === '' || v === undefined ? undefined : v),
    z.coerce.number().int().min(1).max(12).optional()
  ).optional().nullable(),
  telefono: z.string().max(20).trim().optional().nullable(),
  verificado: z.boolean().optional(),
  bloqueado: z.boolean().optional(),
  motivo: z.string().max(500).trim().optional(),
});

// ── SELECT helper (shared shape) ─────────────────────────────────────────────

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

// ── GET — lista paginada + stats globales ────────────────────────────────────

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rol = searchParams.get('rol');
    const bloqueado = searchParams.get('bloqueado');
    const verificado = searchParams.get('verificado');
    const buscar = searchParams.get('buscar')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    // Construir where dinámico
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    if (rol && rol !== 'todos') where.rol = rol;
    if (bloqueado !== null && bloqueado !== '') where.bloqueado = bloqueado === 'true';
    if (verificado !== null && verificado !== '') where.verificado = verificado === 'true';
    if (buscar) {
      where.OR = [
        { nombre: { contains: buscar, mode: 'insensitive' } },
        { correo: { contains: buscar, mode: 'insensitive' } },
      ];
    }

    const [
      usuarios,
      total,
      totalAll,
      totalBloqueados,
      totalVerificados,
      totalEstudiantes,
      totalAliados,
    ] = await Promise.all([
      prisma.usuario.findMany({
        where,
        select: USUARIO_SELECT,
        orderBy: { creadoEn: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.usuario.count({ where }),
      prisma.usuario.count(),
      prisma.usuario.count({ where: { bloqueado: true } }),
      prisma.usuario.count({ where: { verificado: true } }),
      prisma.usuario.count({ where: { rol: 'ESTUDIANTE' } }),
      prisma.usuario.count({ where: { rol: 'ALIADO' } }),
    ]);

    return NextResponse.json({
      usuarios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: totalAll,
        bloqueados: totalBloqueados,
        verificados: totalVerificados,
        estudiantes: totalEstudiantes,
        aliados: totalAliados,
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/usuarios]', error);
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}

// ── POST — crear usuario ─────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { nombre, correo, contrasena, rol, facultad, semestre, telefono, verificado } =
      parsed.data;

    // Verificar correo único
    const existente = await prisma.usuario.findUnique({ where: { correo } });
    if (existente) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con ese correo electrónico' },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(contrasena, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        correo,
        contrasena: hash,
        rol,
        facultad: facultad ?? null,
        semestre: semestre ?? null,
        telefono: telefono ?? null,
        verificado,
      },
      select: USUARIO_SELECT,
    });

    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/usuarios]', error);
    return NextResponse.json({ error: 'Error al crear el usuario' }, { status: 500 });
  }
}

// ── PATCH — editar usuario (campos parciales) ────────────────────────────────

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Destructure motivo separately — it's not a DB column
    const { id, motivo, ...data } = parsed.data;

    // Verificar que el usuario existe
    const existente = await prisma.usuario.findUnique({ where: { id } });
    if (!existente) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar unicidad de correo si cambia
    if (data.correo && data.correo !== existente.correo) {
      const conMismoCorreo = await prisma.usuario.findUnique({
        where: { correo: data.correo },
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
      data,
      select: USUARIO_SELECT,
    });

    // Si se está cambiando el estado de bloqueo, crear una notificación para el usuario
    const cambiandoBloqueo = typeof data.bloqueado === 'boolean' && data.bloqueado !== existente.bloqueado;
    if (cambiandoBloqueo) {
      const mensajeBloqueo = data.bloqueado
        ? `Tu cuenta ha sido suspendida.${motivo ? ` Motivo: ${motivo}` : ''} Contacta a admin@ucp.edu.co para más información.`
        : `Tu cuenta ha sido reactivada.${motivo ? ` Nota: ${motivo}` : ''} Ya puedes acceder al marketplace.`;

      await prisma.notificacion.create({
        data: {
          usuarioId:    id,
          tipo:         data.bloqueado ? 'PUBLICACION_SUSPENDIDA' : 'PUBLICACION_APROBADA',
          referenciaId: id,
          mensaje:      mensajeBloqueo,
          leida:        false,
        },
      }).catch(() => null); // No fallar si la notificación no se puede crear
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('[PATCH /api/admin/usuarios]', error);
    return NextResponse.json({ error: 'Error al actualizar el usuario' }, { status: 500 });
  }
}
