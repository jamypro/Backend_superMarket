-- ============================================================
--  SECCIÓN 10 · CONFIGURACIÓN DEL SISTEMA
-- ============================================================

CREATE TABLE IF NOT EXISTS configuracion_sistema (
    id_configuracion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    clave            VARCHAR(100) NOT NULL UNIQUE,
    symbol           VARCHAR(20),
    valor            TEXT         NOT NULL,
    descripcion      TEXT,
    updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    prioridad        INT          DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
