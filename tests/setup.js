import "dotenv/config";
import { beforeAll, afterAll, beforeEach, vi } from "vitest";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const TEST_DB_NAME = "supermercadomarket_test";

const SQL_MODE = "STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION";

function readSqlFile(relPath) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`No se encontró el archivo SQL: ${relPath}`);
  }
  return fs.readFileSync(fullPath, "utf8");
}

function isOnlyComments(statement) {
  return statement
    .split(/\r?\n/)
    .every((line) => line.trim() === "" || line.trim().startsWith("--"));
}

function splitStatements(sql) {
  const statements = [];
  let current = "";
  let delimiter = ";";

  for (const line of sql.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (/^DELIMITER\s+/i.test(trimmed)) {
      delimiter = trimmed.replace(/^DELIMITER\s+/i, "").trim();
      continue;
    }

    current = current ? `${current}\n${line}` : line;

    if (current.endsWith(delimiter)) {
      const statement = current
        .slice(0, current.length - delimiter.length)
        .trim();
      if (statement && !isOnlyComments(statement)) {
        statements.push(statement);
      }
      current = "";
    }
  }

  const tail = current.trim();
  if (tail && !isOnlyComments(tail)) {
    statements.push(tail);
  }

  return statements;
}

async function execFile(connection, relPath) {
  const sql = readSqlFile(relPath);
  const statements = splitStatements(sql);

  for (const statement of statements) {
    await connection.query(statement);
  }
}

let rootConnection;

