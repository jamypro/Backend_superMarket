require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const SQL_MODE =
  'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

const ROOT = path.resolve(__dirname, '..');

const REQUIRED_ENV = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER'];

function readSqlFile(relPath) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`No se encontró el archivo SQL: ${relPath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function isOnlyComments(statement) {
  return statement
    .split(/\r?\n/)
    .every((line) => line.trim() === '' || line.trim().startsWith('--'));
}

/**
 * Divide un archivo SQL en sentencias, respetando la directiva
 * DELIMITER que usan los triggers y procedimientos almacenados.
 */
function splitStatements(sql) {
  const statements = [];
  let current = '';
  let delimiter = ';';

  for (const line of sql.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (/^DELIMITER\s+/i.test(trimmed)) {
      delimiter = trimmed.replace(/^DELIMITER\s+/i, '').trim();
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
      current = '';
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

  console.log(`  ok  ${relPath}  (${statements.length} sentencias)`);
}

async function main() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(
      `Faltan variables de entorno: ${missing.join(', ')}.\n` +
        'Copia .env.example a .env y completa las credenciales de MySQL.'
    );
    process.exit(1);
  }

  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT) || 3306;
  const database = process.env.DB_NAME;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD || '';

  console.log('=== SuperMarket · Inicialización de la base de datos ===');
  console.log(`    Host: ${host}:${port}`);
  console.log(`    Base de datos: ${database}`);
  console.log(`    Usuario: ${user}\n`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });
  } catch (err) {
    console.error('✖ No se pudo conectar a MySQL.');
    console.error('  Verifica DB_HOST, DB_PORT, DB_USER y DB_PASSWORD.');
    console.error(`  Detalle: ${err.message}`);
    process.exit(1);
  }

  const stage = (label) => console.log(`\n[${label}]`);

  try {
    stage('1/7 · Configuración de sesión');
    await connection.query('SET NAMES utf8mb4');
    await connection.query(`SET SQL_MODE = '${SQL_MODE}'`);
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    stage('2/7 · Creación de la base de datos');
    await connection.query('CREATE DATABASE IF NOT EXISTS ??', [database]);
    await connection.query('USE ??', [database]);
    console.log(`  ok  Base de datos "${database}" lista.`);

    stage('3/7 · Tablas (schema)');
    await execFile(connection, 'database/schema/01_base.sql');
    await execFile(connection, 'database/schema/02_catalogo.sql');
    await execFile(connection, 'database/schema/03_proveedores.sql');
    await execFile(connection, 'database/schema/04_inventario.sql');
    await execFile(connection, 'database/schema/05_ventas.sql');
    await execFile(connection, 'database/schema/06_devoluciones.sql');
    await execFile(connection, 'database/schema/07_auditoria.sql');
    await execFile(connection, 'database/schema/08_prediccion.sql');
    await execFile(connection, 'database/schema/09_ecommerce.sql');
    await execFile(connection, 'database/schema/10_configuracion.sql');

    stage('3/7 · Índices adicionales');
    await execFile(connection, 'database/indexes/01_indices_adicionales.sql');

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    stage('4/7 · Datos iniciales (seeds)');
    await execFile(connection, 'database/seeds/01_roles.sql');
    await execFile(connection, 'database/seeds/02_metodos_pago.sql');
    await execFile(connection, 'database/seeds/03_tipo_movimientos.sql');
    await execFile(connection, 'database/seeds/04_estados_devoluciones.sql');
    await execFile(connection, 'database/seeds/05_tipo_anomalias.sql');
    await execFile(connection, 'database/seeds/06_configuracion.sql');

    stage('5/7 · Procedimientos almacenados');
    await execFile(connection, 'database/procedures/01_numeros_correlativos.sql');
    await execFile(connection, 'database/procedures/02_sp_registrar_venta_pos.sql');
    await execFile(connection, 'database/procedures/03_sp_cerrar_turno.sql');
    await execFile(connection, 'database/procedures/04_sp_calcular_prediccion.sql');

    stage('6/7 · Triggers');
    await execFile(connection, 'database/triggers/01_productos.sql');
    await execFile(connection, 'database/triggers/02_inventario.sql');
    await execFile(connection, 'database/triggers/03_facturas_ventas.sql');
    await execFile(connection, 'database/triggers/04_items_factura.sql');
    await execFile(connection, 'database/triggers/05_devoluciones.sql');
    await execFile(connection, 'database/triggers/06_ordenes_compra.sql');
    await execFile(connection, 'database/triggers/07_usuarios.sql');
    await execFile(connection, 'database/triggers/08_entrada_inventario.sql');
    await execFile(connection, 'database/triggers/09_pedidos_online.sql');

    stage('7/7 · Vistas');
    await execFile(connection, 'database/views/01_vistas_reportes.sql');

    console.log('\n=== Base de datos inicializada correctamente ===');
  } catch (err) {
    console.error('\n✖ Error durante la inicialización:');
    console.error(`  ${err.message}`);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

main();
