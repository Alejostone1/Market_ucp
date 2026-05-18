-- CreateTable
CREATE TABLE `Usuario` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `correo` VARCHAR(191) NOT NULL,
    `contrasena` VARCHAR(191) NOT NULL,
    `rol` ENUM('ESTUDIANTE', 'ALIADO', 'ADMIN') NOT NULL DEFAULT 'ESTUDIANTE',
    `facultad` VARCHAR(191) NULL,
    `semestre` INTEGER NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `verificado` BOOLEAN NOT NULL DEFAULT false,
    `bloqueado` BOOLEAN NOT NULL DEFAULT false,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Usuario_correo_key`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Publicacion` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `tipo` ENUM('PRODUCTO', 'SERVICIO', 'EVENTO', 'CONVOCATORIA') NOT NULL,
    `estado` ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'ARCHIVADA') NOT NULL DEFAULT 'PENDIENTE',
    `categoriaId` VARCHAR(191) NOT NULL,
    `autorId` VARCHAR(191) NOT NULL,
    `precio` DECIMAL(10, 2) NULL,
    `tipoPrecio` ENUM('FIJO', 'POR_HORA', 'GRATIS', 'NEGOCIABLE') NULL,
    `facultad` VARCHAR(191) NULL,
    `vistas` INTEGER NOT NULL DEFAULT 0,
    `fechaEvento` DATETIME(3) NULL,
    `ubicacionEvento` VARCHAR(191) NULL,
    `cupos` INTEGER NULL,
    `cuposOcupados` INTEGER NULL DEFAULT 0,
    `fechaLimite` DATETIME(3) NULL,
    `notaRechazo` TEXT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    INDEX `Publicacion_tipo_idx`(`tipo`),
    INDEX `Publicacion_estado_idx`(`estado`),
    INDEX `Publicacion_categoriaId_idx`(`categoriaId`),
    INDEX `Publicacion_autorId_idx`(`autorId`),
    INDEX `Publicacion_creadoEn_idx`(`creadoEn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categoria` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `icono` VARCHAR(191) NULL,
    `descripcion` VARCHAR(191) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Categoria_nombre_key`(`nombre`),
    UNIQUE INDEX `Categoria_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Etiqueta` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `usoCount` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Etiqueta_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EtiquetaEnPublicacion` (
    `publicacionId` VARCHAR(191) NOT NULL,
    `etiquetaId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`publicacionId`, `etiquetaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Medio` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `tipo` ENUM('IMAGEN', 'VIDEO', 'ARCHIVO') NOT NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `altText` VARCHAR(191) NULL,
    `tamanoBytes` INTEGER NULL,
    `publicacionId` VARCHAR(191) NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Medio_publicacionId_idx`(`publicacionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Favorito` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `publicacionId` VARCHAR(191) NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Favorito_usuarioId_idx`(`usuarioId`),
    UNIQUE INDEX `Favorito_usuarioId_publicacionId_key`(`usuarioId`, `publicacionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Conversacion` (
    `id` VARCHAR(191) NOT NULL,
    `participanteAId` VARCHAR(191) NOT NULL,
    `participanteBId` VARCHAR(191) NOT NULL,
    `ultimoMensajeEn` DATETIME(3) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Conversacion_participanteAId_idx`(`participanteAId`),
    INDEX `Conversacion_participanteBId_idx`(`participanteBId`),
    INDEX `Conversacion_ultimoMensajeEn_idx`(`ultimoMensajeEn`),
    UNIQUE INDEX `Conversacion_participanteAId_participanteBId_key`(`participanteAId`, `participanteBId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mensaje` (
    `id` VARCHAR(191) NOT NULL,
    `contenido` TEXT NOT NULL,
    `conversacionId` VARCHAR(191) NOT NULL,
    `emisorId` VARCHAR(191) NOT NULL,
    `leido` BOOLEAN NOT NULL DEFAULT false,
    `leidoEn` DATETIME(3) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Mensaje_conversacionId_idx`(`conversacionId`),
    INDEX `Mensaje_emisorId_idx`(`emisorId`),
    INDEX `Mensaje_creadoEn_idx`(`creadoEn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reporte` (
    `id` VARCHAR(191) NOT NULL,
    `reportanteId` VARCHAR(191) NOT NULL,
    `publicacionId` VARCHAR(191) NOT NULL,
    `motivo` ENUM('SPAM', 'CONTENIDO_INAPROPIADO', 'INFORMACION_FALSA', 'DUPLICADO', 'OTRO') NOT NULL,
    `descripcion` TEXT NULL,
    `estado` ENUM('PENDIENTE', 'REVISADO', 'DESCARTADO') NOT NULL DEFAULT 'PENDIENTE',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Reporte_estado_idx`(`estado`),
    INDEX `Reporte_publicacionId_idx`(`publicacionId`),
    UNIQUE INDEX `Reporte_reportanteId_publicacionId_key`(`reportanteId`, `publicacionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistorialPublicacion` (
    `id` VARCHAR(191) NOT NULL,
    `publicacionId` VARCHAR(191) NOT NULL,
    `estadoAnterior` ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'ARCHIVADA') NOT NULL,
    `estadoNuevo` ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'ARCHIVADA') NOT NULL,
    `nota` TEXT NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `HistorialPublicacion_publicacionId_idx`(`publicacionId`),
    INDEX `HistorialPublicacion_adminId_idx`(`adminId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notificacion` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `tipo` ENUM('PUBLICACION_APROBADA', 'PUBLICACION_RECHAZADA', 'MENSAJE_NUEVO', 'FAVORITO_NUEVO', 'REPORTE_RESUELTO') NOT NULL,
    `referenciaId` VARCHAR(191) NULL,
    `mensaje` VARCHAR(191) NOT NULL,
    `leida` BOOLEAN NOT NULL DEFAULT false,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notificacion_usuarioId_idx`(`usuarioId`),
    INDEX `Notificacion_leida_idx`(`leida`),
    INDEX `Notificacion_creadoEn_idx`(`creadoEn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Publicacion` ADD CONSTRAINT `Publicacion_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Publicacion` ADD CONSTRAINT `Publicacion_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EtiquetaEnPublicacion` ADD CONSTRAINT `EtiquetaEnPublicacion_publicacionId_fkey` FOREIGN KEY (`publicacionId`) REFERENCES `Publicacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EtiquetaEnPublicacion` ADD CONSTRAINT `EtiquetaEnPublicacion_etiquetaId_fkey` FOREIGN KEY (`etiquetaId`) REFERENCES `Etiqueta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Medio` ADD CONSTRAINT `Medio_publicacionId_fkey` FOREIGN KEY (`publicacionId`) REFERENCES `Publicacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorito` ADD CONSTRAINT `Favorito_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorito` ADD CONSTRAINT `Favorito_publicacionId_fkey` FOREIGN KEY (`publicacionId`) REFERENCES `Publicacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversacion` ADD CONSTRAINT `Conversacion_participanteAId_fkey` FOREIGN KEY (`participanteAId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversacion` ADD CONSTRAINT `Conversacion_participanteBId_fkey` FOREIGN KEY (`participanteBId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mensaje` ADD CONSTRAINT `Mensaje_conversacionId_fkey` FOREIGN KEY (`conversacionId`) REFERENCES `Conversacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mensaje` ADD CONSTRAINT `Mensaje_emisorId_fkey` FOREIGN KEY (`emisorId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reporte` ADD CONSTRAINT `Reporte_reportanteId_fkey` FOREIGN KEY (`reportanteId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reporte` ADD CONSTRAINT `Reporte_publicacionId_fkey` FOREIGN KEY (`publicacionId`) REFERENCES `Publicacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistorialPublicacion` ADD CONSTRAINT `HistorialPublicacion_publicacionId_fkey` FOREIGN KEY (`publicacionId`) REFERENCES `Publicacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistorialPublicacion` ADD CONSTRAINT `HistorialPublicacion_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
