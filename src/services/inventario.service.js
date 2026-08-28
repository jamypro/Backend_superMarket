const { pool } = require('../config/database');
const httpError = require('../utils/httpError');

const SELECT_STOCK = `
  SELECT inv.id_inventario,
         inv.producto_id,
         p.codigo_barras,
         p.nombre AS producto,
         p.activo AS producto_activo,
         inv.stock_actual,
         inv.stock_minimo,
         inv.stock_maximo,
         inv.stock_reservado,
         inv.expira_en,
         inv.actualizado_en,
         (inv.stock_actual <= inv.stock_minimo) AS stock_critico,
         CASE
           WHEN inv.stock_actual = 0 THEN 'AGOTADO'
           WHEN inv.stock_actual <= inv.stock_minimo THEN 'CRÍTICO'
           ELSE 'NORMAL'
         END AS nivel_alerta
    FROM inventario inv
    JOIN productos p ON p.id_producto = inv.producto_id
`;

const SELECT_ENTRADA = `
  SELECT e.id_entrada_inventario,
         e.producto_id,
         p.codigo_barras,
         p.nombre AS producto,
         e.cantidad,
         e.tipo_referencia,
         e.numero_factura_proveedor,
         e.orden_compra_id,
         e.notas,
         e.creado_por,
         e.created_at,
         'ENTRADA' AS tipo
    FROM entrada_inventario e
    JOIN productos p ON p.id_producto = e.producto_id
`;

function mapStockRow(row) {
  return { ...row, stock_critico: Boolean(row.stock_critico) };
}

async function listStock() {
  const [rows] = await pool.execute(`${SELECT_STOCK} ORDER BY p.nombre ASC`);
  return rows.map(mapStockRow);
}

async function findStockByProducto(productoId) {
  const [productos] = await pool.execute(
    `SELECT id_producto, codigo_barras, nombre, activo
       FROM productos
      WHERE id_producto = ?`,
    [productoId]
  );

  if (productos.length === 0) {
    return null;
  }

  const [inventario] = await pool.execute(
    `SELECT id_inventario, stock_actual, stock_minimo, stock_maximo,
            stock_reservado, expira_en, actualizado_en
       FROM inventario
      WHERE producto_id = ?`,
    [productoId]
  );

  const producto = productos[0];

  if (inventario.length === 0) {
    return {
      producto_id: producto.id_producto,
      codigo_barras: producto.codigo_barras,
      producto: producto.nombre,
      producto_activo: producto.activo,
      id_inventario: null,
      stock_actual: 0,
      stock_minimo: 0,
      stock_maximo: null,
      stock_reservado: 0,
      expira_en: null,
      actualizado_en: null,
      stock_critico: false,
      nivel_alerta: 'NORMAL',
      tiene_registro_inventario: false,
    };
  }

  const inv = inventario[0];

  return {
    producto_id: producto.id_producto,
    codigo_barras: producto.codigo_barras,
    producto: producto.nombre,
    producto_activo: producto.activo,
    id_inventario: inv.id_inventario,
    stock_actual: inv.stock_actual,
    stock_minimo: inv.stock_minimo,
    stock_maximo: inv.stock_maximo,
    stock_reservado: inv.stock_reservado,
    expira_en: inv.expira_en,
    actualizado_en: inv.actualizado_en,
    stock_critico: inv.stock_actual <= inv.stock_minimo,
    nivel_alerta:
      inv.stock_actual === 0
        ? 'AGOTADO'
        : inv.stock_actual <= inv.stock_minimo
          ? 'CRÍTICO'
          : 'NORMAL',
    tiene_registro_inventario: true,
  };
}

async function findEntradaById(id) {
  const [rows] = await pool.execute(
    `${SELECT_ENTRADA} WHERE e.id_entrada_inventario = ?`,
    [id]
  );
  return rows[0] || null;
}

async function registerEntrada(data, creadoPor) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [productos] = await connection.execute(
      'SELECT id_producto FROM productos WHERE id_producto = ?',
      [data.producto_id]
    );
    if (productos.length === 0) {
      throw httpError(404, 'Producto no encontrado');
    }

    if (data.orden_compra_id !== undefined && data.orden_compra_id !== null) {
      const [ordenes] = await connection.execute(
        'SELECT id_orden_compra FROM ordenes_compra WHERE id_orden_compra = ?',
        [data.orden_compra_id]
      );
      if (ordenes.length === 0) {
        throw httpError(400, 'La orden de compra especificada no existe');
      }
    }

    const [result] = await connection.execute(
      `INSERT INTO entrada_inventario
         (producto_id, orden_compra_id, numero_factura_proveedor,
          tipo_referencia, cantidad, notas, creado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.producto_id,
        data.orden_compra_id ?? null,
        data.numero_factura_proveedor ?? null,
        data.tipo_referencia ?? null,
        data.cantidad,
        data.notas ?? null,
        creadoPor,
      ]
    );

    await connection.commit();

    return findEntradaById(result.insertId);
  } catch (err) {
    await connection.rollback();
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      throw httpError(400, 'El usuario o la referencia especificada no existe');
    }
    throw err;
  } finally {
    connection.release();
  }
}

async function listMovimientos(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.producto_id !== undefined && filters.producto_id !== null) {
    conditions.push('e.producto_id = ?');
    values.push(filters.producto_id);
  }

  if (filters.orden_compra_id !== undefined && filters.orden_compra_id !== null) {
    conditions.push('e.orden_compra_id = ?');
    values.push(filters.orden_compra_id);
  }

  if (filters.tipo_referencia) {
    conditions.push('e.tipo_referencia = ?');
    values.push(filters.tipo_referencia);
  }

  if (filters.fecha_inicio) {
    conditions.push('e.created_at >= ?');
    values.push(`${filters.fecha_inicio} 00:00:00`);
  }

  if (filters.fecha_fin) {
    conditions.push('e.created_at <= ?');
    values.push(`${filters.fecha_fin} 23:59:59`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.execute(
    `${SELECT_ENTRADA} ${where} ORDER BY e.created_at DESC`,
    values
  );
  return rows;
}

module.exports = {
  listStock,
  findStockByProducto,
  registerEntrada,
  listMovimientos,
};
