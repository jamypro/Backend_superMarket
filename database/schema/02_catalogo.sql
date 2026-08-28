-- ============================================================
--  SECCIÓN 2 · CATÁLOGO DE PRODUCTOS
--  (categorias, unidades_de_medida, productos, img_productos)
-- ============================================================

-- ------------------------------------------------------------
-- 2.1  categorias
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
    id_categoria INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    descripcion  TEXT,
    activo       TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2.2  unidades_de_medida
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS unidades_de_medida (
    id_unidad  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre     VARCHAR(50)   NOT NULL,
    simbolo    VARCHAR(10)   NOT NULL,
    conversion DECIMAL(10,4) DEFAULT 1.0000
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2.3  productos  (RF03, RF06, RF07)
--  · codigo_barras: índice único para búsqueda < 300 ms (RNF-R01)
--  · precio_minimo: umbral para detección de anomalías (RF16)
--  · caducidad:     alerta 7 días antes (HU-03 CA6)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
    id_producto         INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    codigo_barras       VARCHAR(50)   UNIQUE,
    nombre              VARCHAR(200)  NOT NULL,
    descripcion         TEXT,
    id_categoria        INT UNSIGNED,
    id_unidad_de_medida INT UNSIGNED,
    precio_venta        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    precio_compra       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    precio_minimo       DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Umbral para alerta de venta anómala — RF16',
    porcentaje_iva      DECIMAL(4,2)  NOT NULL DEFAULT 0.00,
    caducidad           DATE          COMMENT 'Fecha de caducidad del lote',
    activo              TINYINT(1)    NOT NULL DEFAULT 1,
    created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_codigo_barras (codigo_barras),
    INDEX idx_nombre        (nombre),
    INDEX idx_categoria     (id_categoria),
    INDEX idx_activo        (activo),
    FOREIGN KEY (id_categoria)        REFERENCES categorias(id_categoria)      ON DELETE SET NULL,
    FOREIGN KEY (id_unidad_de_medida) REFERENCES unidades_de_medida(id_unidad) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2.4  img_productos  (7.1 — imágenes para e-commerce)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS img_productos (
    id_img_producto INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    producto_id     INT UNSIGNED NOT NULL,
    img_url         VARCHAR(500) NOT NULL,
    es_principal    TINYINT(1)   NOT NULL DEFAULT 0,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id_producto) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
