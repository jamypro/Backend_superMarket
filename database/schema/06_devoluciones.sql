-- ============================================================
--  SECCIÓN 6 · DEVOLUCIONES  (RF14, HU-07)
--  (estados_devoluciones, devoluciones, items_devolucion)
-- ============================================================

CREATE TABLE IF NOT EXISTS estados_devoluciones (
    id_estado_devolucion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre               VARCHAR(50)  NOT NULL,
    descripcion          TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS devoluciones (
    id_devolucion   INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    factura_id      INT UNSIGNED  NOT NULL,
    usuario_id      INT UNSIGNED  NOT NULL,
    cajero_id       INT UNSIGNED,
    supervisor_id   INT UNSIGNED,
    estado_id       INT UNSIGNED  NOT NULL DEFAULT 1,
    turno_id INT UNSIGNED NOT NULL,
    motivo          TEXT          NOT NULL,
    reembolso_total DECIMAL(12,2) NOT NULL,
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    resuelta_en     DATETIME,
    INDEX idx_cajero  (cajero_id),
    FOREIGN KEY (factura_id)    REFERENCES facturas_ventas(id_factura_venta),
    FOREIGN KEY (usuario_id)    REFERENCES usuarios(id_usuario),
    FOREIGN KEY (cajero_id)     REFERENCES usuarios(id_usuario),
    FOREIGN KEY (supervisor_id) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (turno_id) REFERENCES caja(id_turno),
    FOREIGN KEY (estado_id)     REFERENCES estados_devoluciones(id_estado_devolucion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS items_devolucion (
    id_item_devolucion INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    devolucion_id      INT UNSIGNED  NOT NULL,
    producto_id        INT UNSIGNED  NOT NULL,
    item_factura_id    INT UNSIGNED,
    tipo               ENUM('reembolso','cambio') NOT NULL DEFAULT 'reembolso',
    cantidad           INT UNSIGNED  NOT NULL,
    monto_devolucion   DECIMAL(12,2) NOT NULL,
    notas              TEXT,
    FOREIGN KEY (devolucion_id)   REFERENCES devoluciones(id_devolucion)        ON DELETE CASCADE,
    FOREIGN KEY (producto_id)     REFERENCES productos(id_producto),
    FOREIGN KEY (item_factura_id) REFERENCES items_factura(id_item_factura)     ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