export async function setupTestDatabase() {
  const host = process.env.DB_HOST || "localhost";
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";

  rootConnection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  });

  await rootConnection.query("SET NAMES utf8mb4");
  await rootConnection.query(`SET SQL_MODE = '${SQL_MODE}'`);
  await rootConnection.query("SET FOREIGN_KEY_CHECKS = 0");

  await rootConnection.query("DROP DATABASE IF EXISTS ??", [TEST_DB_NAME]);
  await rootConnection.query("CREATE DATABASE ??", [TEST_DB_NAME]);
  await rootConnection.query("USE ??", [TEST_DB_NAME]);

  await execFile(rootConnection, "database/schema/01_base.sql");
  await execFile(rootConnection, "database/schema/02_catalogo.sql");
  await execFile(rootConnection, "database/schema/03_proveedores.sql");
  await execFile(rootConnection, "database/schema/04_inventario.sql");
  await execFile(rootConnection, "database/schema/05_ventas.sql");
  await execFile(rootConnection, "database/schema/06_devoluciones.sql");
  await execFile(rootConnection, "database/schema/07_auditoria.sql");
  await execFile(rootConnection, "database/schema/08_prediccion.sql");
  await execFile(rootConnection, "database/schema/09_ecommerce.sql");
  await execFile(rootConnection, "database/schema/10_configuracion.sql");
  await execFile(rootConnection, "database/indexes/01_indices_adicionales.sql");

  await rootConnection.query("SET FOREIGN_KEY_CHECKS = 1");

  await execFile(rootConnection, "database/seeds/01_roles.sql");
  await execFile(rootConnection, "database/seeds/02_metodos_pago.sql");
  await execFile(rootConnection, "database/seeds/03_tipo_movimientos.sql");
  await execFile(rootConnection, "database/seeds/04_estados_devoluciones.sql");
  await execFile(rootConnection, "database/seeds/05_tipo_anomalias.sql");
  await execFile(rootConnection, "database/seeds/06_configuracion.sql");

  await execFile(rootConnection, "database/procedures/01_numeros_correlativos.sql");
  await execFile(rootConnection, "database/procedures/02_sp_registrar_venta_pos.sql");
  await execFile(rootConnection, "database/procedures/03_sp_cerrar_turno.sql");
  await execFile(rootConnection, "database/procedures/04_sp_calcular_prediccion.sql");

  await execFile(rootConnection, "database/triggers/01_productos.sql");
  await execFile(rootConnection, "database/triggers/02_inventario.sql");
  await execFile(rootConnection, "database/triggers/03_facturas_ventas.sql");
  await execFile(rootConnection, "database/triggers/04_items_factura.sql");
  await execFile(rootConnection, "database/triggers/05_devoluciones.sql");
  await execFile(rootConnection, "database/triggers/06_ordenes_compra.sql");
  await execFile(rootConnection, "database/triggers/07_usuarios.sql");
  await execFile(rootConnection, "database/triggers/08_entrada_inventario.sql");
  await execFile(rootConnection, "database/triggers/09_pedidos_online.sql");

  await execFile(rootConnection, "database/views/01_vistas_reportes.sql");

  await rootConnection.query(`
    INSERT INTO usuarios (rol_id, nombre, apellido, tipo_documento, documento, correo, contrasena, estado, bloqueado, intentos_fallidos)
    VALUES 
    (1, 'Admin', 'Test', 'CC', '1000000001', 'admin@test.com', '$2b$10$abcdefghijklmnopqrstuv', 1, 0, 0),
    (2, 'Supervisor', 'Test', 'CC', '1000000002', 'supervisor@test.com', '$2b$10$abcdefghijklmnopqrstuv', 1, 0, 0),
    (3, 'Cajero', 'Test', 'CC', '1000000003', 'cajero@test.com', '$2b$10$abcdefghijklmnopqrstuv', 1, 0, 0),
    (4, 'Domiciliario', 'Test', 'CC', '1000000004', 'domiciliario@test.com', '$2b$10$abcdefghijklmnopqrstuv', 1, 0, 0),
    (5, 'Auditor', 'Test', 'CC', '1000000005', 'auditor@test.com', '$2b$10$abcdefghijklmnopqrstuv', 1, 0, 0)
  `);

  await rootConnection.query(`
    INSERT INTO categorias (nombre, descripcion, activo) VALUES 
    ('Lácteos', 'Productos lácteos', 1),
    ('Panadería', 'Productos de panadería', 1),
    ('Bebidas', 'Bebidas y refrescos', 1)
  `);

  await rootConnection.query(`
    INSERT INTO unidades_de_medida (nombre, simbolo, conversion) VALUES 
    ('Unidad', 'und', 1.0),
    ('Kilogramo', 'kg', 1.0),
    ('Litro', 'L', 1.0)
  `);

  await rootConnection.query(`
    INSERT INTO productos (codigo_barras, nombre, descripcion, id_categoria, id_unidad_de_medida, precio_venta, precio_compra, precio_minimo, porcentaje_iva, activo)
    VALUES 
    ('7701234567890', 'Leche Entera 1L', 'Leche entera pasteurizada', 1, 3, 4500, 3800, 4000, 19.00, 1),
    ('7701234567891', 'Pan Integral', 'Pan integral artesanal', 2, 1, 3200, 2500, 2800, 19.00, 1),
    ('7701234567892', 'Jugo Naranja 1L', 'Jugo natural de naranja', 3, 3, 5800, 4500, 5000, 19.00, 1)
  `);

  await rootConnection.query(`
    INSERT INTO inventario (producto_id, stock_actual, stock_minimo, stock_reservado, stock_maximo, actualizado_en)
    VALUES 
    (1, 100, 10, 0, 500, NOW()),
    (2, 50, 5, 0, 200, NOW()),
    (3, 75, 8, 0, 300, NOW())
  `);

  console.log("✓ Test database initialized");
}

export async function teardownTestDatabase() {
  if (rootConnection) {
    await rootConnection.query("DROP DATABASE IF EXISTS ??", [TEST_DB_NAME]);
    await rootConnection.end();
    console.log("✓ Test database cleaned up");
  }
}

export function generateToken(user) {
  return jwt.sign(
    {
      id_usuario: user.id_usuario,
      rol_id: user.rol_id,
      correo: user.correo,
      nombre: user.nombre,
    },
    process.env.JWT_SECRET || "test-secret-key",
    { expiresIn: "1h" }
  );
}

export async function getUserByEmail(email) {
  const [rows] = await rootConnection.query(
    "SELECT * FROM usuarios WHERE correo = ?",
    [email]
  );
  return rows[0];
}

export async function createTestUser(roleId, email, password = "TestPass123") {
  const bcrypt = await import("bcrypt");
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await rootConnection.query(
    `INSERT INTO usuarios (rol_id, nombre, apellido, tipo_documento, documento, correo, contrasena, estado)
     VALUES (?, 'Test', 'User', 'CC', ?, ?, ?, 1)`,
    [roleId, `10000000${roleId}${Date.now()}`, email, hashedPassword]
  );
  return { id_usuario: result.insertId, rol_id: roleId, correo: email };
}

