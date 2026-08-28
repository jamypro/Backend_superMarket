-- ============================================================
--  TRIGGERS · Auditoría de órdenes de compra  (RF17, HU-07)
-- ============================================================

DELIMITER $$

CREATE TRIGGER trg_audit_ordenes_insert
AFTER INSERT ON ordenes_compra
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (usuario_id, tabla_afectada, accion, registro_id,
                           valores_nuevos, ip_origen)
    VALUES (
        @current_user_id,
        'ordenes_compra', 'INSERT', CAST(NEW.id_orden_compra AS CHAR),
        JSON_OBJECT('numero_orden', NEW.numero_orden, 'proveedor_id', NEW.proveedor_id,
                    'total', NEW.total, 'estado', NEW.estado),
        @current_ip
    );
END$$

CREATE TRIGGER trg_audit_ordenes_update
AFTER UPDATE ON ordenes_compra
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (usuario_id, tabla_afectada, accion, registro_id,
                           valores_anteriores, valores_nuevos, ip_origen)
    VALUES (
        @current_user_id,
        'ordenes_compra', 'UPDATE', CAST(OLD.id_orden_compra AS CHAR),
        JSON_OBJECT('estado', OLD.estado, 'total', OLD.total),
        JSON_OBJECT('estado', NEW.estado, 'total', NEW.total),
        @current_ip
    );
END$$

DELIMITER ;
