-- ============================================================
--  SEEDS · Configuración del sistema
--  (parámetros globales requeridos para arrancar el sistema)
-- ============================================================

INSERT INTO configuracion_sistema (clave, valor, descripcion) VALUES
  -- Datos del negocio (reemplazan la tabla sucursales eliminada)
  ('negocio_nombre',               'Mi Supermercado',  'Nombre del supermercado'),
  ('negocio_nit',                  '',                 'NIT del negocio'),
  ('negocio_direccion',            '',                 'Dirección física del supermercado'),
  ('negocio_municipio',            '',                 'Municipio'),
  ('negocio_departamento',         'Putumayo',         'Departamento'),
  ('negocio_telefono',             '',                 'Teléfono principal'),
  ('negocio_email',                '',                 'Correo de contacto'),
  ('negocio_latitud',              '',                 'Latitud para cobertura e-commerce'),
  ('negocio_longitud',             '',                 'Longitud para cobertura e-commerce'),
  ('negocio_radio_cobertura_km',   '5',                'Radio de cobertura en km para domicilios — 7.3'),
  -- Seguridad y sesiones
  ('max_intentos_login',           '5',                'Intentos antes de bloqueo temporal — HU-01 CA4'),
  ('minutos_bloqueo_login',        '15',               'Minutos bloqueado tras intentos fallidos'),
  ('expiracion_sesion_horas',      '8',                'Expiración automática de sesión — RNF-S04'),
  -- POS y caja
  ('descuento_maximo_cajero_pct',  '10',               'Descuento máximo % que puede aplicar un cajero — HU-02'),
  ('umbral_devoluciones_anomalia', '3',                'Devoluciones en un turno que disparan ANOM-001'),
  -- Inventario
  ('dias_alerta_caducidad',        '7',                'Días para alertar productos próximos a vencer — HU-03 CA6'),
  ('dias_stock_urgente',           '7',                'Umbral días stock restante para marcar urgente — HU-05 CA4'),
  -- E-commerce
  ('minutos_reserva_carrito',      '15',               'Reserva temporal de stock al agregar al carrito — 7.4'),
  -- Fiscales
  ('iva_porcentaje',               '19',               'IVA % estándar aplicado en facturas'),
  ('moneda',                       'COP',              'Moneda principal');