export { rootConnection, TEST_DB_NAME };

beforeAll(async () => {
  await setupTestDatabase();
}, 60000);

afterAll(async () => {
  await teardownTestDatabase();
}, 10000);

beforeEach(async () => {
  await rootConnection.query("SET FOREIGN_KEY_CHECKS = 0");
  const tables = [
    "anomalias", "auditoria", "pagos_facturas_ventas", "items_factura",
    "facturas_ventas", "movimientos_turnos", "caja", "devoluciones",
    "items_devolucion", "entrada_inventario", "items_orden_compra",
    "ordenes_compra", "proveedor_producto", "proveedores",
    "detalle_pedidos_online", "pagos_online", "asignaciones_domiciliario",
    "estados_pedidos_historial", "pedidos_online", "resenas_respuestas",
    "resenas", "item_carrito", "carrito", "clientes_direcciones",
    "clientes", "promociones_productos", "promociones",
    "img_productos", "inventario", "productos", "unidades_de_medida",
    "categorias", "codigos", "notificaciones", "tipo_anomalias",
    "tipo_movimientos", "metodos_pago", "estados_devoluciones",
    "configuracion_sistema"
  ];
  for (const table of tables) {
    try {
      await rootConnection.query(`TRUNCATE TABLE ??`, [table]);
    } catch (e) {
    }
  }
  await rootConnection.query("SET FOREIGN_KEY_CHECKS = 1");

  await rootConnection.query(`
    INSERT INTO usuarios (rol_id, nombre, apellido, tipo_documento, documento, correo, contrasena, estado, bloqueado, intentos_fallidos)
    VALUES 
    (1, 'Admin', 'Test', 'CC', '1000000001', 'admin@test.com', '$2b$10$abcdefghijklmnopqrstuv', 1, 0, 0),
    (2, 'Supervisor', 'Test', 'CC', '1000000002', 'supervisor@test.com', '$2b$10$abcdefghijklmnopqrstuv', 1, 0, 0),
    (3, 'Cajero', 'Test', 'CC', '1000000003', 'cajero@test.com', '$2b$10$abcdefghijklmnopqrstuv', 1, 0, 0),
    (4, 'Domiciliario', 'Test', 'CC', '1000000004', 'domiciliario@test.com', '$2b$10$abcdefghijklmnopqrstuv', 1, 0, 0),
    (5, 'Auditor', 'Test', 'CC', '1000000005', 'auditor@test.com', '$2b$10$abcdefghijklmnopqrstuv', 1, 0, 0)
  `);

  await rootConnection.query(`
    INSERT INTO categorias (nombre, descripcion, activo) VALUES 
    ('Lácteos', 'Productos lácteos', 1),
    ('Panadería', 'Productos de panadería', 1),
    ('Bebidas', 'Bebidas y refrescos', 1)
  `);

  await rootConnection.query(`
    INSERT INTO unidades_de_medida (nombre, simbolo, conversion) VALUES 
    ('Unidad', 'und', 1.0),
    ('Kilogramo', 'kg', 1.0),
    ('Litro', 'L', 1.0)
  `);

  await rootConnection.query(`
    INSERT INTO productos (codigo_barras, nombre, descripcion, id_categoria, id_unidad_de_medida, precio_venta, precio_compra, precio_minimo, porcentaje_iva, activo)
    VALUES 
    ('7701234567890', 'Leche Entera 1L', 'Leche entera pasteurizada', 1, 3, 4500, 3800, 4000, 19.00, 1),
    ('7701234567891', 'Pan Integral', 'Pan integral artesanal', 2, 1, 3200, 2500, 2800, 19.00, 1),
    ('7701234567892', 'Jugo Naranja 1L', 'Jugo natural de naranja', 3, 3, 5800, 4500, 5000, 19.00, 1)
  `);

  await rootConnection.query(`
    INSERT INTO inventario (producto_id, stock_actual, stock_minimo, stock_reservado, stock_maximo, actualizado_en)
    VALUES 
    (1, 100, 10, 0, 500, NOW()),
    (2, 50, 5, 0, 200, NOW()),
    (3, 75, 8, 0, 300, NOW())
  `);
});