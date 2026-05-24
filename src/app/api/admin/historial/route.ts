import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ── GET /api/admin/historial ─────────────────────────────────────────────────
// Query params:
//   adminId   — filter by responsible admin (or "sistema" for automatic)
//   desde     — ISO date string, start of range (inclusive)
//   hasta     — ISO date string, end of range (inclusive)
//   accion    — estadoNuevo filter (APROBADA | RECHAZADA | SUSPENDIDA | ARCHIVADA | PENDIENTE)
//   buscar    — free-text search on publication title
//   page      — page number (default: 1)
//   limit     — page size (default: 25, max: 100)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const adminId = searchParams.get('adminId')?.trim() || null;
    const desde   = searchParams.get('desde')?.trim()   || null;
    const hasta   = searchParams.get('hasta')?.trim()   || null;
    const accion  = searchParams.get('accion')?.trim()  || null;
    const buscar  = searchParams.get('buscar')?.trim()  || null;
    const page    = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit   = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25')));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    // Admin filter — "sistema" means esAutomatico = true, no admin
    if (adminId === 'sistema') {
      where.esAutomatico = true;
    } else if (adminId) {
      where.adminId      = adminId;
      where.esAutomatico = false;
    }

    // Date range
    if (desde || hasta) {
      where.creadoEn = {};
      if (desde) where.creadoEn.gte = new Date(desde);
      if (hasta) {
        // Hasta is inclusive, so go to end of day
        const end = new Date(hasta);
        end.setHours(23, 59, 59, 999);
        where.creadoEn.lte = end;
      }
    }

    // Action filter maps to estadoNuevo
    if (accion) where.estadoNuevo = accion;

    // Publication title search
    if (buscar) {
      where.publicacion = { titulo: { contains: buscar, mode: 'insensitive' } };
    }

    const [registros, total] = await Promise.all([
      prisma.historialPublicacion.findMany({
        where,
        include: {
          publicacion: {
            select: { id: true, titulo: true, tipo: true },
          },
          admin: {
            select: { id: true, nombre: true, correo: true, avatarUrl: true },
          },
        },
        orderBy: { creadoEn: 'desc' },
        skip:  (page - 1) * limit,
        take:  limit,
      }),
      prisma.historialPublicacion.count({ where }),
    ]);

    // Collect unique admins for the filter dropdown
    const admins = await prisma.usuario.findMany({
      where: { rol: 'ADMIN' },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json({
      registros,
      admins,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/historial]', error);
    return NextResponse.json({ error: 'Error al obtener historial' }, { status: 500 });
  }
}
