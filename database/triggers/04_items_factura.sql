-- ============================================================
--  TRIGGER · Detección de venta bajo precio mínimo  (RF16)
--  Detecta venta por debajo del precio mínimo (ANOM-002)
-- ============================================================

DELIMITER $$

CREATE TRIGGER trg_anomalia_precio_minimo
AFTER INSERT ON items_factura
FOR EACH ROW
BEGIN
    IF NEW.precio_unitario < NEW.precio_minimo THEN
        INSERT INTO anomalias (tipo_anomalia_id, usuario_id, entidad_id, descripcion)
        SELECT 2, f.cajero_id,
               CAST(NEW.id_item_factura AS CHAR),
               CONCAT('Producto_id=', NEW.producto_id,
                      ' vendido a $', NEW.precio_unitario,
                      ' < precio_minimo $', NEW.precio_minimo)
        FROM facturas_ventas f
        WHERE f.id_factura_venta = NEW.factura_id;
    END IF;
END$$

DELIMITER ;
