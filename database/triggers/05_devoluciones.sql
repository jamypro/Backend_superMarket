-- ============================================================
--  TRIGGERS · Devoluciones  (RF14, RF17, HU-07)
--  Auditoría + detección de devoluciones excesivas (ANOM-001)
-- ============================================================

DELIMITER $$

CREATE TRIGGER trg_audit_devoluciones_insert
AFTER INSERT ON devoluciones
FOR EACH ROW
BEGIN
    DECLARE v_count    INT;
    DECLARE v_umbral   INT DEFAULT 3;
    DECLARE v_turno_id INT;

    INSERT INTO auditoria (usuario_id, tabla_afectada, accion, registro_id,
                           valores_nuevos, ip_origen)
    VALUES (
        @current_user_id,
        'devoluciones', 'INSERT', CAST(NEW.id_devolucion AS CHAR),
        JSON_OBJECT('factura_id', NEW.factura_id, 'cajero_id', NEW.cajero_id,
                    'motivo', NEW.motivo),
        @current_ip
    );

    -- Obtener umbral configurado
    SELECT CAST(valor AS UNSIGNED) INTO v_umbral
    FROM configuracion_sistema
    WHERE clave = 'umbral_devoluciones_anomalia'
    LIMIT 1;

    -- Turno activo del cajero
    SELECT id_turno INTO v_turno_id
    FROM caja
    WHERE cajero_id = NEW.cajero_id
      AND estado = 'Abierto'
    LIMIT 1;

    IF v_turno_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_count
        FROM devoluciones d
        JOIN facturas_ventas f ON f.id_factura_venta = d.factura_id
        WHERE d.cajero_id = NEW.cajero_id
          AND f.turno_id  = v_turno_id;

        IF v_count >= v_umbral THEN
            INSERT INTO anomalias (tipo_anomalia_id, usuario_id, entidad_id, descripcion)
            VALUES (1, NEW.cajero_id,
                    CAST(NEW.cajero_id AS CHAR),
                    CONCAT('Cajero_id=', NEW.cajero_id,
                           ' acumula ', v_count, ' devoluciones en turno_id=', v_turno_id));
        END IF;
    END IF;
END$$

CREATE TRIGGER trg_audit_devoluciones_update
AFTER UPDATE ON devoluciones
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (usuario_id, tabla_afectada, accion, registro_id,
                           valores_anteriores, valores_nuevos, ip_origen)
    VALUES (
        @current_user_id,
        'devoluciones', 'UPDATE', CAST(OLD.id_devolucion AS CHAR),
        JSON_OBJECT('estado_id', OLD.estado_id),
        JSON_OBJECT('estado_id', NEW.estado_id, 'supervisor_id', NEW.supervisor_id),
        @current_ip
    );
END$$

DELIMITER ;
