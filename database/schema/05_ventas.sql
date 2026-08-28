-- ============================================================
--  SECCIÓN 5 · PUNTO DE VENTA (POS)
--  (metodos_pago, tipo_movimientos, caja, movimientos_turnos,
--   clientes, promociones, promociones_productos, facturas_ventas,
--   items_factura, pagos_facturas_ventas)
-- ============================================================

-- ------------------------------------------------------------
-- 5.1  metodos_pago
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS metodos_pago (
    id_metodo_pago INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(50)  NOT NULL,
    descripcion    TEXT,
    activo         TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5.2  tipo_movimientos  (movimientos de caja por turno)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tipo_movimientos (
    id_tipo_movimiento INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre             VARCHAR(50)  NOT NULL,
    descripcion        TEXT,
    activo             TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5.3  caja  (RF15, HU-06)
--  Apertura y cierre de turno por cajero.
--  diferencia = monto_real - monto_esperado (columna calculada).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS caja (
    id_turno       INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    cajero_id      INT UNSIGNED  NOT NULL,
    monto_apertura DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    monto_esperado DECIMAL(12,2) COMMENT 'Calculado al cierre',
    monto_real     DECIMAL(12,2) COMMENT 'Declarado por cajero al cerrar',
    diferencia     DECIMAL(12,2) GENERATED ALWAYS AS (monto_real - monto_esperado) STORED,
    estado         ENUM('Abierto','Cerrado') NOT NULL DEFAULT 'Abierto',
    apertura_en    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    cierre_en      TIMESTAMP     NULL,
    notas          TEXT,
    INDEX idx_cajero (cajero_id),
    INDEX idx_estado (estado),
    FOREIGN KEY (cajero_id) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5.4  movimientos_turnos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS movimientos_turnos (
    id_movimiento_turno INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    turno_id            INT UNSIGNED  NOT NULL,
    tipo_movimiento_id  INT UNSIGNED  NOT NULL,
    monto               DECIMAL(12,2) NOT NULL,
    referencia_id       INT UNSIGNED,
    notas               TEXT,
    created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (turno_id)           REFERENCES caja(id_turno)                          ON DELETE CASCADE,
    FOREIGN KEY (tipo_movimiento_id) REFERENCES tipo_movimientos(id_tipo_movimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5.5  clientes  (RF09, RF10)
--  Clientes presenciales Y e-commerce (contrasena nullable).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
    id_cliente     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    apellido       VARCHAR(100),
    tipo_documento ENUM('CC','NIT','CE','Pasaporte') NOT NULL DEFAULT 'CC',
    documento      VARCHAR(20),
    correo         VARCHAR(150) UNIQUE,
    telefono       VARCHAR(20),
    contrasena     VARCHAR(255) COMMENT 'bcrypt — solo clientes e-commerce',
    estado         TINYINT(1)   NOT NULL DEFAULT 1,
    registrado_por INT UNSIGNED COMMENT 'Cajero que lo registró presencialmente',
    ultimo_acceso  TIMESTAMP    NULL,
    created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    codigo_id      INT UNSIGNED,
    INDEX idx_documento (documento),
    INDEX idx_correo    (correo),
    FOREIGN KEY (registrado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    FOREIGN KEY (codigo_id)      REFERENCES codigos(id_codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5.6  promociones  (RF18)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS promociones (
    id_promocion INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    nombre       VARCHAR(150)  NOT NULL,
    descripcion  TEXT,
    tipo         ENUM('porcentaje','valor_fijo','2x1') NOT NULL DEFAULT 'porcentaje',
    valor        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    fecha_inicio DATE          NOT NULL,
    fecha_fin    DATE          NOT NULL,
    activo       TINYINT(1)    NOT NULL DEFAULT 1,
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fechas (fecha_inicio, fecha_fin),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS promociones_productos (
    id_promocion_producto INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    producto_id           INT UNSIGNED NOT NULL,
    id_promocion          INT UNSIGNED NOT NULL,
    UNIQUE KEY uq_prod_prom (producto_id, id_promocion),
    FOREIGN KEY (producto_id)  REFERENCES productos(id_producto)    ON DELETE CASCADE,
    FOREIGN KEY (id_promocion) REFERENCES promociones(id_promocion) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5.7  facturas_ventas  (RF07, RF08, HU-02)
--  numero_factura: FAC-XXXXXXXX generado por SP.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS facturas_ventas (
    id_factura_venta INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    numero_factura   VARCHAR(20)   NOT NULL UNIQUE COMMENT 'FAC-XXXXXXXX',
    cajero_id        INT UNSIGNED  NOT NULL,
    cliente_id       INT UNSIGNED,
    turno_id         INT UNSIGNED,
    subtotal         DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    descuento        DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    impuesto         DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    total            DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    estado           ENUM('Pendiente','Pagada','Anulada') NOT NULL DEFAULT 'Pendiente',
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cajero  (cajero_id),
    INDEX idx_cliente (cliente_id),
    INDEX idx_fecha   (created_at),
    INDEX idx_estado  (estado),
    FOREIGN KEY (cajero_id)  REFERENCES usuarios(id_usuario),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id_cliente)  ON DELETE SET NULL,
    FOREIGN KEY (turno_id)   REFERENCES caja(id_turno)        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5.8  items_factura  (RF07, RF08, RF16)
--  precio_minimo guardado como snapshot para validar anomalía.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS items_factura (
    id_item_factura INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    factura_id      INT UNSIGNED  NOT NULL,
    producto_id     INT UNSIGNED  NOT NULL,
    cantidad        INT UNSIGNED  NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    precio_minimo   DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Snapshot al momento de vender',
    total_impuesto  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_descuento DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    promocion_id    INT UNSIGNED,
    total           DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (factura_id)   REFERENCES facturas_ventas(id_factura_venta) ON DELETE CASCADE,
    FOREIGN KEY (producto_id)  REFERENCES productos(id_producto),
    FOREIGN KEY (promocion_id) REFERENCES promociones(id_promocion)         ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5.9  pagos_facturas_ventas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos_facturas_ventas (
    id_pago_factura_venta  INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    factura_id             INT UNSIGNED  NOT NULL,
    metodo_id              INT UNSIGNED  NOT NULL,
    monto                  DECIMAL(12,2) NOT NULL,
    referencia_transaccion VARCHAR(100),
    creado_en              TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (factura_id) REFERENCES facturas_ventas(id_factura_venta) ON DELETE CASCADE,
    FOREIGN KEY (metodo_id)  REFERENCES metodos_pago(id_metodo_pago)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
