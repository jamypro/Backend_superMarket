-- ============================================================
--  SETUP COMPLETO DE LA BASE DE DATOS — SuperMarket
--  Sistema Web de Facturación e Inventario para Supermercados
--
--  Crea la base de datos, tablas, índices, datos iniciales,
--  procedimientos almacenados, triggers y vistas.
--
--  ORDEN DE EJECUCIÓN (basado en las dependencias reales):
--    1. crear/seleccionar base de datos
--    2. crear tablas (en orden de claves foráneas)
--    3. crear índices adicionales
--    4. insertar datos iniciales (seeds)
--    5. crear procedimientos almacenados
--    6. crear triggers
--    7. crear vistas
--
--  Cómo ejecutarlo (desde la raíz del proyecto):
--    mysql -u <usuario> -p < database/setup.sql
--
--  O, de forma programática (recomendado):
--    npm run db:setup
--
--  Las rutas de SOURCE son relativas a la raíz del proyecto.
-- ============================================================

SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1) Crear y seleccionar la base de datos
CREATE DATABASE IF NOT EXISTS supermercadomarket;
USE supermercadomarket;

-- 2) Tablas (en orden de dependencias de claves foráneas)
SOURCE database/schema/01_base.sql;
SOURCE database/schema/02_catalogo.sql;
SOURCE database/schema/03_proveedores.sql;
SOURCE database/schema/04_inventario.sql;
SOURCE database/schema/05_ventas.sql;
SOURCE database/schema/06_devoluciones.sql;
SOURCE database/schema/07_auditoria.sql;
SOURCE database/schema/08_prediccion.sql;
SOURCE database/schema/09_ecommerce.sql;
SOURCE database/schema/10_configuracion.sql;

-- 3) Índices adicionales de rendimiento
SOURCE database/indexes/01_indices_adicionales.sql;

SET FOREIGN_KEY_CHECKS = 1;

-- 4) Datos iniciales (seeds)
SOURCE database/seeds/01_roles.sql;
SOURCE database/seeds/02_metodos_pago.sql;
SOURCE database/seeds/03_tipo_movimientos.sql;
SOURCE database/seeds/04_estados_devoluciones.sql;
SOURCE database/seeds/05_tipo_anomalias.sql;
SOURCE database/seeds/06_configuracion.sql;

-- 5) Procedimientos almacenados
SOURCE database/procedures/01_numeros_correlativos.sql;
SOURCE database/procedures/02_sp_registrar_venta_pos.sql;
SOURCE database/procedures/03_sp_cerrar_turno.sql;
SOURCE database/procedures/04_sp_calcular_prediccion.sql;

-- 6) Triggers
SOURCE database/triggers/01_productos.sql;
SOURCE database/triggers/02_inventario.sql;
SOURCE database/triggers/03_facturas_ventas.sql;
SOURCE database/triggers/04_items_factura.sql;
SOURCE database/triggers/05_devoluciones.sql;
SOURCE database/triggers/06_ordenes_compra.sql;
SOURCE database/triggers/07_usuarios.sql;
SOURCE database/triggers/08_entrada_inventario.sql;
SOURCE database/triggers/09_pedidos_online.sql;

-- 7) Vistas
SOURCE database/views/01_vistas_reportes.sql;

-- ============================================================
--  FIN DEL SETUP
-- ============================================================
