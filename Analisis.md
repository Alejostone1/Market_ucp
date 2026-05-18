# 📊 Analisis del Sistema (Sesión JAD)

---

## 1. Exploración del Problema (El "Dolor")

* **¿Cómo se resuelve actualmente sin el software?**
  - Los estudiantes y aliados de la Universidad Católica de Pereira (UCP) deben usar métodos manuales para comprar/vender productos, servicios y eventos
  - Publicación manual en grupos de WhatsApp, redes sociales, carteleras físicas
  - Coordinación de pagos y entregas por canales no centralizados
  - Gestión manual de favoritos y conversaciones con vendedores

* **¿Qué parte del proceso es más lenta o propensa a errores?**
  - **Validación manual**: Cada publicación requiere revisión administrativa manual (estado PENDIENTE → APROBADA/RECHAZADA)
  - **Búsqueda y filtrado**: Sin sistema centralizado, encontrar productos específicos es ineficiente
  - **Gestión de inventario**: Control manual de cupos para eventos y disponibilidad de productos
  - **Comunicación fragmentada**: Mensajes dispersos en múltiples plataformas sin historial unificado
  - **Procesamiento de pagos**: Sin flujo automatizado, requiere coordinación manual

* **¿Qué pasaría si el sistema falla un día entero?**
  - **Pérdida de ventas**: Estudiantes y aliados no podrían publicar ni comprar productos
  - **Interrupción de comunicaciones**: El sistema de mensajes internos dejaría de funcionar
  - **Pérdida de visibilidad**: Nuevas publicaciones no podrían ser aprobadas ni vistas
  - **Impacto económico**: Aliados perderían oportunidades de venta y estudiantes no accederían a servicios
  - **Descentralización forzada**: Los usuarios volverían a métodos manuales menos eficientes

---

## 2. Definición de Usuarios y Roles

* **Usuarios principales del sistema**
  - **ESTUDIANTE**: Comprador principal, puede publicar productos/servicios, agregar al carrito, enviar mensajes
  - **ALIADO**: Vendedor profesional, ofrece servicios y productos de manera regular
  - **ADMIN**: Moderador del sistema, aprueba/rechaza publicaciones, gestiona usuarios y reportes

* **Usuarios de solo lectura**
  - **Visitantes no autenticados**: Solo pueden ver publicaciones aprobadas en el marketplace público
  - **Sistema de reportes**: Los usuarios reportan contenido pero no pueden resolverlo (solo admin)

* **Nivel técnico de los usuarios**
  - **Bajo a medio**: Estudiantes universitarios familiarizados con redes sociales y e-commerce básico
  - **UI intuitiva**: Diseño con iconos claros, colores institucionales UCP, flujos simples
  - **Mínima formación**: El sistema es autoexplicativo con tooltips y guías visuales

---

## 3. Requerimientos Funcionales (El "Qué")

* **Datos obligatorios del sistema**
  - **Usuario**: nombre, correo, contraseña, rol (ESTUDIANTE/ALIADO/ADMIN), facultad, semestre, avatarUrl, teléfono
  - **Publicación**: título, descripción, tipo (PRODUCTO/SERVICIO/EVENTO/CONVOCATORIA), estado, categoría, autor, precio, tipoPrecio
  - **Categoría**: nombre, slug, color, icono, descripción
  - **Medios**: url, tipo (IMAGEN/VIDEO/ARCHIVO), orden, altText
  - **Conversación**: participantesA, participantesB, mensajes, ultimoMensajeEn
  - **Carrito**: usuarioId, publicacionId, cantidad, precioUnitario

* **Generación automática**
  - **Notificaciones**: PUBLICACION_APROBADA, PUBLICACION_RECHAZADA, MENSAJE_NUEVO, FAVORITO_NUEVO, REPORTE_RESUELTO
  - **Historial de moderación**: Registro automático de cambios de estado con notas del admin
  - **Contador de vistas**: Incremento automático al visualizar publicaciones
  - **Reportes de estadísticas**: Dashboard con métricas en tiempo real

* **Control de permisos**
  - **Middleware de autenticación**: Verificación de usuario en rutas protegidas (/dashboard/*)
  - **Validación por rol**: Admin puede acceder a /dashboard/admin, estudiantes solo a sus recursos
  - **Aprobación de contenido**: Solo admin puede cambiar estado de PENDIENTE a APROBADA/RECHAZADA
  - **Bloqueo de usuarios**: Admin puede bloquear cuentas, usuarios bloqueados no pueden iniciar sesión

* **Datos históricos**
  - **HistorialPublicacion**: Todos los cambios de estado con admin responsable y notas
  - **Mensajes**: Registro completo de conversaciones con estado de lectura
  - **Reportes**: Historial de denuncias con estado y resolución
  - **Notificaciones**: Registro de todas las notificaciones enviadas con estado de lectura

---

## 4. Requerimientos No Funcionales (El "Cómo")

* **Plataformas de acceso**
  - **Web principal**: Next.js 15 con React 18, responsive design con Tailwind CSS
  - **API REST**: Endpoints JSON para todas las operaciones CRUD
  - **Base de datos**: MySQL con Prisma ORM, conexión persistente
  - **Almacenamiento de archivos**: Upload local en carpeta /upload con URLs públicas

* **Concurrencia estimada**
  - **Usuarios simultáneos**: 100-500 estudiantes/aliados concurrentes
  - **Publicaciones**: Miles de publicaciones activas con filtrado en tiempo real
  - **Mensajes**: Sistema de chat en tiempo real con múltiples conversaciones simultáneas
  - **Carrito**: Gestión concurrente de items con actualización de precios

* **Rendimiento esperado**
  - **Tiempo de respuesta**: <2 segundos para carga de publicaciones con paginación
  - **Búsqueda y filtrado**: <1 segundo con índices optimizados (tipo, estado, categoría, autor)
  - **Upload de imágenes**: Procesamiento rápido con validación de tamaño y tipo
  - **Dashboard**: Carga instantánea de estadísticas con queries optimizadas
  - **Cache**: Headers de caché para contenido estático y respuestas de API

* **Seguridad y confiabilidad**
  - **Encriptación de contraseñas**: bcryptjs con salt rounds
  - **Validación de inputs**: Zod schemas para todos los formularios
  - **Protección CSRF**: Tokens CSRF en formularios sensibles
  - **Sanitización de datos**: Prevención de XSS en descripciones y mensajes
  - **Rate limiting**: Límites de peticiones por usuario para prevenir abuso
