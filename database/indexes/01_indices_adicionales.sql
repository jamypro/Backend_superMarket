-- ============================================================
--  ÍNDICES ADICIONALES DE RENDIMIENTO
--  RNF-R01 (POS <300ms) · RNF-R02 (dashboard <2s) · RNF-R03
-- ============================================================

-- Búsqueda POS por código de barras y nombre  (RNF-R01)
CREATE INDEX idx_prod_barras_nombre  ON productos        (codigo_barras, nombre, activo);

-- Dashboard: facturas por fecha y estado  (RNF-R02)
CREATE INDEX idx_fv_fecha_estado     ON facturas_ventas  (created_at, estado);

-- Reportes por rango de fechas  (RNF-R03)
CREATE INDEX idx_fv_fecha_total      ON facturas_ventas  (created_at, total);

-- Auditoría: filtros combinados  (HU-07)
CREATE INDEX idx_audit_multi         ON auditoria        (usuario_id, tabla_afectada, created_at);

-- Notificaciones no leídas por usuario
CREATE INDEX idx_notif_usr_leida     ON notificaciones   (usuario_id, leida, created_at);

-- Anomalías pendientes
CREATE INDEX idx_anom_pendiente      ON anomalias        (estado, created_at);

-- Pedidos online por estado
CREATE INDEX idx_pedido_estado       ON pedidos_online   (estado, created_at);

-- Carrito: limpiar reservas expiradas (node-cron)
CREATE INDEX idx_carrito_expira      ON item_carrito     (expira_en);

-- Inventario: detección rápida de stock crítico
CREATE INDEX idx_inv_stock           ON inventario       (stock_actual, stock_minimo);
