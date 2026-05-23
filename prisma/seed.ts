import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.notificacion.deleteMany();
  await prisma.historialPublicacion.deleteMany();
  await prisma.reporte.deleteMany();
  await prisma.mensaje.deleteMany();
  await prisma.conversacion.deleteMany();
  await prisma.favorito.deleteMany();
  await prisma.carritoItem.deleteMany();
  await prisma.etiquetaEnPublicacion.deleteMany();
  await prisma.medio.deleteMany();
  await prisma.publicacion.deleteMany();
  await prisma.etiqueta.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('🧹 Datos existentes eliminados');

  // Crear categorías
  const tecnologia = await prisma.categoria.create({
    data: {
      nombre: 'Tecnología',
      slug: 'tecnologia',
      color: '#3B82F6',
      icono: 'laptop',
      descripcion: 'Productos y servicios tecnológicos',
    },
  });

  const tutorias = await prisma.categoria.create({
    data: {
      nombre: 'Tutorías',
      slug: 'tutorias',
      color: '#10B981',
      icono: 'book',
      descripcion: 'Servicios de enseñanza y tutoría',
    },
  });

  const eventos = await prisma.categoria.create({
    data: {
      nombre: 'Eventos',
      slug: 'eventos',
      color: '#8B5CF6',
      icono: 'calendar',
      descripcion: 'Eventos académicos y culturales',
    },
  });

  const oportunidades = await prisma.categoria.create({
    data: {
      nombre: 'Oportunidades',
      slug: 'oportunidades',
      color: '#F59E0B',
      icono: 'briefcase',
      descripcion: 'Convocatorias y oportunidades profesionales',
    },
  });

  const libros = await prisma.categoria.create({
    data: {
      nombre: 'Libros',
      slug: 'libros',
      color: '#EC4899',
      icono: 'book-open',
      descripcion: 'Libros y material educativo',
    },
  });

  const servicios = await prisma.categoria.create({
    data: {
      nombre: 'Servicios',
      slug: 'servicios',
      color: '#EF4444',
      icono: 'tool',
      descripcion: 'Servicios varios',
    },
  });

  console.log('📁 Categorías creadas');

  // Crear etiquetas
  const etiquetas = await Promise.all([
    prisma.etiqueta.create({ data: { nombre: 'nuevo', usoCount: 0 } }),
    prisma.etiqueta.create({ data: { nombre: 'usado', usoCount: 0 } }),
    prisma.etiqueta.create({ data: { nombre: 'premium', usoCount: 0 } }),
    prisma.etiqueta.create({ data: { nombre: 'oferta', usoCount: 0 } }),
    prisma.etiqueta.create({ data: { nombre: 'urgente', usoCount: 0 } }),
  ]);

  console.log('🏷️  Etiquetas creadas');

  // Hash de contraseñas
  const passwordHash = await bcrypt.hash('password123', 10);

  // Crear 1 administrador, 1 estudiante, 1 aliado
  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Admin UCP',
      correo: 'admin@ucp.edu.co',
      contrasena: passwordHash,
      rol: 'ADMIN',
      verificado: true,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    },
  });

  const estudiante = await prisma.usuario.create({
    data: {
      nombre: 'Carlos Mendoza',
      correo: 'carlos.mendoza@ucp.edu.co',
      contrasena: passwordHash,
      rol: 'ESTUDIANTE',
      facultad: 'Ingeniería de Sistemas',
      semestre: 8,
      telefono: '573012345678',
      verificado: true,
      avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200',
    },
  });

  const aliado = await prisma.usuario.create({
    data: {
      nombre: 'Valentina Giraldo',
      correo: 'valentina.giraldo@ucp.edu.co',
      contrasena: passwordHash,
      rol: 'ALIADO',
      facultad: 'Administración de Empresas',
      telefono: '573045678901',
      verificado: true,
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    },
  });

  console.log('👤 Usuarios creados (1 admin, 1 estudiante, 1 aliado)');

  // Crear 3 PRODUCTOS (todos del estudiante)
  const producto1 = await prisma.publicacion.create({
    data: {
      titulo: 'iPhone 13 Pro 128GB',
      descripcion: 'iPhone en excelente estado, batería al 95%, incluye cargador y caja original. Sin ningún detalle estético.',
      tipo: 'PRODUCTO',
      estado: 'APROBADA',
      precio: 2500000,
      tipoPrecio: 'FIJO',
      categoriaId: tecnologia.id,
      autorId: estudiante.id,
      facultad: 'Ingeniería de Sistemas',
      medios: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
            tipo: 'IMAGEN',
            orden: 0,
            altText: 'iPhone 13 Pro',
          },
        ],
      },
      etiquetas: {
        create: [
          { etiquetaId: etiquetas[1].id },
          { etiquetaId: etiquetas[3].id },
        ],
      },
    },
  });

  const producto2 = await prisma.publicacion.create({
    data: {
      titulo: 'MacBook Air M1',
      descripcion: 'MacBook Air 2020, procesador M1, 8GB RAM, 256GB SSD. Muy poco uso, como nuevo.',
      tipo: 'PRODUCTO',
      estado: 'APROBADA',
      precio: 3800000,
      tipoPrecio: 'FIJO',
      categoriaId: tecnologia.id,
      autorId: estudiante.id,
      facultad: 'Ingeniería de Sistemas',
      medios: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
            tipo: 'IMAGEN',
            orden: 0,
            altText: 'MacBook Air M1',
          },
        ],
      },
      etiquetas: {
        create: [
          { etiquetaId: etiquetas[1].id },
          { etiquetaId: etiquetas[2].id },
        ],
      },
    },
  });

  const producto3 = await prisma.publicacion.create({
    data: {
      titulo: 'Libros de Ingeniería',
      descripcion: 'Colección completa de libros de ingeniería de sistemas. Cálculo, programación, estructuras de datos y más.',
      tipo: 'PRODUCTO',
      estado: 'APROBADA',
      precio: 450000,
      tipoPrecio: 'FIJO',
      categoriaId: libros.id,
      autorId: estudiante.id,
      facultad: 'Ingeniería de Sistemas',
      medios: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
            tipo: 'IMAGEN',
            orden: 0,
            altText: 'Libros de ingeniería',
          },
        ],
      },
      etiquetas: {
        create: [
          { etiquetaId: etiquetas[1].id },
          { etiquetaId: etiquetas[3].id },
        ],
      },
    },
  });

  console.log('📦 3 Productos creados (por estudiante)');

  // Crear 3 SERVICIOS (1 estudiante, 2 aliado)
  const servicio1 = await prisma.publicacion.create({
    data: {
      titulo: 'Tutorías de Cálculo Diferencial',
      descripcion: 'Estudiante de 8vo semestre ofrece tutorías personalizadas de cálculo. Método didáctico y garantizado.',
      tipo: 'SERVICIO',
      estado: 'APROBADA',
      precio: 25000,
      tipoPrecio: 'POR_HORA',
      categoriaId: tutorias.id,
      autorId: estudiante.id,
      facultad: 'Ingeniería de Sistemas',
      medios: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800',
            tipo: 'IMAGEN',
            orden: 0,
            altText: 'Tutoría de cálculo',
          },
        ],
      },
      etiquetas: {
        create: [{ etiquetaId: etiquetas[0].id }],
      },
    },
  });

  const servicio2 = await prisma.publicacion.create({
    data: {
      titulo: 'Diseño Gráfico Profesional',
      descripcion: 'Servicios de diseño gráfico: logos, banners, redes sociales y material publicitario. Entrega rápida.',
      tipo: 'SERVICIO',
      estado: 'APROBADA',
      precio: 150000,
      tipoPrecio: 'FIJO',
      categoriaId: servicios.id,
      autorId: aliado.id,
      facultad: 'Administración de Empresas',
      medios: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
            tipo: 'IMAGEN',
            orden: 0,
            altText: 'Diseño gráfico',
          },
        ],
      },
      etiquetas: {
        create: [
          { etiquetaId: etiquetas[0].id },
          { etiquetaId: etiquetas[2].id },
        ],
      },
    },
  });

  const servicio3 = await prisma.publicacion.create({
    data: {
      titulo: 'Consultoría de Marketing',
      descripcion: 'Servicios de consultoría en marketing digital y estrategias de crecimiento para negocios.',
      tipo: 'SERVICIO',
      estado: 'APROBADA',
      precio: 200000,
      tipoPrecio: 'FIJO',
      categoriaId: servicios.id,
      autorId: aliado.id,
      facultad: 'Administración de Empresas',
      medios: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
            tipo: 'IMAGEN',
            orden: 0,
            altText: 'Marketing',
          },
        ],
      },
      etiquetas: {
        create: [
          { etiquetaId: etiquetas[2].id },
          { etiquetaId: etiquetas[3].id },
        ],
      },
    },
  });

  console.log('🔧 3 Servicios creados (1 estudiante, 2 aliado)');

  // Crear 3 EVENTOS (todos del admin)
  const evento1 = await prisma.publicacion.create({
    data: {
      titulo: 'Hackathon UCP 2024',
      descripcion: 'Maratón de programación de 48 horas. Forma equipos, desarrolla soluciones innovadoras y gana premios.',
      tipo: 'EVENTO',
      estado: 'APROBADA',
      categoriaId: eventos.id,
      autorId: admin.id,
      facultad: 'Ingeniería de Sistemas',
      fechaEvento: new Date('2024-05-15T09:00:00'),
      ubicacionEvento: 'Bloque A, Auditorio Principal',
      cupos: 100,
      cuposOcupados: 45,
      medios: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
            tipo: 'IMAGEN',
            orden: 0,
            altText: 'Hackathon',
          },
        ],
      },
      etiquetas: {
        create: [
          { etiquetaId: etiquetas[0].id },
          { etiquetaId: etiquetas[4].id },
        ],
      },
    },
  });

  const evento2 = await prisma.publicacion.create({
    data: {
      titulo: 'Feria de Emprendimiento',
      descripcion: 'Presentación de proyectos de emprendimiento de estudiantes de la universidad. Conoce ideas innovadoras.',
      tipo: 'EVENTO',
      estado: 'APROBADA',
      categoriaId: eventos.id,
      autorId: admin.id,
      facultad: 'Administración de Empresas',
      fechaEvento: new Date('2024-05-20T14:00:00'),
      ubicacionEvento: 'Plaza Central',
      cupos: 200,
      cuposOcupados: 120,
      medios: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800',
            tipo: 'IMAGEN',
            orden: 0,
            altText: 'Feria de emprendimiento',
          },
        ],
      },
      etiquetas: {
        create: [{ etiquetaId: etiquetas[0].id }],
      },
    },
  });

  const evento3 = await prisma.publicacion.create({
    data: {
      titulo: 'Conferencia de Inteligencia Artificial',
      descripcion: 'Ponencia sobre las últimas tendencias en IA y machine learning. Invitados especiales del sector.',
      tipo: 'EVENTO',
      estado: 'APROBADA',
      categoriaId: eventos.id,
      autorId: admin.id,
      facultad: 'Ingeniería de Sistemas',
      fechaEvento: new Date('2024-06-10T16:00:00'),
      ubicacionEvento: 'Auditorio Bloque B',
      cupos: 150,
      cuposOcupados: 80,
      medios: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
            tipo: 'IMAGEN',
            orden: 0,
            altText: 'Conferencia IA',
          },
        ],
      },
      etiquetas: {
        create: [
          { etiquetaId: etiquetas[2].id },
          { etiquetaId: etiquetas[0].id },
        ],
      },
    },
  });

  console.log('📅 3 Eventos creados (por admin)');

  // Crear 3 CONVOCATORIAS (todas del aliado)
  const convocatoria1 = await prisma.publicacion.create({
    data: {
      titulo: 'Beca de Excelencia Académica',
      descripcion: 'Convocatoria para becas de excelencia académica para estudiantes con promedio superior a 4.5. Incluye apoyo económico.',
      tipo: 'CONVOCATORIA',
      estado: 'APROBADA',
      categoriaId: oportunidades.id,
      autorId: aliado.id,
      facultad: 'Todas las facultades',
      fechaLimite: new Date('2024-05-30T23:59:59'),
      medios: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800',
            tipo: 'IMAGEN',
            orden: 0,
            altText: 'Beca de excelencia',
          },
        ],
      },
      etiquetas: {
        create: [
          { etiquetaId: etiquetas[4].id },
          { etiquetaId: etiquetas[2].id },
        ],
      },
    },
  });

  const convocatoria2 = await prisma.publicacion.create({
    data: {
      titulo: 'Prácticas Profesionales',
      descripcion: 'Convocatoria para prácticas profesionales en empresas aliadas. Oportunidades en diversas áreas.',
      tipo: 'CONVOCATORIA',
      estado: 'APROBADA',
      categoriaId: oportunidades.id,
      autorId: aliado.id,
      facultad: 'Todas las facultades',
      fechaLimite: new Date('2024-06-15T23:59:59'),
      medios: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
            tipo: 'IMAGEN',
            orden: 0,
            altText: 'Prácticas profesionales',
          },
        ],
      },
      etiquetas: {
        create: [
          { etiquetaId: etiquetas[0].id },
          { etiquetaId: etiquetas[3].id },
        ],
      },
    },
  });

  const convocatoria3 = await prisma.publicacion.create({
    data: {
      titulo: 'Programa de Voluntariado',
      descripcion: 'Únete al programa de voluntariado de la universidad. Proyectos sociales y comunitarios.',
      tipo: 'CONVOCATORIA',
      estado: 'APROBADA',
      categoriaId: oportunidades.id,
      autorId: aliado.id,
      facultad: 'Todas las facultades',
      fechaLimite: new Date('2024-07-01T23:59:59'),
      medios: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
            tipo: 'IMAGEN',
            orden: 0,
            altText: 'Voluntariado',
          },
        ],
      },
      etiquetas: {
        create: [{ etiquetaId: etiquetas[0].id }],
      },
    },
  });

  console.log('📢 3 Convocatorias creadas (por aliado)');

  console.log('✅ Seed completado exitosamente!');
  console.log('📊 Resumen:');
  console.log('   - 1 Administrador (crea 3 eventos)');
  console.log('   - 1 Estudiante (crea 3 productos, 1 servicio)');
  console.log('   - 1 Aliado (crea 2 servicios, 3 convocatorias)');
  console.log('   - Total: 3 productos, 3 servicios, 3 eventos, 3 convocatorias');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
