-- ============================================================
--  SEEDS · Tipos de anomalías  (RF16)
-- ============================================================

INSERT INTO tipo_anomalias (codigo, nombre, descripcion) VALUES
  ('ANOM-001','Devoluciones excesivas',   'Cajero supera el umbral de devoluciones por turno'),
  ('ANOM-002','Venta bajo precio mínimo', 'Precio de venta menor al precio_minimo del producto'),
  ('ANOM-003','Descuento excesivo',       'Descuento manual supera el límite autorizado por rol'),
  ('ANOM-004','Eliminación de producto',  'Producto marcado como inactivo o eliminado'),
  ('ANOM-005','Ajuste manual de stock',   'Stock modificado directamente sin entrada de inventario'),
  ('ANOM-006','Anulación de factura',     'Factura anulada fuera del turno o por usuario no autorizado');
