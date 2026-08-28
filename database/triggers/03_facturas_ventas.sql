-- ============================================================
--  TRIGGERS · Auditoría de facturas de venta  (RF17, HU-07)
-- ============================================================

DELIMITER $$

CREATE TRIGGER trg_audit_facturas_insert
AFTER INSERT ON facturas_ventas
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (usuario_id, tabla_afectada, accion, registro_id,
                           valores_nuevos, ip_origen)
    VALUES (
        @current_user_id,
        'facturas_ventas', 'INSERT', CAST(NEW.id_factura_venta AS CHAR),
        JSON_OBJECT('numero_factura', NEW.numero_factura, 'total', NEW.total,
                    'cajero_id', NEW.cajero_id, 'cliente_id', NEW.cliente_id),
        @current_ip
    );
END$$

CREATE TRIGGER trg_audit_facturas_update
AFTER UPDATE ON facturas_ventas
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (usuario_id, tabla_afectada, accion, registro_id,
                           valores_anteriores, valores_nuevos, ip_origen)
    VALUES (
        @current_user_id,
        'facturas_ventas', 'UPDATE', CAST(OLD.id_factura_venta AS CHAR),
        JSON_OBJECT('estado', OLD.estado, 'total', OLD.total),
        JSON_OBJECT('estado', NEW.estado, 'total', NEW.total),
        @current_ip
    );
    -- Anomalía: anulación de factura (ANOM-006)
    IF OLD.estado <> 'Anulada' AND NEW.estado = 'Anulada' THEN
        INSERT INTO anomalias (tipo_anomalia_id, usuario_id, entidad_id, descripcion)
        VALUES (6, @current_user_id,
                CAST(OLD.id_factura_venta AS CHAR),
                CONCAT('Factura "', OLD.numero_factura, '" anulada.'));
    END IF;
END$$

DELIMITER ;
