-- ============================================================
--  SECCIÓN 9 · E-COMMERCE  (OE08, Módulo 7)
--  (clientes_direcciones, carrito, item_carrito, pedidos_online,
--   detalle_pedidos_online, pagos_online, asignaciones_domiciliario,
--   estados_pedidos_historial, resenas, resenas_respuestas)
-- ============================================================

-- ------------------------------------------------------------
-- 9.1  clientes_direcciones  (7.2 — perfil con múlt. direcc.)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes_direcciones (
    id_cliente_direccion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cliente_id           INT UNSIGNED NOT NULL,
    alias                VARCHAR(50),
    direccion            VARCHAR(200) NOT NULL,
    ciudad               VARCHAR(100) NOT NULL,
    barrio               VARCHAR(100) NOT NULL,
    departamento         VARCHAR(100),
    referencia           TEXT,
    latitud              DECIMAL(10,7),
    longitud             DECIMAL(10,7),
    es_principal         TINYINT(1)   NOT NULL DEFAULT 0,
    created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    activo           TINYINT(1)   NOT NULL DEFAULT 1,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id_cliente) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9.2  carrito  (7.4 — reserva 15 min, node-cron libera)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS carrito (
    id_carrito INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT UNSIGNED NOT NULL UNIQUE,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id_cliente) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS item_carrito (
    id_item_carrito INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    carrito_id      INT UNSIGNED  NOT NULL,
    producto_id     INT UNSIGNED  NOT NULL,
    cantidad        INT UNSIGNED  NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(12,2) NOT NULL,
    agregado_en     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    expira_en       TIMESTAMP     NOT NULL COMMENT 'Reserva de 15 min — 7.4',
    UNIQUE KEY uq_carrito_prod (carrito_id, producto_id),
    INDEX idx_expira (expira_en),
    FOREIGN KEY (carrito_id)  REFERENCES carrito(id_carrito)    ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9.3  pedidos_online  (RF20, 7.5, OE08)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pedidos_online (
    id_pedido_online     INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    numero_pedido        VARCHAR(30)   NOT NULL UNIQUE,
    cliente_id           INT UNSIGNED  NOT NULL,
    modalidad            ENUM('domicilio','click_collect') NOT NULL DEFAULT 'domicilio',
    direccion_entrega_id INT UNSIGNED,
    estado               ENUM(
      'Pago confirmado','En preparación','Asignado a domiciliario',
      'Despachado','Listo para recoger','Entregado','Cancelado'
    ) NOT NULL DEFAULT 'Pago confirmado',
    subtotal             DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    descuento            DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    costo_envio          DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total                DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    notas                TEXT,
    fecha_recogida       DATE          COMMENT 'Para modalidad click_collect',
    franja_horaria       VARCHAR(50)   COMMENT 'Para modalidad click_collect',
    created_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cliente (cliente_id),
    INDEX idx_estado  (estado),
    INDEX idx_fecha   (created_at),
    FOREIGN KEY (cliente_id)           REFERENCES clientes(id_cliente)                      ON DELETE RESTRICT,
    FOREIGN KEY (direccion_entrega_id) REFERENCES clientes_direcciones(id_cliente_direccion) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9.4  detalle_pedidos_online
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS detalle_pedidos_online (
    id_detalle_pedido INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    pedido_id         INT UNSIGNED  NOT NULL,
    producto_id       INT UNSIGNED  NOT NULL,
    cantidad          INT UNSIGNED  NOT NULL,
    precio_unitario   DECIMAL(12,2) NOT NULL,
    descuento         DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    subtotal          DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (pedido_id)   REFERENCES pedidos_online(id_pedido_online) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9.5  pagos_online  (Wompi — 7.6)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos_online (
    id_pago_online   INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    pedido_id        INT UNSIGNED  NOT NULL,
    metodo           ENUM('tarjeta','PSE','Nequi','Daviplata') NOT NULL,
    monto            DECIMAL(14,2) NOT NULL,
    wompi_referencia VARCHAR(100)  UNIQUE,
    wompi_estado     VARCHAR(50),
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos_online(id_pedido_online) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9.6  asignaciones_domiciliario  (RF20, RF21, RF22, HU-08)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS asignaciones_domiciliario (
    id_asignacion_domicilio INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pedido_id               INT UNSIGNED NOT NULL UNIQUE,
    domiciliario_id         INT UNSIGNED NOT NULL,
    asignado_por            INT UNSIGNED NOT NULL,
    asignado_en             TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    en_camino_en            TIMESTAMP    NULL,
    entregado_en            TIMESTAMP    NULL,
    estado                  ENUM('Asignado','En camino','Entregado','No entregado')
                            NOT NULL DEFAULT 'Asignado',
    codigo_confirmacion     CHAR(4)      COMMENT 'Código 4 dígitos del cliente — HU-08 CA4',
    motivo_no_entrega       TEXT,
    intentos_confirmacion   TINYINT UNSIGNED NOT NULL DEFAULT 0,
    confirmado_en           TIMESTAMP    NULL,
    INDEX idx_domiciliario (domiciliario_id),
    INDEX idx_estado       (estado),
    FOREIGN KEY (pedido_id)       REFERENCES pedidos_online(id_pedido_online) ON DELETE CASCADE,
    FOREIGN KEY (domiciliario_id) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (asignado_por)    REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9.7  estados_pedidos_historial  (7.7 — trazabilidad completa)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS estados_pedidos_historial (
    id_historial  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pedido_id     INT UNSIGNED NOT NULL,
    estado        VARCHAR(60)  NOT NULL,
    cambiado_por  INT UNSIGNED,
    observaciones TEXT,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pedido (pedido_id),
    FOREIGN KEY (pedido_id)    REFERENCES pedidos_online(id_pedido_online) ON DELETE CASCADE,
    FOREIGN KEY (cambiado_por) REFERENCES usuarios(id_usuario)             ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9.8  resenas y respuestas  (7.8)
--  Solo clientes que hayan comprado pueden dejar reseña.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resenas (
    id_resena    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    producto_id  INT UNSIGNED NOT NULL,
    cliente_id   INT UNSIGNED NOT NULL,
    pedido_id    INT UNSIGNED NOT NULL,
    calificacion TINYINT UNSIGNED NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario   TEXT,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_prod_cliente_pedido (producto_id, cliente_id, pedido_id),
    INDEX idx_producto (producto_id),
    FOREIGN KEY (producto_id) REFERENCES productos(id_producto)          ON DELETE CASCADE,
    FOREIGN KEY (cliente_id)  REFERENCES clientes(id_cliente)            ON DELETE CASCADE,
    FOREIGN KEY (pedido_id)   REFERENCES pedidos_online(id_pedido_online) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS resenas_respuestas (
    id_resena_respuesta INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resena_id           INT UNSIGNED NOT NULL,
    usuario_id          INT UNSIGNED NOT NULL,
    respuesta           TEXT         NOT NULL,
    created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (resena_id)  REFERENCES resenas(id_resena)    ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
