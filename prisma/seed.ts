import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos UCP Marketplace...');

  // ── 1. LIMPIAR EN ORDEN (respeta foreign keys) ───────────────────────────
  await prisma.notificacion.deleteMany();
  await prisma.historialPublicacion.deleteMany();
  await prisma.reporte.deleteMany();
  await prisma.mensaje.deleteMany();
  await prisma.conversacion.deleteMany();
  await prisma.carritoItem.deleteMany();
  await prisma.favorito.deleteMany();
  await prisma.etiquetaEnPublicacion.deleteMany();
  await prisma.medio.deleteMany();
  await prisma.publicacion.deleteMany();
  await prisma.etiqueta.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('🧹 Base de datos limpia');

  // ── 2. CATEGORÍAS ────────────────────────────────────────────────────────
  const [tecnologia, tutorias, eventos, oportunidades, libros, servicios] =
    await Promise.all([
      prisma.categoria.create({
        data: {
          nombre: 'Tecnología',
          slug: 'tecnologia',
          color: '#3B82F6',
          icono: 'laptop',
          descripcion: 'Dispositivos, software y servicios tecnológicos',
        },
      }),
      prisma.categoria.create({
        data: {
          nombre: 'Tutorías',
          slug: 'tutorias',
          color: '#10B981',
          icono: 'book',
          descripcion: 'Clases personalizadas y refuerzo académico',
        },
      }),
      prisma.categoria.create({
        data: {
          nombre: 'Eventos',
          slug: 'eventos',
          color: '#8B5CF6',
          icono: 'calendar',
          descripcion: 'Eventos académicos, culturales y deportivos',
        },
      }),
      prisma.categoria.create({
        data: {
          nombre: 'Oportunidades',
          slug: 'oportunidades',
          color: '#F59E0B',
          icono: 'briefcase',
          descripcion: 'Convocatorias, becas y prácticas profesionales',
        },
      }),
      prisma.categoria.create({
        data: {
          nombre: 'Libros',
          slug: 'libros',
          color: '#EC4899',
          icono: 'book-open',
          descripcion: 'Libros, apuntes y material educativo',
        },
      }),
      prisma.categoria.create({
        data: {
          nombre: 'Servicios',
          slug: 'servicios',
          color: '#EF4444',
          icono: 'tool',
          descripcion: 'Servicios creativos, profesionales y varios',
        },
      }),
    ]);

  console.log('📁 6 Categorías creadas');

  // ── 3. ETIQUETAS ─────────────────────────────────────────────────────────
  const [
    etNuevo, etUsado, etPremium, etOferta, etUrgente,
    etOnline, etPresencial, etNegociable, etDisponible, etDescuento,
  ] = await Promise.all([
    prisma.etiqueta.create({ data: { nombre: 'nuevo',       usoCount: 0 } }),
    prisma.etiqueta.create({ data: { nombre: 'usado',       usoCount: 0 } }),
    prisma.etiqueta.create({ data: { nombre: 'premium',     usoCount: 0 } }),
    prisma.etiqueta.create({ data: { nombre: 'oferta',      usoCount: 0 } }),
    prisma.etiqueta.create({ data: { nombre: 'urgente',     usoCount: 0 } }),
    prisma.etiqueta.create({ data: { nombre: 'online',      usoCount: 0 } }),
    prisma.etiqueta.create({ data: { nombre: 'presencial',  usoCount: 0 } }),
    prisma.etiqueta.create({ data: { nombre: 'negociable',  usoCount: 0 } }),
    prisma.etiqueta.create({ data: { nombre: 'disponible',  usoCount: 0 } }),
    prisma.etiqueta.create({ data: { nombre: 'descuento',   usoCount: 0 } }),
  ]);

  console.log('🏷️  10 Etiquetas creadas');

  // ── 4. USUARIOS ──────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);

  // ── Admin
  const admin = await prisma.usuario.create({
    data: {
      nombre:     'Admin UCP',
      correo:     'admin@ucp.edu.co',
      contrasena: passwordHash,
      rol:        'ADMIN',
      verificado: true,
      telefono:   '573001112233',
      avatarUrl:  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    },
  });

  // ── Estudiantes
  const sebastian = await prisma.usuario.create({
    data: {
      nombre:     'Sebastian Patino',
      correo:     'sebastian.patino@ucp.edu.co',
      contrasena: passwordHash,
      rol:        'ESTUDIANTE',
      facultad:   'Ingeniería de Sistemas',
      semestre:   6,
      telefono:   '573115557788',
      verificado: true,
      avatarUrl:  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    },
  });

  const daniel = await prisma.usuario.create({
    data: {
      nombre:     'Daniel Colorado',
      correo:     'daniel.colorado@ucp.edu.co',
      contrasena: passwordHash,
      rol:        'ESTUDIANTE',
      facultad:   'Medicina',
      semestre:   4,
      telefono:   '573124448899',
      verificado: true,
      avatarUrl:  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    },
  });

  const alejandro = await prisma.usuario.create({
    data: {
      nombre:     'Alejandro Piedrahita',
      correo:     'alejandro.piedrahita@ucp.edu.co',
      contrasena: passwordHash,
      rol:        'ESTUDIANTE',
      facultad:   'Derecho',
      semestre:   7,
      telefono:   '573136669900',
      verificado: true,
      avatarUrl:  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80',
    },
  });

  // ── Aliados
  const luis = await prisma.usuario.create({
    data: {
      nombre:     'Luis Rendon',
      correo:     'luis.rendon@techucp.co',
      contrasena: passwordHash,
      rol:        'ALIADO',
      telefono:   '573148881234',
      verificado: true,
      avatarUrl:  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80',
    },
  });

  const xiomara = await prisma.usuario.create({
    data: {
      nombre:     'Xiomara Renteria',
      correo:     'xiomara.renteria@marketingucp.co',
      contrasena: passwordHash,
      rol:        'ALIADO',
      telefono:   '573159995678',
      verificado: true,
      avatarUrl:  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80',
    },
  });

  console.log('👤 6 Usuarios creados (1 admin, 3 estudiantes, 2 aliados)');

  // ── 5. PUBLICACIONES ──────────────────────────────────────────────────────
  // Fechas relativas (futuro)
  const d = (daysFromNow: number) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + daysFromNow);
    return dt;
  };

  // ── Sebastian Patino ── Tecnología + Tutorías
  const pubSeb1 = await prisma.publicacion.create({
    data: {
      titulo:      'Tablet Samsung Galaxy Tab A8',
      descripcion: 'Tablet en excelente estado, 64GB de almacenamiento, pantalla de 10.5", batería al 92%. Ideal para tomar notas y leer PDFs en clase. Incluye funda protectora y stylus.',
      tipo:        'PRODUCTO',
      estado:      'APROBADA',
      precio:      680000,
      tipoPrecio:  'FIJO',
      categoriaId: tecnologia.id,
      autorId:     sebastian.id,
      facultad:    'Ingeniería de Sistemas',
      vistas:      47,
      medios: {
        create: [
          { url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80', tipo: 'IMAGEN', orden: 0, altText: 'Samsung Galaxy Tab A8' },
        ],
      },
      etiquetas: { create: [{ etiquetaId: etUsado.id }, { etiquetaId: etNegociable.id }] },
    },
  });

  const pubSeb2 = await prisma.publicacion.create({
    data: {
      titulo:      'Tutorías de Python y Estructuras de Datos',
      descripcion: 'Estudiante de Ing. de Sistemas semestre 6 ofrece tutorías personalizadas. Temas: Python desde cero, POO, estructuras de datos (listas, pilas, colas, árboles), algoritmos de ordenamiento. Metodología práctica con proyectos reales.',
      tipo:        'SERVICIO',
      estado:      'APROBADA',
      precio:      30000,
      tipoPrecio:  'POR_HORA',
      categoriaId: tutorias.id,
      autorId:     sebastian.id,
      facultad:    'Ingeniería de Sistemas',
      vistas:      83,
      medios: {
        create: [
          { url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80', tipo: 'IMAGEN', orden: 0, altText: 'Programación Python' },
        ],
      },
      etiquetas: { create: [{ etiquetaId: etOnline.id }, { etiquetaId: etPresencial.id }, { etiquetaId: etDisponible.id }] },
    },
  });

  // ── Daniel Colorado ── Libros + Tutorías
  const pubDan1 = await prisma.publicacion.create({
    data: {
      titulo:      'Set Completo Libros de Anatomía Humana',
      descripcion: 'Vendo set de 3 libros: Gray Anatomía para Estudiantes 4ta edición, Netter Atlas de Anatomía Humana, y Snell Neuroanatomía Clínica. Todos en muy buen estado, con marcadores y notas útiles en los márgenes.',
      tipo:        'PRODUCTO',
      estado:      'APROBADA',
      precio:      320000,
      tipoPrecio:  'FIJO',
      categoriaId: libros.id,
      autorId:     daniel.id,
      facultad:    'Medicina',
      vistas:      61,
      medios: {
        create: [
          { url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80', tipo: 'IMAGEN', orden: 0, altText: 'Libros de anatomía médica' },
        ],
      },
      etiquetas: { create: [{ etiquetaId: etUsado.id }, { etiquetaId: etOferta.id }] },
    },
  });

  const pubDan2 = await prisma.publicacion.create({
    data: {
      titulo:      'Tutorías de Biología Celular y Genética',
      descripcion: 'Ofrezco refuerzo académico en Biología Celular, Genética Molecular y Bioquímica Básica. Ideal para estudiantes de primeros semestres de Medicina, Enfermería y Bacteriología. Modalidad virtual o presencial en el campus.',
      tipo:        'SERVICIO',
      estado:      'PENDIENTE',
      precio:      25000,
      tipoPrecio:  'POR_HORA',
      categoriaId: tutorias.id,
      autorId:     daniel.id,
      facultad:    'Medicina',
      vistas:      12,
      medios: {
        create: [
          { url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80', tipo: 'IMAGEN', orden: 0, altText: 'Biología celular' },
        ],
      },
      etiquetas: { create: [{ etiquetaId: etOnline.id }, { etiquetaId: etPresencial.id }] },
    },
  });

  // ── Alejandro Piedrahita ── Libros + Servicios
  const pubAle1 = await prisma.publicacion.create({
    data: {
      titulo:      'Códigos Jurídicos Colombia 2024 – 3 Tomos',
      descripcion: 'Vendo colección de códigos actualizados: Código Civil Colombiano, Código de Comercio y Código General del Proceso. Edición 2024, subrayados con colores por temas. Perfectos para preparar exámenes y litigios.',
      tipo:        'PRODUCTO',
      estado:      'APROBADA',
      precio:      195000,
      tipoPrecio:  'FIJO',
      categoriaId: libros.id,
      autorId:     alejandro.id,
      facultad:    'Derecho',
      vistas:      34,
      medios: {
        create: [
          { url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80', tipo: 'IMAGEN', orden: 0, altText: 'Códigos jurídicos' },
        ],
      },
      etiquetas: { create: [{ etiquetaId: etUsado.id }, { etiquetaId: etDescuento.id }] },
    },
  });

  const pubAle2 = await prisma.publicacion.create({
    data: {
      titulo:      'Asesoría Jurídica para Estudiantes',
      descripcion: 'Estudiante de Derecho semestre 7 ofrece asesorías en: contratos civiles y comerciales, derecho laboral básico, análisis de documentos legales y orientación en procesos judiciales. Atención personalizada y discreta.',
      tipo:        'SERVICIO',
      estado:      'APROBADA',
      precio:      45000,
      tipoPrecio:  'POR_HORA',
      categoriaId: servicios.id,
      autorId:     alejandro.id,
      facultad:    'Derecho',
      vistas:      55,
      medios: {
        create: [
          { url: 'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=800&q=80', tipo: 'IMAGEN', orden: 0, altText: 'Asesoría jurídica' },
        ],
      },
      etiquetas: { create: [{ etiquetaId: etPresencial.id }, { etiquetaId: etDisponible.id }] },
    },
  });

  // ── Luis Rendon (Aliado) ── Tecnología + Oportunidades
  const pubLuis1 = await prisma.publicacion.create({
    data: {
      titulo:      'Desarrollo de Aplicaciones Móviles a Medida',
      descripcion: 'TechUCP ofrece desarrollo profesional de apps móviles para Android e iOS usando React Native y Flutter. Precio por proyecto según complejidad. Incluye diseño UI/UX, backend, publicación en tiendas y soporte post-lanzamiento por 3 meses.',
      tipo:        'SERVICIO',
      estado:      'APROBADA',
      precio:      1800000,
      tipoPrecio:  'NEGOCIABLE',
      categoriaId: tecnologia.id,
      autorId:     luis.id,
      vistas:      128,
      medios: {
        create: [
          { url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80', tipo: 'IMAGEN', orden: 0, altText: 'Desarrollo apps móviles' },
          { url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80', tipo: 'IMAGEN', orden: 1, altText: 'App development process' },
        ],
      },
      etiquetas: { create: [{ etiquetaId: etPremium.id }, { etiquetaId: etNegociable.id }, { etiquetaId: etDisponible.id }] },
    },
  });

  const pubLuis2 = await prisma.publicacion.create({
    data: {
      titulo:      'Pasantías Remuneradas – TechUCP Soluciones',
      descripcion: 'TechUCP abre convocatoria para pasantes universitarios en las áreas de: Desarrollo Web (React/Next.js), Desarrollo Móvil (React Native), QA Testing y Diseño UX. Pasantía remunerada de 6 meses, modalidad híbrida. Se valorará experiencia con proyectos propios.',
      tipo:        'CONVOCATORIA',
      estado:      'APROBADA',
      categoriaId: oportunidades.id,
      autorId:     luis.id,
      vistas:      214,
      fechaLimite: d(45),
      medios: {
        create: [
          { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80', tipo: 'IMAGEN', orden: 0, altText: 'Pasantías tecnología' },
        ],
      },
      etiquetas: { create: [{ etiquetaId: etUrgente.id }, { etiquetaId: etNuevo.id }] },
    },
  });

  // ── Xiomara Renteria (Aliado) ── Servicios + Eventos + Oportunidades
  const pubXio1 = await prisma.publicacion.create({
    data: {
      titulo:      'Diseño de Branding y Logotipos Profesionales',
      descripcion: 'Agencia Marketing UCP ofrece diseño de identidad corporativa completa: logo, paleta de colores, tipografía, manual de marca y piezas gráficas para redes sociales. Precios especiales para estudiantes y emprendedores universitarios. Entrega en 5 días hábiles.',
      tipo:        'SERVICIO',
      estado:      'APROBADA',
      precio:      280000,
      tipoPrecio:  'FIJO',
      categoriaId: servicios.id,
      autorId:     xiomara.id,
      vistas:      97,
      medios: {
        create: [
          { url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80', tipo: 'IMAGEN', orden: 0, altText: 'Branding y diseño' },
          { url: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80', tipo: 'IMAGEN', orden: 1, altText: 'Identidad corporativa' },
        ],
      },
      etiquetas: { create: [{ etiquetaId: etPremium.id }, { etiquetaId: etDisponible.id }] },
    },
  });

  const pubXio2 = await prisma.publicacion.create({
    data: {
      titulo:      'Taller: Marketing Digital para Universitarios',
      descripcion: 'Aprende a crear y gestionar campañas en Meta Ads, Google Ads y TikTok. Conoce estrategias de contenido, SEO básico e influencer marketing. Taller práctico de 8 horas con casos reales. Certificado de participación. Cupos limitados.',
      tipo:        'EVENTO',
      estado:      'APROBADA',
      precio:      45000,
      tipoPrecio:  'FIJO',
      categoriaId: eventos.id,
      autorId:     xiomara.id,
      vistas:      183,
      fechaEvento:     d(18),
      ubicacionEvento: 'Sala de Cómputo B2, Bloque Central',
      cupos:           30,
      cuposOcupados:   22,
      medios: {
        create: [
          { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', tipo: 'IMAGEN', orden: 0, altText: 'Taller marketing digital' },
        ],
      },
      etiquetas: { create: [{ etiquetaId: etPresencial.id }, { etiquetaId: etUrgente.id }, { etiquetaId: etDescuento.id }] },
    },
  });

  const pubXio3 = await prisma.publicacion.create({
    data: {
      titulo:      'Prácticas Profesionales – Agencia Marketing UCP',
      descripcion: 'Buscamos practicantes en Comunicación Social, Diseño Gráfico y Administración para unirse a nuestro equipo. Aprenderás gestión de redes sociales, creación de contenido, campañas pagadas y analítica digital. Práctica con posibilidad de vinculación laboral.',
      tipo:        'CONVOCATORIA',
      estado:      'APROBADA',
      categoriaId: oportunidades.id,
      autorId:     xiomara.id,
      vistas:      156,
      fechaLimite: d(30),
      medios: {
        create: [
          { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', tipo: 'IMAGEN', orden: 0, altText: 'Prácticas agencia marketing' },
        ],
      },
      etiquetas: { create: [{ etiquetaId: etNuevo.id }, { etiquetaId: etDisponible.id }] },
    },
  });

  // ── Admin ── Eventos institucionales
  const pubAdmin1 = await prisma.publicacion.create({
    data: {
      titulo:      'Hackathon UCP 2025 – 48 Horas de Innovación',
      descripcion: 'Maratón de programación y diseño de 48 horas ininterrumpidas. Forma equipos de 3 a 5 personas y desarrolla soluciones a retos reales de empresas aliadas. Premios en efectivo: $3.000.000 primer lugar, $1.500.000 segundo, $750.000 tercero. Alimentación incluida.',
      tipo:        'EVENTO',
      estado:      'APROBADA',
      categoriaId: eventos.id,
      autorId:     admin.id,
      vistas:      302,
      fechaEvento:     d(25),
      ubicacionEvento: 'Bloque A – Auditorio Principal UCP',
      cupos:           120,
      cuposOcupados:   78,
      medios: {
        create: [
          { url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80', tipo: 'IMAGEN', orden: 0, altText: 'Hackathon UCP' },
          { url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80', tipo: 'IMAGEN', orden: 1, altText: 'Trabajo en equipo hackathon' },
        ],
      },
      etiquetas: { create: [{ etiquetaId: etNuevo.id }, { etiquetaId: etUrgente.id }, { etiquetaId: etPresencial.id }] },
    },
  });

  const pubAdmin2 = await prisma.publicacion.create({
    data: {
      titulo:      'Beca Excelencia Académica UCP 2025-II',
      descripcion: 'La Universidad Católica de Pereira convoca a estudiantes con promedio acumulado igual o superior a 4.3. La beca cubre el 50% del valor de la matrícula para el semestre 2025-II. Aplican todos los programas. Postúlate con tu certificado de notas y carta de motivación.',
      tipo:        'CONVOCATORIA',
      estado:      'APROBADA',
      categoriaId: oportunidades.id,
      autorId:     admin.id,
      vistas:      445,
      fechaLimite: d(20),
      medios: {
        create: [
          { url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80', tipo: 'IMAGEN', orden: 0, altText: 'Beca universitaria' },
        ],
      },
      etiquetas: { create: [{ etiquetaId: etUrgente.id }, { etiquetaId: etPremium.id }] },
    },
  });

  console.log('📦 13 Publicaciones creadas (variedad de tipos y categorías)');

  // ── 6. FAVORITOS (algunos estudiantes marcan favoritos) ───────────────────
  await Promise.all([
    // Sebastian marca favorito el taller de marketing y la pasantía de Luis
    prisma.favorito.create({ data: { usuarioId: sebastian.id, publicacionId: pubXio2.id } }),
    prisma.favorito.create({ data: { usuarioId: sebastian.id, publicacionId: pubLuis2.id } }),
    // Daniel marca el hackathon y la asesoría jurídica
    prisma.favorito.create({ data: { usuarioId: daniel.id, publicacionId: pubAdmin1.id } }),
    prisma.favorito.create({ data: { usuarioId: daniel.id, publicacionId: pubAle2.id } }),
    // Alejandro marca la pasantía de TechUCP
    prisma.favorito.create({ data: { usuarioId: alejandro.id, publicacionId: pubLuis2.id } }),
  ]);

  console.log('❤️  5 Favoritos creados');

  // ── 7. CONVERSACIONES Y MENSAJES ─────────────────────────────────────────
  const now = new Date();
  const mins = (m: number) => new Date(now.getTime() - m * 60_000);

  // Sebastian consulta a Luis sobre las pasantías
  const convSebLuis = await prisma.conversacion.create({
    data: {
      participanteAId: sebastian.id,
      participanteBId: luis.id,
      ultimoMensajeEn: mins(5),
    },
  });
  await prisma.mensaje.createMany({
    data: [
      { conversacionId: convSebLuis.id, emisorId: sebastian.id, contenido: 'Hola Luis, vi la convocatoria de pasantías y me interesa mucho la parte de desarrollo móvil. ¿Qué tecnologías piden específicamente?', leido: true, leidoEn: mins(58), creadoEn: mins(65) },
      { conversacionId: convSebLuis.id, emisorId: luis.id,     contenido: 'Hola Sebastian! Principalmente React Native, pero también valoramos experiencia con Expo y conocimientos básicos de Firebase. ¿Tienes algún proyecto personal?', leido: true, leidoEn: mins(52), creadoEn: mins(60) },
      { conversacionId: convSebLuis.id, emisorId: sebastian.id, contenido: 'Sí, tengo una app de gestión de tareas que desarrollé como proyecto de la materia. La puedo mostrar en la entrevista.', leido: true, leidoEn: mins(45), creadoEn: mins(50) },
      { conversacionId: convSebLuis.id, emisorId: luis.id,     contenido: 'Perfecto, eso suma mucho. Envíame tu hoja de vida al correo que aparece en la publicación y agendamos una entrevista para la próxima semana.', leido: false, creadoEn: mins(5) },
    ],
  });

  // Daniel consulta a Alejandro sobre los libros de anatomía
  const convDanAle = await prisma.conversacion.create({
    data: {
      participanteAId: daniel.id,
      participanteBId: alejandro.id,
      ultimoMensajeEn: mins(30),
    },
  });
  await prisma.mensaje.createMany({
    data: [
      { conversacionId: convDanAle.id, emisorId: daniel.id,    contenido: 'Buenas Alejandro, vi que vendes los códigos jurídicos. ¿Están muy subrayados o se pueden leer bien?', leido: true, leidoEn: mins(35), creadoEn: mins(40) },
      { conversacionId: convDanAle.id, emisorId: alejandro.id, contenido: 'Hola Daniel! Los subrayados están por temas usando 3 colores distintos, creo que ayudan más de lo que molestan. Los puedes ver si quieres antes de comprar.', leido: true, leidoEn: mins(32), creadoEn: mins(38) },
      { conversacionId: convDanAle.id, emisorId: daniel.id,    contenido: '¡Qué bueno! Estoy en medicina pero llevo un electivo de derecho y me los piden. ¿Puedes bajar un poco el precio?', leido: false, creadoEn: mins(30) },
    ],
  });

  // Xiomara contacta a Sebastian sobre tutorías
  const convXioSeb = await prisma.conversacion.create({
    data: {
      participanteAId: xiomara.id,
      participanteBId: sebastian.id,
      ultimoMensajeEn: mins(120),
    },
  });
  await prisma.mensaje.createMany({
    data: [
      { conversacionId: convXioSeb.id, emisorId: xiomara.id,  contenido: 'Hola Sebastian! Necesito ayuda con Python para automatizar reportes de marketing. ¿Podrías hacer eso en tus tutorías?', leido: true, leidoEn: mins(145), creadoEn: mins(150) },
      { conversacionId: convXioSeb.id, emisorId: sebastian.id, contenido: '¡Claro! Python con pandas y openpyxl es perfecto para eso. Podemos hacer 4 sesiones de 2 horas y quedarías lista para automatizarlo tú sola.', leido: true, leidoEn: mins(130), creadoEn: mins(140) },
      { conversacionId: convXioSeb.id, emisorId: xiomara.id,  contenido: 'Excelente! ¿Cuándo tienes disponibilidad esta semana?', leido: true, leidoEn: mins(125), creadoEn: mins(128) },
      { conversacionId: convXioSeb.id, emisorId: sebastian.id, contenido: 'Martes y jueves después de las 3pm. ¿Te sirven esos días?', leido: false, creadoEn: mins(120) },
    ],
  });

  console.log('💬 3 Conversaciones con mensajes creadas');

  // ── 8. NOTIFICACIONES ────────────────────────────────────────────────────
  await prisma.notificacion.createMany({
    data: [
      // Sebastian recibe notificación de su tutoría aprobada
      {
        usuarioId:   sebastian.id,
        tipo:        'PUBLICACION_APROBADA',
        referenciaId: pubSeb2.id,
        mensaje:     'Tu publicación "Tutorías de Python y Estructuras de Datos" fue aprobada',
        leida:       false,
      },
      // Sebastian: nuevo mensaje de Xiomara
      {
        usuarioId:   sebastian.id,
        tipo:        'MENSAJE_NUEVO',
        referenciaId: convXioSeb.id,
        mensaje:     'Tienes un nuevo mensaje de Xiomara Renteria',
        leida:       false,
      },
      // Luis: nuevo mensaje de Sebastian
      {
        usuarioId:   luis.id,
        tipo:        'MENSAJE_NUEVO',
        referenciaId: convSebLuis.id,
        mensaje:     'Tienes un nuevo mensaje de Sebastian Patino',
        leida:       false,
      },
      // Daniel: su tutoría está pendiente de aprobación (no notificación de aprobada)
      {
        usuarioId:   daniel.id,
        tipo:        'PUBLICACION_APROBADA',
        referenciaId: pubDan1.id,
        mensaje:     'Tu publicación "Set Completo Libros de Anatomía Humana" fue aprobada',
        leida:       true,
      },
      // Alejandro: nuevo mensaje de Daniel
      {
        usuarioId:   alejandro.id,
        tipo:        'MENSAJE_NUEVO',
        referenciaId: convDanAle.id,
        mensaje:     'Tienes un nuevo mensaje de Daniel Colorado',
        leida:       false,
      },
      // Xiomara: publicación aprobada
      {
        usuarioId:   xiomara.id,
        tipo:        'PUBLICACION_APROBADA',
        referenciaId: pubXio1.id,
        mensaje:     'Tu publicación "Diseño de Branding y Logotipos Profesionales" fue aprobada',
        leida:       true,
      },
    ],
  });

  console.log('🔔 6 Notificaciones creadas');

  // ── 9. HISTORIAL DE MODERACIÓN ───────────────────────────────────────────
  await prisma.historialPublicacion.createMany({
    data: [
      { publicacionId: pubSeb1.id,    estadoAnterior: 'PENDIENTE', estadoNuevo: 'APROBADA', adminId: admin.id, nota: 'Producto en buen estado, precio adecuado.' },
      { publicacionId: pubSeb2.id,    estadoAnterior: 'PENDIENTE', estadoNuevo: 'APROBADA', adminId: admin.id, nota: 'Servicio legítimo, usuario verificado.' },
      { publicacionId: pubDan1.id,    estadoAnterior: 'PENDIENTE', estadoNuevo: 'APROBADA', adminId: admin.id, nota: 'Publicación aprobada.' },
      { publicacionId: pubAle1.id,    estadoAnterior: 'PENDIENTE', estadoNuevo: 'APROBADA', adminId: admin.id, nota: 'Libros jurídicos con fotos verificadas.' },
      { publicacionId: pubAle2.id,    estadoAnterior: 'PENDIENTE', estadoNuevo: 'APROBADA', adminId: admin.id, nota: 'Servicio académico válido.' },
      { publicacionId: pubLuis1.id,   estadoAnterior: 'PENDIENTE', estadoNuevo: 'APROBADA', adminId: admin.id, nota: 'Aliado verificado, servicio profesional.' },
      { publicacionId: pubLuis2.id,   estadoAnterior: 'PENDIENTE', estadoNuevo: 'APROBADA', adminId: admin.id, nota: 'Convocatoria institucional válida.' },
      { publicacionId: pubXio1.id,    estadoAnterior: 'PENDIENTE', estadoNuevo: 'APROBADA', adminId: admin.id, nota: 'Servicio de diseño profesional.' },
      { publicacionId: pubXio2.id,    estadoAnterior: 'PENDIENTE', estadoNuevo: 'APROBADA', adminId: admin.id, nota: 'Evento con cupos y precio razonables.' },
      { publicacionId: pubXio3.id,    estadoAnterior: 'PENDIENTE', estadoNuevo: 'APROBADA', adminId: admin.id, nota: 'Convocatoria de aliado aprobado.' },
      { publicacionId: pubAdmin1.id,  estadoAnterior: 'PENDIENTE', estadoNuevo: 'APROBADA', adminId: admin.id, esAutomatico: false, nota: 'Evento institucional.' },
      { publicacionId: pubAdmin2.id,  estadoAnterior: 'PENDIENTE', estadoNuevo: 'APROBADA', adminId: admin.id, esAutomatico: false, nota: 'Convocatoria oficial UCP.' },
    ],
  });

  console.log('📋 Historial de moderación creado');

  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed completado exitosamente!\n');
  console.log('══════════════════════════════════════════════════');
  console.log('👤 USUARIOS Y CONTRASEÑAS (todas: password123)');
  console.log('══════════════════════════════════════════════════');
  console.log('  🔴 ADMIN');
  console.log('     admin@ucp.edu.co');
  console.log('');
  console.log('  🎓 ESTUDIANTES');
  console.log('     sebastian.patino@ucp.edu.co      → Ing. Sistemas, sem. 6');
  console.log('     daniel.colorado@ucp.edu.co       → Medicina, sem. 4');
  console.log('     alejandro.piedrahita@ucp.edu.co  → Derecho, sem. 7');
  console.log('');
  console.log('  🤝 ALIADOS');
  console.log('     luis.rendon@techucp.co           → TechUCP Soluciones');
  console.log('     xiomara.renteria@marketingucp.co → Agencia Marketing UCP');
  console.log('══════════════════════════════════════════════════');
  console.log('📊 PUBLICACIONES (13 total)');
  console.log('  Sebastian : Tablet Samsung (Tecnología) + Tutorías Python (Tutorías)');
  console.log('  Daniel    : Libros Anatomía (Libros) + Tutorías Biología (Tutorías)*');
  console.log('  Alejandro : Códigos Jurídicos (Libros) + Asesoría Jurídica (Servicios)');
  console.log('  Luis      : Desarrollo Apps Móviles (Tecnología) + Pasantías (Oportunidades)');
  console.log('  Xiomara   : Branding (Servicios) + Taller Marketing (Eventos) + Prácticas (Oportunidades)');
  console.log('  Admin     : Hackathon UCP (Eventos) + Beca Excelencia (Oportunidades)');
  console.log('  * = PENDIENTE, resto APROBADA');
  console.log('══════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
