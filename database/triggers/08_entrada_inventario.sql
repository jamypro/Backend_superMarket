-- ============================================================
--  TRIGGER · Entrada de inventario  (RF05)
--  Actualiza stock al registrar una entrada. Activa
--  @es_entrada_inventario para que el trigger de inventario
--  NO genere anomalía ANOM-005.
-- ============================================================

DELIMITER $$

CREATE TRIGGER trg_entrada_actualiza_stock
AFTER INSERT ON entrada_inventario
FOR EACH ROW
BEGIN
    SET @es_entrada_inventario = 1;
    INSERT INTO inventario (producto_id, stock_actual)
    VALUES (NEW.producto_id, NEW.cantidad)
    ON DUPLICATE KEY UPDATE
        stock_actual = stock_actual + NEW.cantidad;
    SET @es_entrada_inventario = NULL;

    INSERT INTO auditoria (usuario_id, tabla_afectada, accion, registro_id,
                           valores_nuevos, ip_origen)
    VALUES (
        @current_user_id,
        'entrada_inventario', 'INSERT', CAST(NEW.id_entrada_inventario AS CHAR),
        JSON_OBJECT('producto_id', NEW.producto_id, 'cantidad', NEW.cantidad,
                    'orden_compra_id', NEW.orden_compra_id),
        @current_ip
    );
END$$

DELIMITER ;
