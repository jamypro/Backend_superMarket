-- ============================================================
--  SECCIÓN 1 · TABLAS BASE DEL SISTEMA
--  (codigos, roles, usuarios)
-- ============================================================

-- ------------------------------------------------------------
-- 1.1  codigos  (tabla de parámetros genéricos)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS codigos (
    id_codigo   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    clave       VARCHAR(50)  NOT NULL UNIQUE,
    clase       VARCHAR(50),
    valor       VARCHAR(255) NOT NULL,
    descripcion TEXT,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 1.2  roles  (RF02)
--  Cinco roles según Tabla 2 del documento de requerimientos:
--  Administrador, Supervisor, Cajero, Domiciliario, Auditor
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id_rol      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(50)  NOT NULL UNIQUE,
    descripcion TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 1.3  usuarios  (RF01, RF02, RNF-S02)
--  · contrasena: hash bcrypt ≥ 10 rounds (NUNCA texto plano)
--  · bloqueado: bloqueo temporal tras 5 intentos (HU-01)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rol_id INT UNSIGNED NOT NULL,
    nombre            VARCHAR(100) NOT NULL,
    apellido          VARCHAR(100),
    tipo_documento    ENUM('CC','NIT','CE','Pasaporte') NOT NULL DEFAULT 'CC',
    documento         VARCHAR(20)  UNIQUE,
    correo            VARCHAR(150) NOT NULL UNIQUE,
    contrasena        VARCHAR(255) NOT NULL COMMENT 'bcrypt hash, min 10 rounds — RNF-S02',
    telefono          VARCHAR(20),
    estado            TINYINT(1)   NOT NULL DEFAULT 1,
    bloqueado         TINYINT(1)   NOT NULL DEFAULT 0  COMMENT 'Bloqueo temporal — HU-01 CA4',
    intentos_fallidos TINYINT UNSIGNED NOT NULL DEFAULT 0,
    bloqueo_hasta     TIMESTAMP    NULL COMMENT 'Bloqueo expira en esta fecha/hora',
    ultimo_acceso     TIMESTAMP    NULL,
    codigo_id         INT UNSIGNED,
    created_by        INT UNSIGNED,
    created_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_correo    (correo),
    INDEX idx_documento (documento),
    INDEX idx_estado    (estado),
    FOREIGN KEY (codigo_id) REFERENCES codigos(id_codigo),
    FOREIGN KEY (rol_id) REFERENCES roles(id_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
