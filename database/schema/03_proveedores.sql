-- ============================================================
--  SECCIÓN 3 · PROVEEDORES Y ÓRDENES DE COMPRA
--  (proveedores, proveedor_producto, ordenes_compra, items_orden_compra)
-- ============================================================

-- ------------------------------------------------------------
-- 3.1  proveedores  (RF11)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proveedores (
    id_proveedor     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre           VARCHAR(150) NOT NULL,
    nit              VARCHAR(20),
    contacto         VARCHAR(100),
    telefono         VARCHAR(20),
    email            VARCHAR(100),
    direccion        VARCHAR(200),
    municipio        VARCHAR(100),
    departamento     VARCHAR(100),
    activo           TINYINT(1)   NOT NULL DEFAULT 1,
    notas            TEXT,
    codigo_proveedor VARCHAR(30)  UNIQUE,
    created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_nit    (nit),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3.2  proveedor_producto  (RF11 — lista de productos por prov.)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proveedor_producto (
    id_proveedor_producto INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    proveedor_id          INT UNSIGNED NOT NULL,
    producto_id           INT UNSIGNED NOT NULL,
    precio_unitario       DECIMAL(12,2),
    UNIQUE KEY uq_prov_prod (proveedor_id, producto_id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id_proveedor) ON DELETE CASCADE,
    FOREIGN KEY (producto_id)  REFERENCES productos(id_producto)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3.3  ordenes_compra  (RF12)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ordenes_compra (
    id_orden_compra        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    proveedor_id           INT UNSIGNED NOT NULL,
    usuario_id             INT UNSIGNED NOT NULL,
    numero_orden           VARCHAR(30)  NOT NULL UNIQUE,
    fecha_orden            DATE         NOT NULL,
    fecha_prevista_entrega DATE,
    fecha_entrega DATE,
    estado                 ENUM('Borrador','Enviada','Parcial','Completada','Cancelada') NOT NULL DEFAULT 'Borrador',
    notas                  TEXT,
    subtotal               DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    total_iva              DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    total                  DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    created_at             TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_estado    (estado),
    INDEX idx_proveedor (proveedor_id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id_proveedor),
    FOREIGN KEY (usuario_id)   REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3.4  items_orden_compra
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS items_orden_compra (
    id_item_orden_compra INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    orden_compra_id      INT UNSIGNED  NOT NULL,
    producto_id          INT UNSIGNED  NOT NULL,
    cantidad_pedida      INT UNSIGNED  NOT NULL,
    precio_unitario      DECIMAL(12,2) NOT NULL,
    cantidad_recibida    INT UNSIGNED  NOT NULL DEFAULT 0,
    descuento            DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
    codigo_unidad        VARCHAR(20),
    subtotal             DECIMAL(14,2) GENERATED ALWAYS AS
                           (cantidad_pedida * precio_unitario * (1 - descuento / 100)) STORED,
    notas                TEXT,
    FOREIGN KEY (orden_compra_id) REFERENCES ordenes_compra(id_orden_compra) ON DELETE CASCADE,
    FOREIGN KEY (producto_id)     REFERENCES productos(id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
