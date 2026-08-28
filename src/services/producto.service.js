const { pool } = require('../config/database');
const httpError = require('../utils/httpError');

const SELECT_PRODUCTO = `
  SELECT p.id_producto, p.codigo_barras, p.nombre, p.descripcion,
         p.id_categoria, c.nombre AS categoria,
         p.id_unidad_de_medida, u.nombre AS unidad_medida,
         p.precio_venta, p.precio_compra, p.precio_minimo, p.porcentaje_iva,
         p.caducidad, p.activo, p.created_at, p.updated_at
    FROM productos p
    LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
    LEFT JOIN unidades_de_medida u ON u.id_unidad = p.id_unidad_de_medida
`;

async function findById(id) {
  const [rows] = await pool.execute(`${SELECT_PRODUCTO} WHERE p.id_producto = ?`, [id]);
  return rows[0] || null;
}

async function findByCodigoBarras(codigoBarras) {
  const [rows] = await pool.execute(
    'SELECT id_producto FROM productos WHERE codigo_barras = ?',
    [codigoBarras]
  );
  return rows[0] || null;
}

async function ensureCodigoBarrasAvailable(codigoBarras, excludeId) {
  const [rows] = await pool.execute(
    'SELECT id_producto FROM productos WHERE codigo_barras = ? AND (? IS NULL OR id_producto <> ?)',
    [codigoBarras, excludeId, excludeId]
  );
  if (rows.length > 0) {
    throw httpError(409, 'El código de barras ya se encuentra registrado');
  }
}

async function ensureCategoriaExists(idCategoria) {
  const [rows] = await pool.execute(
    'SELECT id_categoria FROM categorias WHERE id_categoria = ?',
    [idCategoria]
  );
  if (rows.length === 0) {
    throw httpError(400, 'La categoría especificada no existe');
  }
}

async function ensureUnidadExists(idUnidad) {
  const [rows] = await pool.execute(
    'SELECT id_unidad FROM unidades_de_medida WHERE id_unidad = ?',
    [idUnidad]
  );
  if (rows.length === 0) {
    throw httpError(400, 'La unidad de medida especificada no existe');
  }
}

async function list(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.nombre) {
    conditions.push('p.nombre LIKE ?');
    values.push(`%${filters.nombre}%`);
  }

  if (filters.codigo_barras) {
    conditions.push('p.codigo_barras = ?');
    values.push(filters.codigo_barras);
  }

  if (filters.id_categoria !== undefined && filters.id_categoria !== null) {
    conditions.push('p.id_categoria = ?');
    values.push(filters.id_categoria);
  }

  if (filters.activo !== undefined && filters.activo !== null) {
    conditions.push('p.activo = ?');
    values.push(filters.activo ? 1 : 0);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.execute(
    `${SELECT_PRODUCTO} ${where} ORDER BY p.nombre ASC`,
    values
  );
  return rows;
}

function normalizeCreateData(data) {
  return {
    codigo_barras:
      data.codigo_barras && data.codigo_barras.trim() ? data.codigo_barras.trim() : null,
    nombre: data.nombre.trim(),
    descripcion: data.descripcion ? data.descripcion.trim() : null,
    id_categoria: data.id_categoria ?? null,
    id_unidad_de_medida: data.id_unidad_de_medida ?? null,
    precio_venta: data.precio_venta ?? 0,
    precio_compra: data.precio_compra ?? 0,
    precio_minimo: data.precio_minimo ?? 0,
    porcentaje_iva: data.porcentaje_iva ?? 0,
    caducidad: data.caducidad ?? null,
    activo: data.activo === undefined || data.activo === null ? 1 : data.activo ? 1 : 0,
  };
}

async function create(data) {
  const p = normalizeCreateData(data);

  if (p.codigo_barras) {
    await ensureCodigoBarrasAvailable(p.codigo_barras, null);
  }
  if (p.id_categoria !== null) {
    await ensureCategoriaExists(p.id_categoria);
  }
  if (p.id_unidad_de_medida !== null) {
    await ensureUnidadExists(p.id_unidad_de_medida);
  }

  const [result] = await pool.execute(
    `INSERT INTO productos
       (codigo_barras, nombre, descripcion, id_categoria, id_unidad_de_medida,
        precio_venta, precio_compra, precio_minimo, porcentaje_iva, caducidad, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      p.codigo_barras,
      p.nombre,
      p.descripcion,
      p.id_categoria,
      p.id_unidad_de_medida,
      p.precio_venta,
      p.precio_compra,
      p.precio_minimo,
      p.porcentaje_iva,
      p.caducidad,
      p.activo,
    ]
  );

  return findById(result.insertId);
}

async function update(id, data) {
  if (data.codigo_barras !== undefined) {
    const codigoBarras =
      data.codigo_barras !== null && data.codigo_barras.trim() ? data.codigo_barras.trim() : null;
    if (codigoBarras) {
      await ensureCodigoBarrasAvailable(codigoBarras, id);
    }
  }

  if (data.id_categoria !== undefined && data.id_categoria !== null) {
    await ensureCategoriaExists(data.id_categoria);
  }

  if (data.id_unidad_de_medida !== undefined && data.id_unidad_de_medida !== null) {
    await ensureUnidadExists(data.id_unidad_de_medida);
  }

  const sets = [];
  const values = [];

  if (data.codigo_barras !== undefined) {
    sets.push('codigo_barras = ?');
    values.push(
      data.codigo_barras !== null && data.codigo_barras.trim() ? data.codigo_barras.trim() : null
    );
  }

  if (data.nombre !== undefined) {
    sets.push('nombre = ?');
    values.push(data.nombre.trim());
  }

  if (data.descripcion !== undefined) {
    sets.push('descripcion = ?');
    values.push(data.descripcion === null || data.descripcion === '' ? null : data.descripcion.trim());
  }

  if (data.id_categoria !== undefined) {
    sets.push('id_categoria = ?');
    values.push(data.id_categoria === null ? null : data.id_categoria);
  }

  if (data.id_unidad_de_medida !== undefined) {
    sets.push('id_unidad_de_medida = ?');
    values.push(data.id_unidad_de_medida === null ? null : data.id_unidad_de_medida);
  }

  if (data.precio_venta !== undefined) {
    sets.push('precio_venta = ?');
    values.push(data.precio_venta);
  }

  if (data.precio_compra !== undefined) {
    sets.push('precio_compra = ?');
    values.push(data.precio_compra);
  }

  if (data.precio_minimo !== undefined) {
    sets.push('precio_minimo = ?');
    values.push(data.precio_minimo);
  }

  if (data.porcentaje_iva !== undefined) {
    sets.push('porcentaje_iva = ?');
    values.push(data.porcentaje_iva);
  }

  if (data.caducidad !== undefined) {
    sets.push('caducidad = ?');
    values.push(data.caducidad === null ? null : data.caducidad);
  }

  if (data.activo !== undefined) {
    sets.push('activo = ?');
    values.push(data.activo ? 1 : 0);
  }

  if (sets.length === 0) {
    return findById(id);
  }

  values.push(id);

  await pool.execute(`UPDATE productos SET ${sets.join(', ')} WHERE id_producto = ?`, values);

  return findById(id);
}

async function remove(id) {
  try {
    const [result] = await pool.execute('DELETE FROM productos WHERE id_producto = ?', [id]);
    return result.affectedRows > 0;
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      throw httpError(409, 'El producto tiene registros relacionados y no puede eliminarse');
    }
    throw err;
  }
}

module.exports = { list, findById, create, update, remove };
