-- ============================================================
--  SECCIÓN 7 · AUDITORÍA Y ANOMALÍAS  (RF16, RF17, HU-07)
--  (auditoria, tipo_anomalias, anomalias, notificaciones)
-- ============================================================

-- ------------------------------------------------------------
-- 7.1  auditoria  (RF17, HU-07)
--  Nunca puede ser modificada ni eliminada por ningún usuario.
--  Se popula ÚNICAMENTE por triggers (garantía desde MySQL).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auditoria (
    id_auditoria       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id         INT UNSIGNED   COMMENT 'Tomado de @current_user_id',
    tabla_afectada     VARCHAR(100)   NOT NULL,
    accion             ENUM('INSERT','UPDATE','DELETE') NOT NULL,
    registro_id        VARCHAR(50)    COMMENT 'PK del registro afectado',
    valores_anteriores JSON,
    valores_nuevos     JSON,
    ip_origen          VARCHAR(45)    COMMENT 'Tomado de @current_ip',
    created_at         TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tabla_accion (tabla_afectada, accion),
    INDEX idx_usuario      (usuario_id),
    INDEX idx_fecha        (created_at),
    INDEX idx_registro     (registro_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7.2  tipo_anomalias  (RF16)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tipo_anomalias (
    id_tipo_anomalia INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo           VARCHAR(20)  NOT NULL UNIQUE,
    nombre           VARCHAR(100) NOT NULL,
    severidad        VARCHAR(100),
    descripcion      TEXT,
    activo           TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7.3  anomalias
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS anomalias (
    id_anomalia      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tipo_anomalia_id INT UNSIGNED NOT NULL,
    usuario_id       INT UNSIGNED,
    entidad_id       VARCHAR(50)  COMMENT 'PK del registro origen de la anomalía',
    descripcion      TEXT,
    estado           ENUM('Pendiente','Revisada','Cerrada') NOT NULL DEFAULT 'Pendiente',
    created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_estado (estado),
    INDEX idx_tipo   (tipo_anomalia_id),
    FOREIGN KEY (tipo_anomalia_id) REFERENCES tipo_anomalias(id_tipo_anomalia),
    FOREIGN KEY (usuario_id)       REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7.4  notificaciones  (Socket.IO persiste aquí el registro)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificaciones (
    id_notificacion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT UNSIGNED,
    cliente_id      INT UNSIGNED,
    tipo            VARCHAR(50),
    titulo          VARCHAR(200) NOT NULL,
    descripcion     TEXT,
    leida           TINYINT(1)   NOT NULL DEFAULT 0,
    data            JSON,
    link            VARCHAR(500),
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_usuario_leida (usuario_id, leida),
    INDEX idx_created       (created_at),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario)  ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id_cliente)  ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
