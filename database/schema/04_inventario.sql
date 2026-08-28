-- ============================================================
--  SECCIÓN 4 · INVENTARIO  (monosucursal)
--  (inventario, entrada_inventario)
-- ============================================================

-- ------------------------------------------------------------
-- 4.1  inventario  (RF02, RF04, RF05, RF06, RF07)
--  · stock_reservado: reserva de 15 min por carritos e-commerce (7.4)
--  · SELECT FOR UPDATE sobre esta tabla en ventas POS (RF06)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventario (
    id_inventario   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    producto_id     INT UNSIGNED NOT NULL UNIQUE,
    stock_actual    INT          NOT NULL DEFAULT 0,
    stock_minimo    INT UNSIGNED NOT NULL DEFAULT 0,
    stock_reservado INT          NOT NULL DEFAULT 0 COMMENT 'Reservado por carritos online — 7.4',
    stock_maximo    INT UNSIGNED,
    expira_en       DATE         COMMENT 'Fecha de vencimiento del lote en bodega',
    actualizado_en  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_stock_actual (stock_actual),
    INDEX idx_stock_minimo (stock_minimo),
    FOREIGN KEY (producto_id) REFERENCES productos(id_producto) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4.2  entrada_inventario  (RF05)
--  Registra cada recepción de mercancía vinculada a proveedor
--  y/o orden de compra. El trigger actualiza inventario.stock_actual.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entrada_inventario (
    id_entrada_inventario    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    producto_id              INT UNSIGNED NOT NULL,
    orden_compra_id          INT UNSIGNED,
    numero_factura_proveedor VARCHAR(50),
    tipo_referencia          VARCHAR(50),
    cantidad                 INT          NOT NULL,
    notas                    TEXT,
    creado_por               INT UNSIGNED NOT NULL,
    created_at               TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_producto      (producto_id),
    FOREIGN KEY (producto_id)     REFERENCES productos(id_producto),
    FOREIGN KEY (creado_por)      REFERENCES usuarios(id_usuario),
    FOREIGN KEY (orden_compra_id) REFERENCES ordenes_compra(id_orden_compra) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
