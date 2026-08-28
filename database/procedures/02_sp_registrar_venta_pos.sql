-- ============================================================
--  STORED PROCEDURE · Registrar venta POS  (RF06, RF07, HU-02)
--  Transacción ACID con SELECT FOR UPDATE para prevenir
--  condiciones de carrera en el stock.
-- ============================================================

DELIMITER $$

CREATE PROCEDURE sp_registrar_venta_pos(
    IN  p_cajero_id      INT UNSIGNED,
    IN  p_cliente_id     INT UNSIGNED,
    IN  p_turno_id       INT UNSIGNED,
    IN  p_metodo_pago_id INT UNSIGNED,
    IN  p_items          JSON,       -- [{producto_id, cantidad, precio_unitario, descuento, impuesto, promocion_id}]
    OUT p_factura_id     INT UNSIGNED,
    OUT p_numero_fac     VARCHAR(20),
    OUT p_error          VARCHAR(200)
)
sp_registrar_venta_pos: BEGIN
    DECLARE v_i          INT DEFAULT 0;
    DECLARE v_len        INT;
    DECLARE v_prod_id    INT;
    DECLARE v_cant       INT;
    DECLARE v_precio     DECIMAL(12,2);
    DECLARE v_descuento  DECIMAL(12,2);
    DECLARE v_impuesto   DECIMAL(12,2);
    DECLARE v_prom_id    INT;
    DECLARE v_stock      INT;
    DECLARE v_precio_min DECIMAL(12,2);
    DECLARE v_subtotal   DECIMAL(14,2) DEFAULT 0;
    DECLARE v_total_desc DECIMAL(14,2) DEFAULT 0;
    DECLARE v_total_imp  DECIMAL(14,2) DEFAULT 0;
    DECLARE v_total      DECIMAL(14,2) DEFAULT 0;
    DECLARE v_item_total DECIMAL(12,2);
    DECLARE v_numero_fac VARCHAR(20);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_error = 'Error interno en la transacción de venta.';
    END;

    SET p_error = NULL;
    SET v_len   = JSON_LENGTH(p_items);

    START TRANSACTION;

    -- 1. Validar stock con SELECT FOR UPDATE (RF06)
    SET v_i = 0;
    WHILE v_i < v_len DO
        SET v_prod_id = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_i, '].producto_id')));
        SET v_cant    = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_i, '].cantidad')));

        SELECT stock_actual INTO v_stock
        FROM inventario
        WHERE producto_id = v_prod_id
        FOR UPDATE;

        IF v_stock IS NULL OR v_stock < v_cant THEN
            SET p_error = CONCAT('Stock insuficiente para producto_id=', v_prod_id,
                                 '. Disponible: ', COALESCE(v_stock, 0));
            ROLLBACK;
            LEAVE sp_registrar_venta_pos;
        END IF;

        SET v_i = v_i + 1;
    END WHILE;

    -- 2. Generar número de factura
    CALL sp_siguiente_numero_factura(v_numero_fac);
    SET p_numero_fac = v_numero_fac;

    -- 3. Calcular totales
    SET v_i = 0;
    WHILE v_i < v_len DO
        SET v_precio    = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_i, '].precio_unitario')));
        SET v_cant      = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_i, '].cantidad')));
        SET v_descuento = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_i, '].descuento'))), 0);
        SET v_impuesto  = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_i, '].impuesto'))), 0);
        SET v_item_total = (v_precio * v_cant) - v_descuento + v_impuesto;
        SET v_subtotal   = v_subtotal   + (v_precio * v_cant);
        SET v_total_desc = v_total_desc + v_descuento;
        SET v_total_imp  = v_total_imp  + v_impuesto;
        SET v_total      = v_total      + v_item_total;
        SET v_i = v_i + 1;
    END WHILE;

    -- 4. Insertar factura
    INSERT INTO facturas_ventas
        (numero_factura, cajero_id, cliente_id, turno_id,
         subtotal, descuento, impuesto, total, estado)
    VALUES
        (v_numero_fac, p_cajero_id, p_cliente_id, p_turno_id,
         v_subtotal, v_total_desc, v_total_imp, v_total, 'Pagada');

    SET p_factura_id = LAST_INSERT_ID();

    -- 5. Insertar items y descontar stock
    SET v_i = 0;
    WHILE v_i < v_len DO
        SET v_prod_id   = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_i, '].producto_id')));
        SET v_cant      = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_i, '].cantidad')));
        SET v_precio    = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_i, '].precio_unitario')));
        SET v_descuento = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_i, '].descuento'))), 0);
        SET v_impuesto  = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_i, '].impuesto'))), 0);
        SET v_prom_id   = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_i, '].promocion_id')));

        SELECT precio_minimo INTO v_precio_min FROM productos WHERE id_producto = v_prod_id;

        SET v_item_total = (v_precio * v_cant) - v_descuento + v_impuesto;

        INSERT INTO items_factura
            (factura_id, producto_id, cantidad, precio_unitario, precio_minimo,
             total_impuesto, total_descuento, total, promocion_id)
        VALUES
            (p_factura_id, v_prod_id, v_cant, v_precio, v_precio_min,
             v_impuesto, v_descuento, v_item_total, v_prom_id);

        -- Descontar stock (RF06)
        UPDATE inventario
        SET stock_actual = stock_actual - v_cant
        WHERE producto_id = v_prod_id;

        SET v_i = v_i + 1;
    END WHILE;

    -- 6. Registrar pago
    INSERT INTO pagos_facturas_ventas (factura_id, metodo_id, monto)
    VALUES (p_factura_id, p_metodo_pago_id, v_total);

    -- 7. Registrar movimiento en turno
    IF p_turno_id IS NOT NULL THEN
        INSERT INTO movimientos_turnos (turno_id, tipo_movimiento_id, monto, referencia_id)
        VALUES (p_turno_id, 1, v_total, p_factura_id);
    END IF;

    COMMIT;
END$$

DELIMITER ;
