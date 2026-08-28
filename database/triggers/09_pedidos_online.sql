-- ============================================================
--  TRIGGER · Historial de estados de pedidos online  (7.7)
-- ============================================================

DELIMITER $$

CREATE TRIGGER trg_pedido_online_estado_historial
AFTER UPDATE ON pedidos_online
FOR EACH ROW
BEGIN
    IF OLD.estado <> NEW.estado THEN
        INSERT INTO estados_pedidos_historial (pedido_id, estado, cambiado_por)
        VALUES (NEW.id_pedido_online, NEW.estado, @current_user_id);
    END IF;
END$$

DELIMITER ;
