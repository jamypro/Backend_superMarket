-- ============================================================
--  TRIGGERS · Auditoría de productos  (RF17, HU-07)
--  La capa de aplicación debe establecer @current_user_id y
--  @current_ip antes de cada operación.
-- ============================================================

DELIMITER $$

CREATE TRIGGER trg_audit_productos_update
AFTER UPDATE ON productos
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (usuario_id, tabla_afectada, accion, registro_id,
                           valores_anteriores, valores_nuevos, ip_origen)
    VALUES (
        @current_user_id,
        'productos', 'UPDATE', CAST(OLD.id_producto AS CHAR),
        JSON_OBJECT(
            'nombre', OLD.nombre, 'precio_venta', OLD.precio_venta,
            'precio_minimo', OLD.precio_minimo, 'activo', OLD.activo,
            'precio_compra', OLD.precio_compra
        ),
        JSON_OBJECT(
            'nombre', NEW.nombre, 'precio_venta', NEW.precio_venta,
            'precio_minimo', NEW.precio_minimo, 'activo', NEW.activo,
            'precio_compra', NEW.precio_compra
        ),
        @current_ip
    );
    -- Anomalía: producto marcado como inactivo (ANOM-004)
    IF OLD.activo = 1 AND NEW.activo = 0 THEN
        INSERT INTO anomalias (tipo_anomalia_id, usuario_id, entidad_id, descripcion)
        VALUES (4, @current_user_id,
                CAST(OLD.id_producto AS CHAR),
                CONCAT('Producto "', OLD.nombre, '" marcado como inactivo.'));
    END IF;
END$$

CREATE TRIGGER trg_audit_productos_delete
AFTER DELETE ON productos
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (usuario_id, tabla_afectada, accion, registro_id,
                           valores_anteriores, ip_origen)
    VALUES (
        @current_user_id,
        'productos', 'DELETE', CAST(OLD.id_producto AS CHAR),
        JSON_OBJECT(
            'nombre', OLD.nombre, 'codigo_barras', OLD.codigo_barras,
            'precio_venta', OLD.precio_venta
        ),
        @current_ip
    );
    INSERT INTO anomalias (tipo_anomalia_id, usuario_id, entidad_id, descripcion)
    VALUES (4, @current_user_id,
            CAST(OLD.id_producto AS CHAR),
            CONCAT('Producto "', OLD.nombre, '" eliminado permanentemente.'));
END$$

DELIMITER ;
