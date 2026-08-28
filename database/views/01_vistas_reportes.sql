-- ============================================================
--  VISTAS PARA REPORTES  (RF13, RF14, RF15, RF17, RF23, HU-03/04/05/07/08)
-- ============================================================

-- Vista: Ventas del día  (RF13, HU-04)
CREATE OR REPLACE VIEW v_ventas_dia AS
SELECT
    DATE(fv.created_at)            AS fecha,
    COUNT(fv.id_factura_venta)     AS total_facturas,
    SUM(fv.total)                  AS ingresos_dia,
    SUM(fv.descuento)              AS descuentos_dia,
    SUM(fv.impuesto)               AS impuestos_dia
FROM facturas_ventas fv
WHERE fv.estado = 'Pagada'
  AND DATE(fv.created_at) = CURDATE()
GROUP BY DATE(fv.created_at);

-- Vista: Ventas últimos 7 días  (RF13, HU-04)
CREATE OR REPLACE VIEW v_ventas_7dias AS
SELECT
    DATE(fv.created_at)            AS fecha,
    COUNT(fv.id_factura_venta)     AS facturas,
    SUM(fv.total)                  AS total_ventas
FROM facturas_ventas fv
WHERE fv.estado    = 'Pagada'
  AND fv.created_at >= NOW() - INTERVAL 7 DAY
GROUP BY DATE(fv.created_at)
ORDER BY fecha DESC;

-- Vista: Alertas de stock crítico  (RF04, HU-03)
CREATE OR REPLACE VIEW v_alertas_stock_critico AS
SELECT
    p.id_producto,
    p.codigo_barras,
    p.nombre                                  AS producto,
    p.caducidad,
    inv.stock_actual,
    inv.stock_minimo,
    inv.stock_actual - inv.stock_minimo        AS diferencia_stock,
    DATEDIFF(p.caducidad, CURDATE())           AS dias_para_vencer,
    CASE
        WHEN inv.stock_actual = 0                    THEN 'AGOTADO'
        WHEN inv.stock_actual <= inv.stock_minimo    THEN 'CRÍTICO'
        ELSE 'NORMAL'
    END                                        AS nivel_alerta,
    pr.nombre                                  AS proveedor
FROM inventario inv
JOIN productos p ON p.id_producto = inv.producto_id
LEFT JOIN proveedor_producto pp ON pp.producto_id  = inv.producto_id
LEFT JOIN proveedores pr        ON pr.id_proveedor = pp.proveedor_id
WHERE inv.stock_actual <= inv.stock_minimo
   OR (p.caducidad IS NOT NULL AND DATEDIFF(p.caducidad, CURDATE()) <= 7)
ORDER BY inv.stock_actual ASC, dias_para_vencer ASC;

-- Vista: Top 5 productos más vendidos del día  (RF13, HU-04)
CREATE OR REPLACE VIEW v_top_productos_dia AS
SELECT
    it.producto_id,
    p.nombre                                   AS producto,
    p.codigo_barras,
    SUM(it.cantidad)                           AS unidades_vendidas,
    SUM(it.total)                              AS ingreso_total
FROM items_factura it
JOIN facturas_ventas fv ON fv.id_factura_venta = it.factura_id
JOIN productos p         ON p.id_producto       = it.producto_id
WHERE fv.estado = 'Pagada'
  AND DATE(fv.created_at) = CURDATE()
GROUP BY it.producto_id, p.nombre, p.codigo_barras
ORDER BY unidades_vendidas DESC;

-- Vista: Historial de entregas de domiciliarios  (RF23, HU-08)
CREATE OR REPLACE VIEW v_historial_domiciliario AS
SELECT
    u.id_usuario                               AS domiciliario_id,
    CONCAT(u.nombre, ' ', u.apellido)          AS domiciliario,
    ad.estado,
    COUNT(ad.id_asignacion_domicilio)          AS total_pedidos,
    SUM(CASE WHEN ad.estado = 'Entregado'     THEN 1 ELSE 0 END) AS entregados,
    SUM(CASE WHEN ad.estado = 'No entregado'  THEN 1 ELSE 0 END) AS fallidos,
    ROUND(AVG(TIMESTAMPDIFF(MINUTE, ad.asignado_en, ad.entregado_en)), 1) AS tiempo_prom_min
FROM asignaciones_domiciliario ad
JOIN usuarios u        ON u.id_usuario        = ad.domiciliario_id
GROUP BY u.id_usuario, domiciliario, ad.estado;

-- Vista: Log de auditoría con contexto legible  (RF17, HU-07)
CREATE OR REPLACE VIEW v_auditoria_detalle AS
SELECT
    a.id_auditoria,
    a.created_at                               AS fecha_hora,
    CONCAT(u.nombre, ' ', u.apellido)          AS usuario,
    a.usuario_id,
    a.tabla_afectada,
    a.accion,
    a.registro_id,
    a.valores_anteriores,
    a.valores_nuevos,
    a.ip_origen
FROM auditoria a
LEFT JOIN usuarios u ON u.id_usuario = a.usuario_id
ORDER BY a.created_at DESC;

-- Vista: Descuadres de caja  (RF15, HU-06)
CREATE OR REPLACE VIEW v_descuadres_caja AS
SELECT
    c.id_turno,
    CONCAT(u.nombre, ' ', u.apellido)          AS cajero,
    c.monto_apertura,
    c.monto_esperado,
    c.monto_real,
    c.diferencia,
    c.estado,
    c.apertura_en,
    c.cierre_en
FROM caja c
JOIN usuarios u ON u.id_usuario = c.cajero_id
WHERE c.diferencia IS NOT NULL AND c.diferencia <> 0
ORDER BY ABS(c.diferencia) DESC;

-- Vista: Predicción de reabastecimiento con nombre de producto  (HU-05)
CREATE OR REPLACE VIEW v_prediccion_reabastecimiento AS
SELECT
    pr.id_prediccion,
    p.id_producto,
    p.codigo_barras,
    p.nombre                                   AS producto,
    pr.stock_actual,
    pr.promedio_venta_diaria_30d               AS consumo_diario_30d,
    pr.dias_stock_restante,
    pr.cantidad_sugerida,
    pr.es_urgente,
    pr.calculado_en,
    pv.nombre                                  AS proveedor
FROM prediccion_reabastecimiento pr
JOIN productos p               ON p.id_producto   = pr.producto_id
LEFT JOIN proveedor_producto pp ON pp.producto_id  = p.id_producto
LEFT JOIN proveedores pv        ON pv.id_proveedor = pp.proveedor_id
ORDER BY pr.es_urgente DESC, pr.dias_stock_restante ASC;
