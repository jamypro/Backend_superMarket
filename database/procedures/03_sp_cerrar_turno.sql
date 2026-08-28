-- ============================================================
--  STORED PROCEDURE · Cierre de turno de caja  (RF15, HU-06)
-- ============================================================

DELIMITER $$

CREATE PROCEDURE sp_cerrar_turno(
    IN  p_turno_id    INT UNSIGNED,
    IN  p_monto_real  DECIMAL(12,2),
    OUT p_diferencia  DECIMAL(12,2),
    OUT p_error       VARCHAR(200)
)
sp_cerrar_turno: BEGIN
    DECLARE v_monto_aper   DECIMAL(12,2);
    DECLARE v_total_ventas DECIMAL(12,2);
    DECLARE v_esperado     DECIMAL(12,2);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_error = 'Error al cerrar el turno.';
    END;

    SET p_error = NULL;

    START TRANSACTION;

    SELECT monto_apertura INTO v_monto_aper
    FROM caja WHERE id_turno = p_turno_id FOR UPDATE;

    IF v_monto_aper IS NULL THEN
        SET p_error = 'Turno no encontrado.';
        ROLLBACK;
        LEAVE sp_cerrar_turno;
    END IF;

    -- Total efectivo esperado = apertura + ventas en efectivo
    SELECT COALESCE(SUM(pf.monto), 0) INTO v_total_ventas
    FROM pagos_facturas_ventas pf
    JOIN facturas_ventas fv ON fv.id_factura_venta = pf.factura_id
    JOIN metodos_pago mp    ON mp.id_metodo_pago   = pf.metodo_id
    WHERE fv.turno_id  = p_turno_id
      AND mp.nombre    = 'Efectivo';

    SET v_esperado   = v_monto_aper + v_total_ventas;
    SET p_diferencia = p_monto_real - v_esperado;

    UPDATE caja
    SET monto_esperado = v_esperado,
        monto_real     = p_monto_real,
        estado         = 'Cerrado',
        cierre_en      = NOW()
    WHERE id_turno = p_turno_id;

    COMMIT;
END$$

DELIMITER ;
