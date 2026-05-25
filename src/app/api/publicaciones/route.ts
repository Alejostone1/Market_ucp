import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    const categoria = searchParams.get('categoria');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'recientes';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Filtro de rango de precio
    const minPrecio = searchParams.get('minPrecio');
    const maxPrecio = searchParams.get('maxPrecio');

    const where: any = {
      estado: 'APROBADA',
    };

    if (tipo && tipo !== 'all') {
      where.tipo = tipo;
    }

    if (categoria && categoria !== 'all') {
      if (categoria.includes('-')) {
        // Es un ID de categoría
        where.categoriaId = categoria;
      } else {
        // Es un slug de categoría
        where.categoria = {
          slug: categoria,
        };
      }
    }

    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtro de rango de precio (solo publicaciones con precio definido)
    if (minPrecio || maxPrecio) {
      where.precio = {};
      if (minPrecio) where.precio.gte = parseFloat(minPrecio);
      if (maxPrecio) where.precio.lte = parseFloat(maxPrecio);
    }

    // Construir el ordenamiento
    // Nota: nulls: 'last' coloca las publicaciones GRATIS (precio null) al final
    // cuando se ordena por precio ascendente, y al principio en descendente.
    let orderBy: any = { creadoEn: 'desc' };

    switch (sort) {
      case 'precio-asc':
        orderBy = { precio: { sort: 'asc', nulls: 'last' } };
        break;
      case 'precio-desc':
        orderBy = { precio: { sort: 'desc', nulls: 'last' } };
        break;
      case 'populares':
        orderBy = { vistas: 'desc' };
        break;
      case 'recientes':
      default:
        orderBy = { creadoEn: 'desc' };
        break;
    }

    const [publicaciones, total] = await Promise.all([
      prisma.publicacion.findMany({
        where,
        select: {
          id: true,
          titulo: true,
          descripcion: true,
          tipo: true,
          estado: true,
          precio: true,
          tipoPrecio: true,
          vistas: true,
          creadoEn: true,
          fechaEvento: true,
          ubicacionEvento: true,
          cupos: true,
          cuposOcupados: true,
          fechaLimite: true,
          autor: {
            select: {
              id: true,
              nombre: true,
              avatarUrl: true,
            },
          },
          categoria: {
            select: {
              id: true,
              nombre: true,
              slug: true,
              color: true,
            },
          },
          medios: {
            select: {
              id: true,
              url: true,
              tipo: true,
              orden: true,
              altText: true,
            },
            orderBy: { orden: 'asc' },
            take: 1, // Solo primera imagen
          },
          etiquetas: {
            select: {
              etiqueta: {
                select: {
                  nombre: true,
                },
              },
            },
            take: 5, // Limitar etiquetas
          },
          _count: {
            select: {
              favoritos: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.publicacion.count({ where })
    ]);

    return NextResponse.json({
      data: publicaciones,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener publicaciones' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      titulo,
      descripcion,
      tipo,
      categoriaId,
      autorId,
      estado = 'PENDIENTE',
      precio,
      tipoPrecio,
      facultad,
      fechaEvento,
      ubicacionEvento,
      cupos,
      fechaLimite
    } = body;

    // Validaciones básicas
    if (!titulo || !descripcion || !tipo || !categoriaId || !autorId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: titulo, descripcion, tipo, categoriaId, autorId' },
        { status: 400 }
      );
    }

    // Validar que el tipo sea válido
    const tiposValidos = ['PRODUCTO', 'SERVICIO', 'EVENTO', 'CONVOCATORIA'];
    if (!tiposValidos.includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo de publicación no válido' },
        { status: 400 }
      );
    }

    // Validar campos específicos según tipo
    if (tipo === 'EVENTO' && !fechaEvento) {
      return NextResponse.json(
        { error: 'Los eventos requieren fecha de evento' },
        { status: 400 }
      );
    }

    if (tipo === 'CONVOCATORIA' && !fechaLimite) {
      return NextResponse.json(
        { error: 'Las convocatorias requieren fecha límite' },
        { status: 400 }
      );
    }

    // Verificar que la categoría existe
    const categoria = await prisma.categoria.findUnique({
      where: { id: categoriaId }
    });

    if (!categoria) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 400 }
      );
    }

    // Verificar que el autor existe
    const autor = await prisma.usuario.findUnique({
      where: { id: autorId }
    });

    if (!autor) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 400 }
      );
    }

    // Preparar datos para la creación
    const data: any = {
      titulo,
      descripcion,
      tipo,
      categoriaId,
      autorId,
      estado,
      precio: precio && precio > 0 ? parseFloat(precio) : null,
      tipoPrecio: tipoPrecio || null,
      facultad: facultad || null,
    };

    // Agregar campos específicos según tipo
    if (tipo === 'EVENTO') {
      data.fechaEvento = fechaEvento ? new Date(fechaEvento) : null;
      data.ubicacionEvento = ubicacionEvento || null;
      data.cupos = cupos ? parseInt(cupos) : null;
    }

    if (tipo === 'CONVOCATORIA') {
      data.fechaLimite = fechaLimite ? new Date(fechaLimite) : null;
    }

    // Crear la publicación
    const publicacion = await prisma.publicacion.create({
      data,
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            correo: true,
            facultad: true,
          },
        },
        categoria: {
          select: {
            id: true,
            nombre: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json(publicacion, { status: 201 });
  } catch (error) {
    console.error('Error al crear publicación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
