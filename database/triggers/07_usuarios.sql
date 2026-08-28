-- ============================================================
--  TRIGGER · Auditoría de usuarios  (RF17, HU-07)
-- ============================================================

DELIMITER $$

CREATE TRIGGER trg_audit_usuarios_update
AFTER UPDATE ON usuarios
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (usuario_id, tabla_afectada, accion, registro_id,
                           valores_anteriores, valores_nuevos, ip_origen)
    VALUES (
        @current_user_id,
        'usuarios', 'UPDATE', CAST(OLD.id_usuario AS CHAR),
        JSON_OBJECT('estado', OLD.estado, 'bloqueado', OLD.bloqueado),
        JSON_OBJECT('estado', NEW.estado, 'bloqueado', NEW.bloqueado,
                    'intentos_fallidos', NEW.intentos_fallidos),
        @current_ip
    );
END$$

DELIMITER ;
