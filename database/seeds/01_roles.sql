-- ============================================================
--  SEEDS · Roles del sistema  (RF02)
--  5 roles fijos: Administrador, Supervisor, Cajero,
--  Domiciliario, Auditor
-- ============================================================

INSERT INTO roles (nombre, descripcion) VALUES
  ('Administrador', 'Acceso completo al sistema: inventario, ventas, reportes, usuarios y configuración global.'),
  ('Supervisor',    'Reportes de turno, aprobación de devoluciones, caja y alertas de stock.'),
  ('Cajero',        'Módulo POS, consulta de productos, apertura y cierre de caja.'),
  ('Domiciliario',  'Ver pedidos asignados, actualizar estado de entrega y confirmar recepción.'),
  ('Auditor',       'Lectura de reportes financieros y log de auditoría. Sin modificaciones.');
