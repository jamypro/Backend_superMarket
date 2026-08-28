-- ============================================================
--  STORED PROCEDURES · Números correlativos
--  sp_siguiente_numero_factura / sp_siguiente_numero_orden /
--  sp_siguiente_numero_pedido
-- ============================================================

DELIMITER $$

-- ─────────────────────────────────────────────
-- SP: Generar número de factura correlativo
-- Formato: FAC-XXXXXXXX  (RF08, HU-02)
-- ─────────────────────────────────────────────
CREATE PROCEDURE sp_siguiente_numero_factura(OUT p_numero VARCHAR(20))
BEGIN
    DECLARE v_ultimo INT DEFAULT 0;
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_factura, 5) AS UNSIGNED)), 0)
    INTO v_ultimo
    FROM facturas_ventas;
    SET p_numero = CONCAT('FAC-', LPAD(v_ultimo + 1, 8, '0'));
END$$

-- ─────────────────────────────────────────────
-- SP: Generar número de orden de compra
-- Formato: OC-XXXXXXXX  (RF12)
-- ─────────────────────────────────────────────
CREATE PROCEDURE sp_siguiente_numero_orden(OUT p_numero VARCHAR(30))
BEGIN
    DECLARE v_ultimo INT DEFAULT 0;
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_orden, 4) AS UNSIGNED)), 0)
    INTO v_ultimo
    FROM ordenes_compra;
    SET p_numero = CONCAT('OC-', LPAD(v_ultimo + 1, 8, '0'));
END$$

-- ─────────────────────────────────────────────
-- SP: Generar número de pedido online
-- Formato: PED-XXXXXXXX  (OE08)
-- ─────────────────────────────────────────────
CREATE PROCEDURE sp_siguiente_numero_pedido(OUT p_numero VARCHAR(30))
BEGIN
    DECLARE v_ultimo INT DEFAULT 0;
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_pedido, 5) AS UNSIGNED)), 0)
    INTO v_ultimo
    FROM pedidos_online;
    SET p_numero = CONCAT('PED-', LPAD(v_ultimo + 1, 8, '0'));
END$$

DELIMITER ;
