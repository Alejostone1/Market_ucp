export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: "product" | "service";
  subcategory: string;
  images: string[];
  seller: {
    id: string;
    name: string;
    faculty: string;
    rating: number;
    avatar: string;
    phone?: string;
  };
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  isFavorite?: boolean;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
}

export const mockProducts: Product[] = [
  {
    id: "1",
    title: "iPhone 13 Pro 128GB",
    description: "iPhone en excelente estado, batería al 95%, incluye cargador y caja original. Sin ningún detalle estético.",
    price: 2500000,
    category: "product",
    subcategory: "Tecnología",
    images: ["https://images.unsplash.com/photo-1632661674386-5498e2c6b36e?w=800"],
    seller: {
      id: "1",
      name: "Carlos Mendoza",
      faculty: "Ingeniería de Sistemas",
      rating: 4.8,
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200",
      phone: "573012345678",
    },
    status: "approved",
    createdAt: new Date("2026-04-10"),
    isFavorite: false,
  },
  {
    id: "2",
    title: "Tutorías de Cálculo Diferencial",
    description: "Estudiante de 8vo semestre ofrece tutorías personalizadas de cálculo. Método didáctico y garantizado.",
    price: 25000,
    category: "service",
    subcategory: "Tutorías",
    images: ["https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800"],
    seller: {
      id: "2",
      name: "María López",
      faculty: "Ingeniería Industrial",
      rating: 5.0,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      phone: "573023456789",
    },
    status: "approved",
    createdAt: new Date("2026-04-12"),
    isFavorite: true,
  },
  {
    id: "3",
    title: "MacBook Air M1",
    description: "MacBook Air 2020, procesador M1, 8GB RAM, 256GB SSD. Muy poco uso, como nuevo.",
    price: 3800000,
    category: "product",
    subcategory: "Tecnología",
    images: ["https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800"],
    seller: {
      id: "3",
      name: "Andrés Rojas",
      faculty: "Diseño Gráfico",
      rating: 4.5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      phone: "573034567890",
    },
    status: "approved",
    createdAt: new Date("2026-04-11"),
  },
  {
    id: "4",
    title: "Tortas y Postres Personalizados",
    description: "Elaboro tortas, cupcakes y postres para cualquier ocasión. Entrega en campus universitario.",
    price: 45000,
    category: "service",
    subcategory: "Comida",
    images: ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800"],
    seller: {
      id: "4",
      name: "Valentina Giraldo",
      faculty: "Administración de Empresas",
      rating: 4.9,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
      phone: "573045678901",
    },
    status: "approved",
    createdAt: new Date("2026-04-09"),
  },
  {
    id: "5",
    title: "Bicicleta de Montaña",
    description: "Bicicleta aro 29, frenos de disco hidráulicos, 21 velocidades. Excelente para campus y ciudad.",
    price: 850000,
    category: "product",
    subcategory: "Deportes",
    images: ["https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800"],
    seller: {
      id: "5",
      name: "Diego Parra",
      faculty: "Educación Física",
      rating: 4.7,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
      phone: "573056789012",
    },
    status: "approved",
    createdAt: new Date("2026-04-08"),
  },
  {
    id: "6",
    title: "Diseño de Logos e Identidad Visual",
    description: "Servicio profesional de diseño de marca, logos, tarjetas de presentación y redes sociales.",
    price: 120000,
    category: "service",
    subcategory: "Diseño",
    images: ["https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800"],
    seller: {
      id: "3",
      name: "Andrés Rojas",
      faculty: "Diseño Gráfico",
      rating: 4.5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      phone: "573034567890",
    },
    status: "approved",
    createdAt: new Date("2026-04-14"),
  },
  {
    id: "7",
    title: "Libros de Ingeniería",
    description: "Colección de libros de ingeniería: Álgebra Lineal, Física I y II, Mecánica de Fluidos.",
    price: 180000,
    category: "product",
    subcategory: "Libros",
    images: ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800"],
    seller: {
      id: "1",
      name: "Carlos Mendoza",
      faculty: "Ingeniería de Sistemas",
      rating: 4.8,
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200",
      phone: "573012345678",
    },
    status: "approved",
    createdAt: new Date("2026-04-13"),
  },
  {
    id: "8",
    title: "Clases de Guitarra",
    description: "Clases personalizadas de guitarra acústica y eléctrica. Todos los niveles.",
    price: 30000,
    category: "service",
    subcategory: "Música",
    images: ["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800"],
    seller: {
      id: "6",
      name: "Santiago Cruz",
      faculty: "Música",
      rating: 4.6,
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
      phone: "573067890123",
    },
    status: "approved",
    createdAt: new Date("2026-04-15"),
  },
  {
    id: "9",
    title: "Auriculares Sony WH-1000XM4",
    description: "Auriculares con cancelación de ruido, bluetooth, batería dura 30 horas. Como nuevos.",
    price: 650000,
    category: "product",
    subcategory: "Tecnología",
    images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800"],
    seller: {
      id: "7",
      name: "Camila Vargas",
      faculty: "Comunicación Social",
      rating: 4.9,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
      phone: "573078901234",
    },
    status: "pending",
    createdAt: new Date("2026-04-16"),
  },
  {
    id: "10",
    title: "Desarrollador Web Freelance",
    description: "Desarrollo sitios web, landing pages y aplicaciones web con React, Node.js y más.",
    price: 500000,
    category: "service",
    subcategory: "Programación",
    images: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"],
    seller: {
      id: "1",
      name: "Carlos Mendoza",
      faculty: "Ingeniería de Sistemas",
      rating: 4.8,
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200",
      phone: "573012345678",
    },
    status: "approved",
    createdAt: new Date("2026-04-14"),
  },
];

export const mockMessages: Message[] = [
  {
    id: "1",
    userId: "2",
    userName: "María López",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    lastMessage: "Claro, podemos coordinar para mañana a las 3pm",
    timestamp: new Date("2026-04-16T10:30:00"),
    unread: 2,
  },
  {
    id: "2",
    userId: "4",
    userName: "Valentina Giraldo",
    userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    lastMessage: "¿Qué sabor de torta te interesa?",
    timestamp: new Date("2026-04-15T18:20:00"),
    unread: 0,
  },
  {
    id: "3",
    userId: "5",
    userName: "Diego Parra",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    lastMessage: "La bicicleta está disponible, puedes verla hoy",
    timestamp: new Date("2026-04-15T14:10:00"),
    unread: 1,
  },
];

export const categories = [
  "Tecnología",
  "Libros",
  "Ropa",
  "Deportes",
  "Comida",
  "Tutorías",
  "Diseño",
  "Programación",
  "Música",
  "Fotografía",
  "Artesanías",
];

export const faculties = [
  "Ingeniería de Sistemas",
  "Ingeniería Industrial",
  "Administración de Empresas",
  "Diseño Gráfico",
  "Comunicación Social",
  "Derecho",
  "Psicología",
  "Medicina",
  "Arquitectura",
  "Música",
  "Educación Física",
];
