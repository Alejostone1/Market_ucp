<div align="center">

<!-- ══════════════════════════════════════════════════════════════════════ -->
<!--                         BANNER PRINCIPAL                              -->
<!-- ══════════════════════════════════════════════════════════════════════ -->

<img src="public/logo_ucp.png" alt="UCP Marketplace" width="80" />

# UCP Marketplace

**La plataforma de comercio digital para la comunidad de la Universidad Católica de Pereira**

*Compra · Vende · Conecta — todo dentro del campus*

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.20-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql)](https://neon.tech/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.IO-4.8-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0055?style=flat-square&logo=framer)](https://www.framer.com/motion/)

<br/>

[![Estado](https://img.shields.io/badge/Estado-Producción-22c55e?style=flat-square)](.)
[![Versión](https://img.shields.io/badge/Versión-0.0.1-881a1d?style=flat-square)](.)
[![Universidad](https://img.shields.io/badge/Universidad-UCP_Pereira-881a1d?style=flat-square)](https://www.ucp.edu.co/)
[![Curso](https://img.shields.io/badge/Curso-Ingeniería_de_Software_I-f4c222?style=flat-square)](.)
[![Año](https://img.shields.io/badge/Año-2026-gray?style=flat-square)](.)

<br/>

[🌐 Demo en vivo](#-despliegue) · [📖 Documentación](#-índice) · [🐛 Reportar Bug](../../issues) · [💡 Sugerir Feature](../../issues)

---

</div>

## 📋 Índice

- [Resumen ejecutivo](#-resumen-ejecutivo)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura del sistema](#-arquitectura-del-sistema)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Instalación y configuración](#-instalación-y-configuración)
- [Variables de entorno](#-variables-de-entorno)
- [Base de datos](#-base-de-datos)
- [Autenticación y roles](#-autenticación-y-roles)
- [Módulos del sistema](#-módulos-del-sistema)
- [API Reference](#-api-reference)
- [Chat en tiempo real](#-chat-en-tiempo-real)
- [Manual de usuario](#-manual-de-usuario)
- [Sistema de diseño y UX](#-sistema-de-diseño-y-ux)
- [Performance y optimizaciones](#-performance-y-optimizaciones)
- [Despliegue](#-despliegue)
- [Roadmap](#-roadmap)
- [Créditos y equipo](#-créditos-y-equipo)

---

## 🎯 Resumen ejecutivo

**UCP Marketplace** es una plataforma digital de comercio universitario construida como proyecto final de **Ingeniería de Software I** en la Universidad Católica de Pereira. Conecta a estudiantes, aliados y administradores en un ecosistema cerrado y verificado donde pueden publicar, descubrir y negociar productos, servicios, eventos y convocatorias dentro del campus.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│   "Una plataforma donde la comunidad UCP puede comprar,          │
│    vender y conectar — sin intermediarios, con confianza."        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### ✨ Capacidades principales

| Capacidad | Descripción |
|-----------|-------------|
| 🏪 **Marketplace completo** | Explora publicaciones con filtros avanzados por tipo, categoría, precio y ordenamiento |
| 📢 **4 tipos de publicación** | Productos, Servicios, Eventos y Convocatorias — cada uno con campos específicos |
| 💬 **Chat en tiempo real** | Sistema de mensajería bidireccional con Socket.IO, indicadores de escritura y estado online |
| ❤️ **Favoritos inteligentes** | Persistencia híbrida: localStorage para usuarios anónimos, DB para autenticados, sincronización automática |
| 🛒 **Carrito de compras** | Gestión de ítems con cantidades, precios unitarios y persistencia por usuario |
| 🛡️ **Moderación de contenido** | Flujo completo: publicación → revisión admin → aprobación/rechazo con nota y historial |
| 🚩 **Sistema de reportes** | Usuarios pueden reportar contenido inapropiado; admins gestionan los reportes |
| 📊 **Dashboard administrativo** | Estadísticas en tiempo real, gestión de usuarios, publicaciones y reportes |
| 🔔 **Notificaciones** | Sistema de notificaciones por eventos del sistema (aprobación, rechazo, mensajes) |
| 📁 **Subida de archivos** | Upload de imágenes para publicaciones con soporte a Cloudinary y Unsplash |

---

## 🔧 Stack tecnológico

### Frontend

| Tecnología | Versión | Rol |
|------------|---------|-----|
| ![Next.js](https://img.shields.io/badge/-Next.js-black?logo=next.js&style=flat-square) | 15 | Framework React con App Router, SSR/SSG y API Routes integradas |
| ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&style=flat-square&logoColor=black) | 18.3 | UI library con hooks modernos y concurrent features |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&style=flat-square&logoColor=white) | 5.4 | Tipado estático completo en todo el codebase |
| ![TailwindCSS](https://img.shields.io/badge/-TailwindCSS-06B6D4?logo=tailwindcss&style=flat-square&logoColor=white) | 3.4 | Utility-first CSS con design tokens personalizados UCP |
| ![Framer Motion](https://img.shields.io/badge/-Framer_Motion-FF0055?logo=framer&style=flat-square&logoColor=white) | 12 | Animaciones declarativas: hero, fade-up, floating cards, contadores |
| ![Radix UI](https://img.shields.io/badge/-Radix_UI-161618?logo=radix-ui&style=flat-square&logoColor=white) | Suite completa | Primitivos accesibles: Dialog, Sheet, Select, Accordion, etc. |
| ![Lucide](https://img.shields.io/badge/-Lucide_React-F56040?style=flat-square) | 0.487 | Librería de iconos SVG consistente |
| ![Recharts](https://img.shields.io/badge/-Recharts-22C55E?style=flat-square) | 2.15 | Gráficos para el dashboard administrativo |
| ![React Hook Form](https://img.shields.io/badge/-React_Hook_Form-EC5990?style=flat-square) | 7.55 | Formularios performativos con validación |
| ![Zod](https://img.shields.io/badge/-Zod-3E67B1?style=flat-square) | 4.3 | Validación de esquemas en runtime |
| ![Zustand](https://img.shields.io/badge/-Zustand-orange?style=flat-square) | 5.0 | Estado global ligero para cart y preferencias |
| ![Sonner](https://img.shields.io/badge/-Sonner-black?style=flat-square) | 2.0 | Sistema de notificaciones toast elegante |

### Backend & Infraestructura

| Tecnología | Versión | Rol |
|------------|---------|-----|
| ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&style=flat-square&logoColor=white) | 20+ | Runtime del servidor custom (`server.js`) |
| ![Prisma](https://img.shields.io/badge/-Prisma-2D3748?logo=prisma&style=flat-square&logoColor=white) | 5.20 | ORM type-safe con migraciones y seed automatizado |
| ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?logo=postgresql&style=flat-square&logoColor=white) | 16 | Base de datos relacional en la nube (Neon) |
| ![Neon](https://img.shields.io/badge/-Neon_Database-00E699?style=flat-square) | — | PostgreSQL serverless con pooler de conexiones |
| ![Socket.IO](https://img.shields.io/badge/-Socket.IO-010101?logo=socket.io&style=flat-square&logoColor=white) | 4.8 | WebSockets para chat en tiempo real y presencia |
| ![bcryptjs](https://img.shields.io/badge/-bcryptjs-orange?style=flat-square) | 3.0 | Hash seguro de contraseñas |

### DevTools

| Herramienta | Uso |
|-------------|-----|
| `tsx` | Ejecutar seed TypeScript directamente |
| `prisma generate` | Generación automática del cliente en postinstall |
| `next lint` | Linting del proyecto |

---

## 🏛️ Arquitectura del sistema

### Vista general

```mermaid
graph TB
    subgraph Cliente["🖥️ Cliente (Browser)"]
        UI[React 18 + App Router]
        FM[Framer Motion]
        CTX[Contexts: Auth · Cart · Favorites · Messages]
        SK[Socket.IO Client]
    end

    subgraph Servidor["⚙️ Servidor Custom Node.js (server.js)"]
        NX[Next.js Handler]
        SIO[Socket.IO Server]
        MAP[Map: onlineUsers]
    end

    subgraph API["🔌 API Routes (Next.js)"]
        AUTH[/api/auth/login · register · logout]
        PUBS[/api/publicaciones]
        FAV[/api/favoritos]
        CART[/api/carrito]
        CONV[/api/conversaciones]
        ADMIN[/api/admin/*]
        UPLOAD[/api/upload]
    end

    subgraph DB["🗄️ Neon PostgreSQL + Prisma"]
        PRISMA[Prisma Client]
        PG[(PostgreSQL)]
    end

    UI -->|HTTP Fetch| API
    UI -->|WebSocket| SIO
    SK <-->|WS Rooms & Events| SIO
    NX --> API
    API --> PRISMA
    PRISMA --> PG
    SIO --> MAP
    SIO -.->|global.io emit| API
```

### Patrón de servidor híbrido

UCP Marketplace usa un **servidor Node.js unificado** en lugar del servidor estándar de Next.js. Esto permite que Socket.IO y Next.js compartan el mismo proceso y puerto:

```
server.js
  ├── createServer(http)           → HTTP server compartido
  ├── next({ dev, hostname, port }) → Maneja todas las rutas HTTP de Next.js
  └── new Server(httpServer, ...)   → Socket.IO montado en el mismo servidor
       └── global.io = io          → API Routes emiten eventos via global.io
```

### Flujo de autenticación

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend (AuthContext)
    participant A as API /auth/login
    participant P as Prisma
    participant DB as PostgreSQL

    U->>F: Ingresa correo + contraseña
    F->>A: POST /api/auth/login
    A->>P: findUnique({ where: { correo } })
    P->>DB: SELECT usuario WHERE correo=...
    DB-->>P: Usuario encontrado
    P-->>A: Objeto Usuario + hash contraseña
    A->>A: bcrypt.compare(input, hash)
    A->>A: Verifica bloqueado=false, verificado=true
    A-->>F: 200 { usuario } + Set-Cookie: usuario=...
    F->>F: setUsuario() + localStorage.setItem()
    F->>F: document.cookie (para middleware)
    F-->>U: Redirige según rol (ADMIN/ESTUDIANTE)
```

### Flujo de publicación

```mermaid
flowchart LR
    A([Estudiante crea\npublicación]) --> B[POST /api/publicaciones\nestado: PENDIENTE]
    B --> C[(DB: Publicacion\nestado=PENDIENTE)]
    C --> D{Admin revisa\nen dashboard}
    D -- Aprueba --> E[estado=APROBADA]
    D -- Rechaza --> F[estado=RECHAZADA\n+ notaRechazo]
    E --> G([Visible en\nmarketplace])
    F --> H([Notificación\nal autor])
    E --> I[HistorialPublicacion\nregistrado]
    F --> I
```

### Flujo de favoritos con sincronización híbrida

```mermaid
stateDiagram-v2
    [*] --> Inicialización

    Inicialización --> CargarLocalStorage : Siempre (fast path)
    CargarLocalStorage --> UsuarioAnónimo : No autenticado
    CargarLocalStorage --> SincronizarDB : Autenticado

    SincronizarDB --> MergeIds : GET /api/favoritos
    MergeIds --> SubirPendientes : IDs locales no en DB
    SubirPendientes --> EstadoFinal

    UsuarioAnónimo --> ToggleFavorito
    EstadoFinal --> ToggleFavorito

    ToggleFavorito --> ActualizaciónOptimista : Inmediata (UI)
    ActualizaciónOptimista --> SincDB : Autenticado
    ActualizaciónOptimista --> SincLS : Anónimo
    SincDB --> Revertir : Si falla
```

---

## 📁 Estructura del proyecto

```
ucp-marketplace/
│
├── 📄 server.js                    # Servidor Node.js custom: Next.js + Socket.IO unificados
├── 📄 next.config.mjs              # Config Next.js: externales socket, imágenes, webpack
├── 📄 tailwind.config.ts           # Config Tailwind con tokens de color UCP
├── 📄 tsconfig.json                # TypeScript paths y configuración
├── 📄 vercel.json                  # Configuración de despliegue en Vercel
├── 📄 .env.example                 # Plantilla de variables de entorno
│
├── 📁 prisma/
│   ├── schema.prisma               # Esquema completo de la BD (12 modelos, 8 enums)
│   ├── seed.ts                     # Datos iniciales: categorías, usuarios admin, publicaciones demo
│   └── migrations/                 # Historial de migraciones SQL versionadas
│
├── 📁 public/
│   ├── logo_ucp.png               # Logotipo oficial UCP
│   ├── grid-pattern.svg           # Patrón decorativo de fondo
│   └── favicon.ico
│
├── 📁 socket-server/               # Servidor Socket.IO alternativo (standalone)
│   ├── index.js
│   └── package.json
│
└── 📁 src/
    ├── 📄 middleware.ts            # Protección de rutas admin por cookie + rol
    │
    ├── 📁 app/                     # Next.js App Router
    │   ├── layout.tsx              # Root layout: providers, fuentes, header, footer
    │   ├── page.tsx                # Landing page: hero, marquee, stats, publicaciones, CTA
    │   ├── globals.css             # Estilos globales + animaciones CSS (float, marquee)
    │   │
    │   ├── 📁 (auth)/              # Grupo de rutas — layout auth limpio
    │   │   ├── login/page.tsx      # Formulario login con AuthContext
    │   │   └── register/page.tsx   # Formulario registro
    │   │
    │   ├── 📁 (marketplace)/       # Grupo de rutas — layout con header público
    │   │   ├── explore/page.tsx    # Marketplace con filtros (tipo, categoría, precio, orden)
    │   │   ├── favorites/page.tsx  # Página de favoritos (anónimo + autenticado)
    │   │   └── publication/[id]/   # Detalle de publicación: galería, precio, vendedor, acciones
    │   │
    │   ├── 📁 dashboard/
    │   │   ├── student/            # Panel del estudiante
    │   │   │   ├── page.tsx        # Overview del estudiante
    │   │   │   ├── publications/   # CRUD de publicaciones propias
    │   │   │   ├── messages/       # Bandeja de mensajes + chat en tiempo real
    │   │   │   ├── profile/        # Editar perfil y avatar
    │   │   │   ├── favorites/      # Favoritos del usuario
    │   │   │   ├── cart/           # Carrito de compras
    │   │   │   └── settings/       # Configuración de cuenta
    │   │   └── partner/            # Panel aliado
    │   │
    │   ├── 📁 admin/               # Panel admin principal (protegido por middleware)
    │   │   ├── login/              # Login exclusivo para administradores
    │   │   └── dashboard/
    │   │       ├── page.tsx        # KPIs: publicaciones, usuarios, reportes
    │   │       ├── publicaciones/  # Aprobar / rechazar publicaciones pendientes
    │   │       ├── usuarios/       # Listar, bloquear y gestionar usuarios
    │   │       ├── reportes/       # Gestionar reportes de contenido
    │   │       ├── categorias/     # CRUD de categorías del marketplace
    │   │       └── notificaciones/ # Centro de notificaciones admin
    │   │
    │   ├── 📁 api/                 # Backend: Route Handlers (Next.js)
    │   │   ├── auth/               # login · register · logout · change-password
    │   │   ├── publicaciones/      # CRUD + favoritos + reportes por publicación
    │   │   ├── publicaciones/[id]/ # Detalle, editar, eliminar publicación
    │   │   ├── categorias/         # Listar y crear categorías
    │   │   ├── etiquetas/          # Gestión de tags normalizados
    │   │   ├── favoritos/          # Favoritos del usuario autenticado
    │   │   ├── carrito/            # Carrito: agregar, listar, eliminar ítem
    │   │   ├── conversaciones/     # Crear/listar conversaciones + mensajes
    │   │   ├── usuarios/[id]/      # Perfil, favoritos, publicaciones, mensajes
    │   │   ├── upload/             # Subida de archivos multimedia
    │   │   └── admin/              # Stats, publicaciones, reportes, usuarios (admin-only)
    │   │
    │   ├── about/page.tsx          # Página sobre el proyecto
    │   └── help/page.tsx           # Centro de ayuda
    │
    ├── 📁 components/
    │   ├── layout/
    │   │   ├── Header.tsx          # Navbar responsive: búsqueda, iconos, menú móvil, rol-aware
    │   │   └── Footer.tsx          # Footer institucional
    │   ├── marketplace/
    │   │   ├── PublicationCard.tsx # Tarjeta de publicación reutilizable
    │   │   └── ReportModal.tsx     # Modal de reporte con motivos y descripción
    │   ├── chat/
    │   │   ├── ContactButton.tsx   # Botón iniciar conversación (con auth gate)
    │   │   └── AuthGateModal.tsx   # Modal que pide login antes de chatear
    │   └── ui/                     # shadcn/ui: 30+ componentes Radix primitivos
    │
    ├── 📁 contexts/
    │   ├── AuthContext.tsx         # Estado global de autenticación (cookie + localStorage)
    │   ├── CartContext.tsx         # Estado global del carrito de compras
    │   ├── FavoritesContext.tsx    # Estado global de favoritos con sincronización híbrida
    │   └── MessageContext.tsx      # Contador de mensajes no leídos
    │
    ├── 📁 hooks/
    │   └── useSocket.ts            # Hook para conectar Socket.IO autenticado
    │
    ├── 📁 lib/
    │   ├── prisma.ts               # Singleton del cliente Prisma
    │   ├── socket-client.ts        # Singleton del cliente Socket.IO
    │   ├── socket-emit.ts          # Helpers para emitir eventos desde API routes
    │   └── utils.ts                # Utilidades: cn() para clases Tailwind
    │
    ├── 📁 types/
    │   ├── index.ts                # Tipos TypeScript del dominio
    │   └── global.d.ts             # Tipos globales (Socket.IO en global, etc.)
    │
    └── 📁 styles/
        ├── fonts.css               # Importación y configuración de fuentes
        ├── theme.css               # Variables CSS de la paleta UCP
        ├── tailwind.css            # Directivas Tailwind
        └── index.css               # Estilos adicionales
```

---

## 🚀 Instalación y configuración

### Prerrequisitos

```bash
Node.js  >= 20.x
npm      >= 10.x
Git      >= 2.x
```

> **Recomendado**: Cuenta en [Neon](https://neon.tech) para la base de datos PostgreSQL serverless.

### 1. Clonar el repositorio

```bash
git clone https://github.com/<tu-usuario>/market-ucp.git
cd market-ucp
```

### 2. Instalar dependencias

```bash
npm install
# Esto también ejecuta automáticamente `prisma generate` via postinstall
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales (ver sección [Variables de entorno](#-variables-de-entorno)).

### 4. Configurar la base de datos

```bash
# Aplicar el esquema a la base de datos
npx prisma db push

# (Opcional) Ejecutar migraciones formales
npx prisma migrate deploy

# Poblar con datos iniciales (categorías, admin demo, publicaciones)
npm run seed
```

### 5. Iniciar en desarrollo

```bash
npm run dev
# → Levanta el servidor custom Node.js en http://localhost:3000
# → Next.js + Socket.IO en el mismo proceso
```

> ⚠️ **Importante**: No uses `next dev` directamente. El comando `npm run dev` ejecuta `node server.js`, que inicializa Socket.IO junto con Next.js.

### 6. Build de producción

```bash
npm run build   # Compila Next.js para producción
npm start       # Inicia el servidor custom en modo producción
```

### Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (Next.js + Socket.IO) |
| `npm run dev:next` | Solo Next.js sin Socket.IO (limitado) |
| `npm run build` | Build de producción de Next.js |
| `npm start` | Servidor de producción (Next.js + Socket.IO) |
| `npm run seed` | Poblar base de datos con datos iniciales |
| `npm run db:push` | Sincronizar schema Prisma sin migraciones |
| `npm run db:reset` | Resetear BD y re-ejecutar migraciones |
| `npm run lint` | Análisis estático del código |

### Solución de problemas comunes

```bash
# Error: "Multiple lockfiles found"
# → Ya resuelto en next.config.mjs con outputFileTracingRoot

# Error: "Cannot find module 'socket.io'"
# → socket.io está en serverExternalPackages, no va al bundle cliente

# Error: "PrismaClientInitializationError"
# → Verifica que DATABASE_URL esté correcto en .env

# La aplicación no carga el chat
# → Asegúrate de que NEXT_PUBLIC_SOCKET_ENABLED=true y NEXT_PUBLIC_SOCKET_URL estén configurados
```

---

## 🔐 Variables de entorno

```env
# ─── Base de datos (Neon PostgreSQL) ────────────────────────────────────────
# URL con pooler — usada por la app en producción
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/DBNAME?sslmode=require"

# URL directa — usada por prisma db push y migraciones
DIRECT_DATABASE_URL="postgresql://USER:PASSWORD@HOST.REGION.aws.neon.tech/DBNAME?sslmode=require"

# ─── Autenticación ──────────────────────────────────────────────────────────
# URL pública de la aplicación (para callbacks y cookies)
NEXTAUTH_URL="https://tu-dominio.vercel.app"

# Secreto aleatorio y seguro (mín. 32 caracteres)
NEXTAUTH_SECRET="genera-un-secreto-seguro-aqui"

# ─── Socket.IO ──────────────────────────────────────────────────────────────
# Habilitar o deshabilitar la conexión WebSocket desde el cliente
NEXT_PUBLIC_SOCKET_ENABLED="true"

# URL del servidor Socket.IO (misma que la app en producción local)
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"

# ─── Email (opcional — para verificación de cuentas) ────────────────────────
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM=""

# ─── Aplicación ─────────────────────────────────────────────────────────────
NODE_ENV="development"
NEXT_PUBLIC_APP_NAME="UCP Marketplace"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Descripción de cada variable

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `DATABASE_URL` | ✅ | URL con pooler de Neon para las consultas de la app |
| `DIRECT_DATABASE_URL` | ✅ | URL directa de Neon para migraciones Prisma |
| `NEXTAUTH_URL` | ✅ | Dominio público de la app |
| `NEXTAUTH_SECRET` | ✅ | Clave secreta para firmar sesiones |
| `NEXT_PUBLIC_SOCKET_ENABLED` | ⚠️ | `"true"` activa el WebSocket; `"false"` deshabilita el chat |
| `NEXT_PUBLIC_SOCKET_URL` | ⚠️ | URL donde escucha el servidor Socket.IO |
| `SMTP_*` | ❌ | Necesario para verificación de email (feature futuro) |
| `NEXT_PUBLIC_APP_URL` | ⚠️ | URL base para CORS y redirects de Socket.IO |

> **Generar `NEXTAUTH_SECRET`**: `openssl rand -base64 32`

---

## 🗄️ Base de datos

### Proveedor

| | |
|-|-|
| **ORM** | Prisma 5.20 con `@prisma/adapter-neon` |
| **Base de datos** | PostgreSQL 16 en Neon (serverless) |
| **Pooler** | `@neondatabase/serverless` para conexiones sin latencia de cold start |
| **Migraciones** | `prisma migrate` con historial versionado en `/prisma/migrations/` |

### Diagrama Entidad-Relación

```mermaid
erDiagram
    Usuario {
        string id PK
        string nombre
        string correo UK
        string contrasena
        enum rol
        string facultad
        int semestre
        string avatarUrl
        string telefono
        bool verificado
        bool bloqueado
        datetime creadoEn
    }

    Publicacion {
        string id PK
        string titulo
        text descripcion
        enum tipo
        enum estado
        string categoriaId FK
        string autorId FK
        decimal precio
        enum tipoPrecio
        string facultad
        int vistas
        datetime fechaEvento
        string ubicacionEvento
        int cupos
        int cuposOcupados
        datetime fechaLimite
        text notaRechazo
        datetime creadoEn
    }

    Categoria {
        string id PK
        string nombre UK
        string slug UK
        string color
        string icono
        string descripcion
    }

    Etiqueta {
        string id PK
        string nombre UK
        int usoCount
    }

    EtiquetaEnPublicacion {
        string publicacionId FK
        string etiquetaId FK
    }

    Medio {
        string id PK
        string url
        enum tipo
        int orden
        string altText
        int tamanoBytes
        string publicacionId FK
    }

    Favorito {
        string id PK
        string usuarioId FK
        string publicacionId FK
        datetime creadoEn
    }

    CarritoItem {
        string id PK
        string usuarioId FK
        string publicacionId FK
        int cantidad
        decimal precioUnitario
    }

    Conversacion {
        string id PK
        string participanteAId FK
        string participanteBId FK
        datetime ultimoMensajeEn
    }

    Mensaje {
        string id PK
        text contenido
        string conversacionId FK
        string emisorId FK
        bool leido
        datetime leidoEn
        datetime creadoEn
    }

    Reporte {
        string id PK
        string reportanteId FK
        string publicacionId FK
        enum motivo
        text descripcion
        enum estado
    }

    HistorialPublicacion {
        string id PK
        string publicacionId FK
        enum estadoAnterior
        enum estadoNuevo
        text nota
        string adminId FK
        datetime creadoEn
    }

    Notificacion {
        string id PK
        string usuarioId FK
        enum tipo
        string referenciaId
        string mensaje
        bool leida
    }

    Usuario ||--o{ Publicacion : "autor"
    Usuario ||--o{ Favorito : "tiene"
    Usuario ||--o{ CarritoItem : "tiene"
    Usuario ||--o{ Reporte : "reporta"
    Usuario ||--o{ Notificacion : "recibe"
    Usuario ||--o{ HistorialPublicacion : "modera"
    Usuario ||--o{ Mensaje : "emite"
    Usuario ||--o{ Conversacion : "participanteA"
    Usuario ||--o{ Conversacion : "participanteB"

    Publicacion ||--o{ Favorito : "guardada en"
    Publicacion ||--o{ CarritoItem : "en carrito"
    Publicacion ||--o{ Reporte : "reportada"
    Publicacion ||--o{ HistorialPublicacion : "tiene historial"
    Publicacion ||--o{ Medio : "tiene medios"
    Publicacion ||--o{ EtiquetaEnPublicacion : "etiquetada"

    Categoria ||--o{ Publicacion : "agrupa"
    Etiqueta ||--o{ EtiquetaEnPublicacion : "usada en"
    Conversacion ||--o{ Mensaje : "contiene"
```

### Enumeraciones del sistema

```typescript
enum Rol              { ESTUDIANTE, ALIADO, ADMIN }
enum TipoPublicacion  { PRODUCTO, SERVICIO, EVENTO, CONVOCATORIA }
enum EstadoPublicacion { PENDIENTE, APROBADA, RECHAZADA, ARCHIVADA }
enum TipoPrecio       { FIJO, POR_HORA, GRATIS, NEGOCIABLE }
enum TipoMedio        { IMAGEN, VIDEO, ARCHIVO }
enum MotivoReporte    { SPAM, CONTENIDO_INAPROPIADO, INFORMACION_FALSA, DUPLICADO, OTRO }
enum EstadoReporte    { PENDIENTE, REVISADO, DESCARTADO }
enum TipoNotificacion { PUBLICACION_APROBADA, PUBLICACION_RECHAZADA, MENSAJE_NUEVO, FAVORITO_NUEVO, REPORTE_RESUELTO }
```

### Índices de rendimiento

Prisma crea automáticamente índices en campos clave para optimizar consultas:

```sql
-- Publicaciones: filtrado rápido en marketplace
@@index([tipo])
@@index([estado])
@@index([categoriaId])
@@index([autorId])
@@index([creadoEn])

-- Mensajes: paginación y unread count
@@index([conversacionId])
@@index([emisorId])
@@index([creadoEn])

-- Conversaciones: bandeja ordenada por recencia
@@index([ultimoMensajeEn])
```

---

## 🔑 Autenticación y roles

### Sistema de autenticación personalizado

El proyecto implementa su **propio sistema de autenticación** basado en:

| Componente | Implementación |
|------------|----------------|
| **Hash de contraseñas** | `bcryptjs` con salt automático |
| **Sesión del cliente** | `localStorage` + `document.cookie` (sincronizados) |
| **Sesión del servidor** | Cookie `usuario` leída por API routes y middleware |
| **Duración de sesión** | 7 días (`max-age: 604800`) |
| **Estado global** | `AuthContext` (React Context) con hooks `useAuth()` |

### Flujo de protección de rutas

```typescript
// src/middleware.ts — Protección por middleware Edge de Next.js
export async function middleware(request: NextRequest) {
  // Rutas admin: /admin/dashboard/* y /dashboard/admin/*
  if (pathname.startsWith('/admin/dashboard') || pathname.startsWith('/dashboard/admin')) {
    const token = request.cookies.get('usuario')?.value;

    if (!token) → redirect('/login')

    const usuario = JSON.parse(decodeURIComponent(token));
    if (usuario.rol !== 'ADMIN') → redirect('/dashboard/student')
  }
}
```

### Roles y permisos

```mermaid
graph LR
    A((ESTUDIANTE)) --> B[Explorar marketplace]
    A --> C[Crear publicaciones]
    A --> D[Chat con vendedores]
    A --> E[Favoritos y carrito]
    A --> F[Reportar contenido]
    A --> G[Editar perfil]

    H((ALIADO)) --> B
    H --> C
    H --> D
    H --> E

    I((ADMIN)) --> J[Panel administrativo]
    I --> K[Aprobar / rechazar publicaciones]
    I --> L[Bloquear / desbloquear usuarios]
    I --> M[Gestionar reportes]
    I --> N[CRUD categorías]
    I --> O[Ver historial de moderación]
    I --> P[Estadísticas del sistema]

    style A fill:#3B82F6,color:#fff
    style H fill:#22C55E,color:#fff
    style I fill:#881a1d,color:#fff
```

| Acción | ESTUDIANTE | ALIADO | ADMIN |
|--------|-----------|--------|-------|
| Ver marketplace | ✅ | ✅ | ✅ |
| Crear publicaciones | ✅ | ✅ | ❌ |
| Chat directo | ✅ | ✅ | ❌ |
| Favoritos | ✅ | ✅ | ❌ |
| Carrito | ✅ | ✅ | ❌ |
| Reportar | ✅ | ✅ | ❌ |
| Aprobar publicaciones | ❌ | ❌ | ✅ |
| Gestionar usuarios | ❌ | ❌ | ✅ |
| Ver estadísticas | ❌ | ❌ | ✅ |
| Gestionar reportes | ❌ | ❌ | ✅ |

### Seguridad implementada

- ✅ Contraseñas hasheadas con `bcrypt` (nunca se almacenan en plano)
- ✅ Verificación de cuenta (`verificado: false` bloquea el login)
- ✅ Bloqueo de cuenta (`bloqueado: true` bloquea el login con mensaje específico)
- ✅ Cookie `SameSite: lax` para prevenir CSRF
- ✅ Middleware Edge protege rutas admin sin acceder a DB
- ✅ Endpoints de admin validan rol en cada request
- ✅ Campos sensibles excluidos en respuestas (`contrasena` nunca se retorna)

---

## 📦 Módulos del sistema

### 🏠 Landing Page (`/`)

Página pública con experiencia de alta conversión:

- **Hero dinámico**: fondo degradado UCP (#881a1d → #c55f23), texto animado con Framer Motion, barra de búsqueda con redirección al explore, 3 floating cards con publicaciones reales de la BD
- **Marquee de categorías**: banda horizontal infinita con CSS animation
- **Stats bar**: contadores animados (IntersectionObserver) con 4 KPIs del sistema
- **Publicaciones recientes**: grid responsivo de las últimas 8 publicaciones aprobadas
- **Sección "¿Por qué UCP?"**: 3 features cards con hover animation
- **Grid de categorías**: navegación directa al explore filtrado
- **CTA final**: banner de conversión con degradado y call-to-action

### 🔍 Explorar (`/explore`)

Marketplace completo con:

- **Búsqueda fulltext** en título y descripción (backend, modo insensitive)
- **Filtros collapsibles**: tipo de publicación (4 opciones), categoría, rango de precio
- **Ordenamiento**: más recientes, precio asc/desc
- **Chips de filtros activos** con botón eliminar individual
- **Layout dual**: panel lateral en desktop, Sheet modal en móvil
- **Paginación** con metadatos (`hasNext`, `hasPrev`, total)
- **Skeleton loading** durante la carga
- **Conteo de resultados** en tiempo real

### 📄 Detalle de Publicación (`/publication/[id]`)

Vista completa del producto/servicio:

- **Galería de imágenes**: imagen principal con miniaturas clickeables
- **Información completa**: título, tipo (badge), categoría, precio con formato COP
- **Info del vendedor**: avatar, nombre, correo, facultad, badge "Verificado UCP"
- **Acciones disponibles**:
  - ❤️ Toggle favorito (optimista)
  - 🔗 Compartir
  - 🚩 Reportar (solo para publicaciones ajenas)
  - 💬 Contactar vendedor (chat interno)
  - 🛒 Agregar al carrito (productos y servicios)
  - 📲 Contactar por WhatsApp (genera link wa.me con mensaje pre-llenado)
- **Campos específicos por tipo**: fecha de evento, ubicación, cupos disponibles, fecha límite convocatoria

### 👤 Dashboard Estudiante (`/dashboard/student`)

Panel personal con sub-secciones:

| Sección | Funcionalidad |
|---------|--------------|
| `/publications` | Listar publicaciones propias con estado (PENDIENTE/APROBADA/RECHAZADA) |
| `/publications/new` | Formulario multi-campo para crear nueva publicación |
| `/messages` | Bandeja de conversaciones ordenada por recencia |
| `/messages/[id]` | Chat en tiempo real con historial de mensajes |
| `/profile` | Editar nombre, facultad, semestre, teléfono, avatar |
| `/favorites` | Grid de publicaciones guardadas como favoritas |
| `/cart` | Resumen del carrito con totales y gestión de ítems |
| `/settings` | Cambiar contraseña y configuración de cuenta |

### 🛡️ Panel Administrativo (`/admin/dashboard`)

Dashboard completo para moderación:

```
/admin/dashboard
    ├── / ──────── KPIs: total publicaciones, pendientes, usuarios, reportes
    ├── publicaciones ─── Lista pendientes con Aprobar/Rechazar + nota de rechazo
    ├── usuarios ──────── Tabla de usuarios con estado, bloquear/desbloquear, detalles
    ├── reportes ──────── Gestión de reportes: motivo, estado, acciones
    ├── categorias ────── CRUD de categorías: nombre, slug, color, icono
    └── notificaciones ── Centro de notificaciones del sistema
```

**Características del dashboard admin**:
- Estadísticas con barras de progreso comparativas por tipo y estado
- Historial de actividad reciente (moderación con timestamp y admin responsable)
- Acciones rápidas con navegación directa a secciones críticas
- Flujo completo de moderación con registro en `HistorialPublicacion`

---

## 🌐 API Reference

Todos los endpoints retornan JSON. Los errores siguen el formato `{ error: string }` o `{ message: string }`.

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario | ❌ |
| `POST` | `/api/auth/login` | Login con email + contraseña | ❌ |
| `POST` | `/api/auth/logout` | Cerrar sesión y limpiar cookie | ✅ |
| `POST` | `/api/auth/change-password` | Cambiar contraseña | ✅ |

### Publicaciones

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/publicaciones` | Listar publicaciones aprobadas | ❌ |
| `POST` | `/api/publicaciones` | Crear nueva publicación | ✅ |
| `GET` | `/api/publicaciones/[id]` | Obtener publicación por ID | ❌ |
| `PUT` | `/api/publicaciones/[id]` | Actualizar publicación | ✅ |
| `DELETE` | `/api/publicaciones/[id]` | Eliminar publicación | ✅ |
| `POST` | `/api/publicaciones/[id]/favoritos` | Toggle favorito | ✅ |
| `POST` | `/api/publicaciones/[id]/reportar` | Reportar publicación | ✅ |

**Parámetros de query para GET `/api/publicaciones`:**

```
?tipo=PRODUCTO|SERVICIO|EVENTO|CONVOCATORIA
&categoria=slug-de-categoria
&search=texto de búsqueda
&sort=recientes|precio-asc|precio-desc|populares
&page=1
&limit=12
```

### Favoritos y Carrito

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/favoritos` | Listar favoritos del usuario autenticado |
| `POST` | `/api/carrito` | Agregar ítem al carrito |
| `GET` | `/api/carrito` | Listar ítems del carrito |
| `DELETE` | `/api/carrito/[itemId]` | Eliminar ítem del carrito |

### Mensajería

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/conversaciones` | Listar conversaciones del usuario |
| `POST` | `/api/conversaciones` | Crear o recuperar conversación |
| `GET` | `/api/conversaciones/[id]/mensajes` | Listar mensajes de una conversación |
| `POST` | `/api/conversaciones/[id]/mensajes` | Enviar mensaje |
| `PUT` | `/api/conversaciones/[id]/leer` | Marcar mensajes como leídos |

### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/usuarios/[id]` | Perfil del usuario |
| `PUT` | `/api/usuarios/[id]` | Actualizar perfil |
| `GET` | `/api/usuarios/[id]/publicaciones` | Publicaciones del usuario |
| `GET` | `/api/usuarios/[id]/favoritos` | Favoritos del usuario |
| `GET` | `/api/usuarios/[id]/mensajes` | Mensajes del usuario |

### Administración (requieren rol ADMIN)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/admin/dashboard/stats` | KPIs del sistema |
| `GET` | `/api/admin/publicaciones` | Todas las publicaciones |
| `PUT` | `/api/publications/[id]/approve` | Aprobar publicación |
| `GET` | `/api/admin/reportes` | Todos los reportes |
| `GET` | `/api/admin/usuarios` | Todos los usuarios |
| `PUT` | `/api/admin/usuarios/[id]` | Bloquear/desbloquear usuario |

### Multimedia

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/upload` | Subir imagen (multipart/form-data) |

---

## 💬 Chat en tiempo real

UCP Marketplace incluye un sistema completo de mensajería en tiempo real basado en **Socket.IO 4.8**.

### Arquitectura del WebSocket

```
server.js
└── io.on('connection', socket => {
      userId = socket.handshake.auth.userId
      onlineUsers.set(userId, { socketId, lastSeen })

      socket.join(`user:${userId}`)        → Room personal para notificaciones directas
      socket.broadcast.emit('user:status') → Notifica a todos que el user está online

      Eventos escuchados:
        conversation:join   → socket.join(`conv:${conversationId}`)
        conversation:leave  → socket.leave(`conv:${conversationId}`)
        typing:start        → socket.to(`conv:ID`).emit('typing:start', {userId})
        typing:stop         → socket.to(`conv:ID`).emit('typing:stop', {userId})
        user:check_status   → retorna mapa userId → online/offline
        disconnect          → onlineUsers.delete(), broadcast offline
    })
```

### Eventos del protocolo WebSocket

| Evento (cliente → servidor) | Payload | Descripción |
|-----------------------------|---------|-------------|
| `conversation:join` | `conversationId: string` | Unirse a la sala de una conversación |
| `conversation:leave` | `conversationId: string` | Salir de una sala |
| `typing:start` | `{ conversationId }` | Indicar que el usuario está escribiendo |
| `typing:stop` | `{ conversationId }` | Dejar de indicar escritura |
| `user:check_status` | `{ userIds: string[] }` | Consultar estado online por batch |

| Evento (servidor → cliente) | Payload | Descripción |
|-----------------------------|---------|-------------|
| `user:status` | `{ userId, online: bool }` | Cambio de presencia |
| `user:statuses` | `{ [userId]: bool }` | Respuesta a check_status |
| `typing:start` | `{ userId, conversationId }` | Alguien está escribiendo |
| `typing:stop` | `{ userId, conversationId }` | Dejó de escribir |
| `message:new` | `{ message, conversationId }` | Nuevo mensaje (emitido desde API Route via `global.io`) |

### Hook `useSocket`

```typescript
const {
  socket,            // Instancia Socket.IO del cliente
  isConnected,       // boolean — estado de conexión
  joinConversation,  // (id) => void
  leaveConversation, // (id) => void
  startTyping,       // (id) => void
  stopTyping,        // (id) => void
} = useSocket();
```

### Flujo de un mensaje

```
1. Usuario A escribe en el input
   → debounce → socket.emit('typing:start', { conversationId })

2. Usuario A envía mensaje
   → POST /api/conversaciones/[id]/mensajes
   → API Route crea Mensaje en DB
   → API Route emite via global.io.to(`conv:${id}`).emit('message:new', mensaje)

3. Usuario B (en la misma sala) recibe 'message:new'
   → Agrega mensaje al estado local
   → PUT /api/conversaciones/[id]/leer (marca como leído si está visible)
```

### Auth Gate para el chat

El componente `ContactButton` verifica si el usuario está autenticado antes de iniciar una conversación. Si no lo está, muestra `AuthGateModal` que invita al registro. Esto evita conversaciones anónimas.

---

## 📖 Manual de usuario

### Para estudiantes y aliados

#### 1. Registro e inicio de sesión

| Paso | Acción |
|------|--------|
| 1 | Ir a `/register` y completar: nombre, correo institucional, contraseña |
| 2 | Un administrador verificará la cuenta (`verificado: true`) |
| 3 | Ir a `/login` con tus credenciales |
| 4 | Serás redirigido automáticamente según tu rol |

> ⚠️ **Nota**: Las cuentas requieren verificación manual por un administrador antes del primer acceso.

#### 2. Explorar el marketplace

```
/ (Home)
  → Busca en la barra del hero (Enter → redirige a /explore?q=...)
  → Haz clic en una categoría → /explore?categoria=slug

/explore
  → Usa los filtros del panel izquierdo (desktop) o el botón "Filtros" (móvil)
  → Ordena por recientes, precio asc o precio desc
  → Haz clic en una publicación para ver el detalle
```

#### 3. Crear una publicación

```
/dashboard/student/publications/new

Campos comunes:
  Título, Descripción, Tipo (Producto | Servicio | Evento | Convocatoria)
  Categoría, Precio + Tipo de precio (fijo, por hora, gratis, negociable)
  Facultad (opcional)

Campos específicos por tipo:
  Evento       → Fecha del evento, Ubicación, Cupos disponibles
  Convocatoria → Fecha límite

La publicación queda en estado PENDIENTE hasta que un admin la aprueba.
```

#### 4. Contactar un vendedor

Desde el detalle de una publicación (`/publication/[id]`):

- **💬 Chat interno**: Crea o recupera la conversación → `/dashboard/student/messages/[id]`
- **📲 WhatsApp**: Abre `wa.me/+57XXXXXXXXXX?text=...` con mensaje pre-llenado en nueva pestaña

#### 5. Favoritos

- ❤️ Haz clic en el corazón de cualquier tarjeta o detalle de publicación
- Los favoritos se guardan localmente si no has iniciado sesión
- Al hacer login, se sincronizan automáticamente con tu cuenta en la nube

#### 6. Carrito de compras

- 🛒 Desde el detalle, haz clic en "Agregar al carrito" (solo para productos y servicios)
- Accede al carrito desde el ícono 🛒 en el header
- Gestiona cantidades y elimina ítems desde `/dashboard/student/cart`

---

### Para administradores

#### Acceso al panel

```
/admin/login → Iniciar sesión con cuenta rol ADMIN
/admin/dashboard → Panel principal
```

#### Flujo de moderación de publicaciones

```
/admin/dashboard/publicaciones

1. Ver lista de publicaciones en estado PENDIENTE
2. Revisar título, descripción, imágenes y datos del autor
3a. Aprobar → estado: APROBADA → Publicación visible en marketplace
3b. Rechazar → estado: RECHAZADA → Ingresar nota de rechazo
4. Acción queda registrada en HistorialPublicacion con timestamp y adminId
```

#### Gestión de usuarios

```
/admin/dashboard/usuarios

- Ver tabla completa de usuarios con su rol y estado
- Bloquear usuario (bloqueado: true) → no podrá iniciar sesión
- Desbloquear usuario (bloqueado: false) → restaura acceso
- Ver perfil completo y publicaciones de cada usuario
```

#### Gestión de reportes

```
/admin/dashboard/reportes

- Ver reportes pendientes con motivo y descripción
- Marcar como REVISADO → contenido moderado
- Marcar como DESCARTADO → reporte sin mérito
```

---

## 🎨 Sistema de diseño y UX

### Paleta de colores institucional

| Token | Hex | Uso |
|-------|-----|-----|
| `ucp-rojo` | `#881a1d` | Color primario, CTAs, highlights, bordes activos |
| `ucp-gold` | `#f4c222` | Acentos decorativos, spans destacados en hero |
| `ucp-verde` | `#22c55e` | Éxito, verificado, acciones positivas |
| `gray-50 → gray-900` | Escala Tailwind | Textos, fondos, bordes |

### Sistema de componentes (shadcn/ui + Radix)

El proyecto usa una implementación completa de **shadcn/ui** con 30+ componentes accesibles:

```
Layouts:    Card, Separator, Resizable, ScrollArea
Forms:      Input, Textarea, Select, Checkbox, RadioGroup, Switch, Slider, Form
Overlays:   Dialog, Sheet, Drawer, AlertDialog, Popover, HoverCard, Tooltip
Navigation: NavigationMenu, Breadcrumb, Tabs, Menubar, DropdownMenu, ContextMenu
Feedback:   Badge, Alert, Progress, Skeleton, Sonner (toasts)
Data:       Table, Chart, Carousel, Calendar, Pagination
Special:    Avatar, Accordion, Collapsible, Command, InputOTP, Aurora
```

### Animaciones con Framer Motion

```typescript
// Pattern fadeUp — usado en todas las secciones de landing
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

// IntersectionObserver para activar animaciones al hacer scroll
const inView = useInView(ref, { once: true, margin: "-80px" });
```

**Animaciones CSS custom** (en `globals.css`):

```css
@keyframes float {
  0%, 100% { transform: rotate(-6deg) translateY(0px); }
  50%       { transform: rotate(-6deg) translateY(-8px); }
}

@keyframes marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-33.333%); }
}
```

### Responsive design

| Breakpoint | Comportamiento |
|------------|----------------|
| `sm` (640px) | Grid 2 columnas para cards, búsqueda completa |
| `md` (768px) | Stats en 4 columnas, barra de búsqueda visible en header |
| `lg` (1024px) | Panel de filtros lateral en explore, nav links visibles, hero en 2 columnas |
| `xl` (1280px) | Grid 3 columnas en explore |

**Mobile-first**: El menú de navegación en móvil usa `Sheet` de Radix (drawer desde la derecha) con secciones organizadas por contexto y datos del usuario autenticado.

### Principios UX implementados

- **Optimistic updates**: Favoritos y carrito responden instantáneamente antes de confirmar con el backend
- **Loading states**: Skeletons en lugar de spinners para publicaciones, `LoadingOverlay` en logout
- **Empty states**: Mensajes descriptivos cuando no hay resultados con CTA para limpiar filtros
- **Error boundaries**: Fallos silenciosos en fetch con fallback a datos locales
- **Auth gate**: Flujos protegidos piden login sin romper la experiencia (modal, no redirect duro)
- **WhatsApp integration**: Contacto externo disponible como alternativa sin necesidad de login

---

## ⚡ Performance y optimizaciones

### Server Components vs Client Components

```typescript
// ✅ Server Component: no incluye JS en el cliente
// Rutas de solo lectura que no necesitan interactividad

// ✅ Client Component: marcado explícitamente con "use client"
// Solo cuando se necesita: useState, useEffect, eventos, contextos
```

La arquitectura App Router de Next.js 15 permite que la mayoría de componentes de navegación sean Server Components, reduciendo el bundle del cliente.

### Optimización de consultas Prisma

```typescript
// Selección explícita de campos (evita over-fetching)
prisma.publicacion.findMany({
  select: {
    id: true, titulo: true, precio: true,
    medios: { take: 1, orderBy: { orden: 'asc' } }, // Solo primera imagen
    etiquetas: { take: 5 },                           // Máximo 5 etiquetas
    _count: { select: { favoritos: true } },          // Conteo sin traer todos los favoritos
  }
})

// Consultas paralelas con Promise.all
const [publicaciones, total] = await Promise.all([
  prisma.publicacion.findMany({ ... }),
  prisma.publicacion.count({ where }),
]);
```

### Caché de respuestas API

```typescript
// Headers de caché en endpoints públicos del marketplace
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
  },
});
```

### Lazy loading del cliente Socket.IO

```typescript
// useSocket.ts — importación dinámica para evitar incluir socket.io-client en el bundle inicial
import('@/lib/socket-client').then(({ getSocket }) => {
  const sock = getSocket(usuario.id);
  // ...
});
```

### Singleton de Prisma Client

```typescript
// src/lib/prisma.ts — evita múltiples instancias en hot reload
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Singleton de Socket.IO Client

```typescript
// src/lib/socket-client.ts — reutiliza la conexión entre renders
let socketInstance: Socket | null = null;
let currentUserId: string | null = null;
// Reconecta solo si cambia el userId
```

### Optimización de imágenes

- `next/image` listo en la config para dominios remotos (Unsplash, Cloudinary)
- Fallback a placeholder de Unsplash si no hay imagen
- Solo se carga la primera imagen en listados (`medios: { take: 1 }`)
- Galería completa solo en vista de detalle

### Webpack y bundle splitting

```javascript
// next.config.mjs — Socket.IO excluido del bundle cliente
serverExternalPackages: ['socket.io', 'socket.io-adapter', 'engine.io', 'ws', 'uws'],

// Polyfills deshabilitados en cliente para módulos Node.js
config.resolve.fallback = { net: false, tls: false, fs: false, crypto: false };
```

---

## 🚢 Despliegue

### Vercel (recomendado para frontend)

> ⚠️ **Importante**: Vercel no soporta Socket.IO directamente en sus Edge Functions. Para habilitar el chat en tiempo real en producción, se necesita un servidor externo.

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Variables de entorno en Vercel Dashboard:**
```
DATABASE_URL        → URL con pooler de Neon
DIRECT_DATABASE_URL → URL directa de Neon
NEXTAUTH_URL        → https://tu-app.vercel.app
NEXTAUTH_SECRET     → secreto aleatorio seguro
NEXT_PUBLIC_SOCKET_ENABLED → false (sin socket en Vercel)
NEXT_PUBLIC_APP_URL → https://tu-app.vercel.app
```

**Archivo `vercel.json`** (ya incluido en el proyecto):
```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install"
}
```

### Railway (recomendado para producción completa con Socket.IO)

Railway soporta servidores Node.js persistentes, lo que permite usar `server.js` con Socket.IO:

```bash
# 1. Conectar repositorio en railway.app
# 2. Configurar start command: node server.js
# 3. Agregar PostgreSQL plugin (o apuntar a Neon)
# 4. Configurar variables de entorno
NEXT_PUBLIC_SOCKET_ENABLED=true
NEXT_PUBLIC_SOCKET_URL=https://tu-app.railway.app
PORT=3000
```

### Neon Database

```bash
# 1. Crear proyecto en neon.tech
# 2. Copiar las dos URLs (pooler y directa)
# 3. Configurar en .env:
DATABASE_URL="postgresql://...@ep-xxx-pooler.aws.neon.tech/..."
DIRECT_DATABASE_URL="postgresql://...@ep-xxx.aws.neon.tech/..."

# 4. Aplicar esquema
npx prisma db push

# 5. Seed de datos iniciales
npm run seed
```

### Arquitectura de despliegue recomendada

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCCIÓN                            │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐  │
│  │   Vercel     │    │   Railway    │    │   Neon    │  │
│  │  (Next.js)   │◄──►│ (Socket.IO) │◄──►│ (Postgres)│  │
│  │  Static +    │    │  server.js   │    │ Serverless│  │
│  │  API Routes  │    │  WS Server   │    │   + Pool  │  │
│  └──────────────┘    └──────────────┘    └───────────┘  │
│         ↑                   ↑                            │
│     HTTP/HTTPS           WebSocket                       │
│         ↓                   ↓                            │
│              USUARIOS (Browser)                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🗺️ Roadmap

```
✅ COMPLETADO (v0.0.1)
├── Marketplace con filtros y búsqueda
├── Sistema de publicaciones con 4 tipos
├── Autenticación custom con roles
├── Panel administrativo completo
├── Chat en tiempo real (Socket.IO)
├── Favoritos con sincronización híbrida
├── Carrito de compras
├── Sistema de reportes
├── Moderación con historial
└── Dashboard de estudiante

🔄 EN DESARROLLO
├── Verificación de cuentas por email
├── Imágenes múltiples optimizadas en publicaciones
└── Productos relacionados en vista de detalle

🔜 PRÓXIMAS VERSIONES
├── 🤖 Recomendaciones con IA
│   └── Algoritmo basado en historial de favoritos y búsquedas
│
├── 📊 Analytics avanzados
│   └── Vistas por publicación, tasa de conversión, heatmaps
│
├── 💳 Pasarela de pagos
│   └── Integración con PSE / Mercado Pago para Colombia
│
├── 🔔 Notificaciones push (Web Push API)
│   └── Alertas nativas del navegador sin estar en la app
│
├── 🌟 Sistema de calificaciones
│   └── Rating de vendedores post-transacción
│
├── 📱 App móvil
│   └── React Native compartiendo lógica de negocio
│
└── 🏷️ Publicidad y planes premium
    └── Publicaciones destacadas, banners institucionales
```

---

## 👥 Créditos y equipo

<div align="center">

### Desarrollado con ❤️ por

<table>
  <tr>
    <td align="center">
      <br/>
      <b>Alejandro Piedrahita</b>
      <br/>
      <sub>Arquitectura · Backend · Auth</sub>
    </td>
    <td align="center">
      <br/>
      <b>Daniel Colorado</b>
      <br/>
      <sub>Frontend · UI/UX · Marketplace</sub>
    </td>
    <td align="center">
      <br/>
      <b>Sebastián Patiño</b>
      <br/>
      <sub>Base de datos · API · Chat</sub>
    </td>
  </tr>
</table>

</div>

---

### Contexto académico

```
Proyecto:    UCP Marketplace — Plataforma de comercio universitario
Asignatura:  Ingeniería de Software I
Institución: Universidad Católica de Pereira (UCP)
Ciudad:      Pereira, Risaralda, Colombia
Año:         2026
```

### Sobre el proyecto

UCP Marketplace nació como respuesta a una necesidad real dentro del campus: **los estudiantes no tenían un canal centralizado, seguro y verificado para intercambiar productos, ofrecer servicios o conocer eventos**. Plataformas como Facebook Marketplace o grupos de WhatsApp no garantizaban la exclusividad ni la confianza de una comunidad universitaria cerrada.

El sistema fue diseñado desde cero con un enfoque **enterprise** — no como un proyecto académico básico, sino como un producto real y escalable que podría adoptarse oficialmente por la institución. Cada decisión técnica (App Router, Prisma con Neon, Socket.IO en servidor custom, sistema de roles, moderación con historial auditado) responde a requerimientos de un sistema de producción real.

### Agradecimientos

- A la **Universidad Católica de Pereira** por el espacio académico y la motivación institucional
- Al profesor de **Ingeniería de Software I** por la guía metodológica
- A la comunidad **open-source** de Next.js, Prisma, shadcn/ui, Radix UI y Framer Motion por las herramientas excepcionales

---

<div align="center">

---

**UCP Marketplace** · Universidad Católica de Pereira · 2026

Hecho con Next.js 15 · Prisma · Socket.IO · TailwindCSS · Framer Motion

[![GitHub](https://img.shields.io/badge/GitHub-Ver_código-181717?style=flat-square&logo=github)](../../)
[![UCP](https://img.shields.io/badge/Universidad-Católica_de_Pereira-881a1d?style=flat-square)](https://www.ucp.edu.co)

*"Compra, vende, conecta — todo en la UCP"*

</div>

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  