-- ============================================================
--  SEEDS · Tipos de movimiento de caja
-- ============================================================

INSERT INTO tipo_movimientos (nombre, descripcion) VALUES
  ('Ingreso venta',   'Ingreso por factura de venta'),
  ('Egreso cambio',   'Egreso por devolución de cambio'),
  ('Ingreso manual',  'Ingreso manual autorizado por supervisor'),
  ('Egreso manual',   'Egreso manual autorizado por supervisor');
