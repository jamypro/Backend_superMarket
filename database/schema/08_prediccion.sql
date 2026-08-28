-- ============================================================
--  SECCIÓN 8 · PREDICCIÓN DE REABASTECIMIENTO  (HU-05)
-- ============================================================

CREATE TABLE IF NOT EXISTS prediccion_reabastecimiento (
    id_prediccion            INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    producto_id              INT UNSIGNED  NOT NULL UNIQUE,
    promedio_venta_diaria    DECIMAL(10,2) COMMENT 'Histórico completo',
    promedio_venta_diaria_30d DECIMAL(10,2),
    promedio_venta_diaria_60d DECIMAL(10,2),
    promedio_venta_diaria_90d DECIMAL(10,2),
    stock_actual             INT,
    dias_stock_restante      DECIMAL(8,1),
    cantidad_sugerida        INT,
    es_urgente               TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '1 si <7 días de stock — HU-05 CA4',
    calculado_en             TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_urgente (es_urgente),
    FOREIGN KEY (producto_id) REFERENCES productos(id_producto) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
