-- ============================================================
--  STORED PROCEDURE · Calcular predicción de reabastecimiento
--  (HU-05, OE completo de predicción)
-- ============================================================

DELIMITER $$

CREATE PROCEDURE sp_calcular_prediccion()
BEGIN
    DECLARE v_dias_urgente INT DEFAULT 7;

    SELECT CAST(valor AS UNSIGNED) INTO v_dias_urgente
    FROM configuracion_sistema
    WHERE clave = 'dias_stock_urgente' LIMIT 1;

    INSERT INTO prediccion_reabastecimiento
        (producto_id,
         promedio_venta_diaria_30d,
         promedio_venta_diaria_60d,
         promedio_venta_diaria_90d,
         promedio_venta_diaria,
         stock_actual,
         dias_stock_restante,
         cantidad_sugerida,
         es_urgente)
    SELECT
        inv.producto_id,
        /* Promedio 30 días */
        (SELECT COALESCE(SUM(it.cantidad), 0) / 30
         FROM items_factura it
         JOIN facturas_ventas fv ON fv.id_factura_venta = it.factura_id
         WHERE it.producto_id   = inv.producto_id
           AND fv.created_at   >= NOW() - INTERVAL 30 DAY
           AND fv.estado        = 'Pagada') AS avg30,
        /* Promedio 60 días */
        (SELECT COALESCE(SUM(it.cantidad), 0) / 60
         FROM items_factura it
         JOIN facturas_ventas fv ON fv.id_factura_venta = it.factura_id
         WHERE it.producto_id   = inv.producto_id
           AND fv.created_at   >= NOW() - INTERVAL 60 DAY
           AND fv.estado        = 'Pagada') AS avg60,
        /* Promedio 90 días */
        (SELECT COALESCE(SUM(it.cantidad), 0) / 90
         FROM items_factura it
         JOIN facturas_ventas fv ON fv.id_factura_venta = it.factura_id
         WHERE it.producto_id   = inv.producto_id
           AND fv.created_at   >= NOW() - INTERVAL 90 DAY
           AND fv.estado        = 'Pagada') AS avg90,
        /* Promedio global */
        (SELECT COALESCE(SUM(it.cantidad), 0) /
                GREATEST(DATEDIFF(NOW(), MIN(fv.created_at)), 1)
         FROM items_factura it
         JOIN facturas_ventas fv ON fv.id_factura_venta = it.factura_id
         WHERE it.producto_id   = inv.producto_id
           AND fv.estado        = 'Pagada') AS avg_total,
        inv.stock_actual,
        /* Días de stock restante */
        CASE
            WHEN (SELECT COALESCE(SUM(it.cantidad), 0) / 30
                  FROM items_factura it
                  JOIN facturas_ventas fv ON fv.id_factura_venta = it.factura_id
                  WHERE it.producto_id = inv.producto_id
                    AND fv.created_at >= NOW() - INTERVAL 30 DAY
                    AND fv.estado      = 'Pagada') > 0
            THEN inv.stock_actual /
                 (SELECT COALESCE(SUM(it.cantidad), 0) / 30
                  FROM items_factura it
                  JOIN facturas_ventas fv ON fv.id_factura_venta = it.factura_id
                  WHERE it.producto_id = inv.producto_id
                    AND fv.created_at >= NOW() - INTERVAL 30 DAY
                    AND fv.estado      = 'Pagada')
            ELSE 9999
        END AS dias_restantes,
        /* Cantidad sugerida: demanda 30 d + stock_minimo - stock_actual */
        GREATEST(
            CAST(ROUND(
                (SELECT COALESCE(SUM(it.cantidad), 0) / 30
                 FROM items_factura it
                 JOIN facturas_ventas fv ON fv.id_factura_venta = it.factura_id
                 WHERE it.producto_id = inv.producto_id
                   AND fv.created_at >= NOW() - INTERVAL 30 DAY
                   AND fv.estado      = 'Pagada') * 30
                + inv.stock_minimo - inv.stock_actual
            ) AS SIGNED), 0),
        /* Es urgente */
        IF(inv.stock_actual / GREATEST(
            (SELECT COALESCE(SUM(it.cantidad), 0) / 30
             FROM items_factura it
             JOIN facturas_ventas fv ON fv.id_factura_venta = it.factura_id
             WHERE it.producto_id = inv.producto_id
               AND fv.created_at >= NOW() - INTERVAL 30 DAY
               AND fv.estado      = 'Pagada'), 0.0001) < v_dias_urgente, 1, 0)
    FROM inventario inv
    ON DUPLICATE KEY UPDATE
        promedio_venta_diaria_30d = VALUES(promedio_venta_diaria_30d),
        promedio_venta_diaria_60d = VALUES(promedio_venta_diaria_60d),
        promedio_venta_diaria_90d = VALUES(promedio_venta_diaria_90d),
        promedio_venta_diaria     = VALUES(promedio_venta_diaria),
        stock_actual              = VALUES(stock_actual),
        dias_stock_restante       = VALUES(dias_stock_restante),
        cantidad_sugerida         = VALUES(cantidad_sugerida),
        es_urgente                = VALUES(es_urgente),
        calculado_en              = NOW();
END$$

DELIMITER ;
