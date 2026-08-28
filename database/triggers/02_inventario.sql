-- ============================================================
--  TRIGGERS · Auditoría de inventario  (RF17, HU-07)
-- ============================================================

DELIMITER $$

CREATE TRIGGER trg_audit_inventario_update
AFTER UPDATE ON inventario
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (usuario_id, tabla_afectada, accion, registro_id,
                           valores_anteriores, valores_nuevos, ip_origen)
    VALUES (
        @current_user_id,
        'inventario', 'UPDATE', CAST(OLD.id_inventario AS CHAR),
        JSON_OBJECT('stock_actual', OLD.stock_actual, 'stock_minimo', OLD.stock_minimo,
                    'stock_reservado', OLD.stock_reservado),
        JSON_OBJECT('stock_actual', NEW.stock_actual, 'stock_minimo', NEW.stock_minimo,
                    'stock_reservado', NEW.stock_reservado),
        @current_ip
    );
    -- Anomalía: ajuste manual de stock sin pasar por entrada_inventario (ANOM-005)
    IF NEW.stock_actual <> OLD.stock_actual
       AND @es_entrada_inventario IS NULL THEN
        INSERT INTO anomalias (tipo_anomalia_id, usuario_id, entidad_id, descripcion)
        VALUES (5, @current_user_id,
                CAST(OLD.id_inventario AS CHAR),
                CONCAT('Ajuste manual: stock_actual cambió de ', OLD.stock_actual,
                       ' a ', NEW.stock_actual, ' en producto_id=', NEW.producto_id));
    END IF;
END$$

DELIMITER ;
