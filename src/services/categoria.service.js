const { pool } = require('../config/database');

const SELECT_FIELDS = 'id_categoria, nombre, descripcion, activo';

async function list() {
  const [rows] = await pool.execute(
    `SELECT ${SELECT_FIELDS} FROM categorias ORDER BY id_categoria ASC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT ${SELECT_FIELDS} FROM categorias WHERE id_categoria = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const nombre = data.nombre.trim();
  const descripcion = data.descripcion ? data.descripcion.trim() : null;
  const activo = data.activo === undefined || data.activo === null ? 1 : data.activo ? 1 : 0;

  const [result] = await pool.execute(
    'INSERT INTO categorias (nombre, descripcion, activo) VALUES (?, ?, ?)',
    [nombre, descripcion, activo]
  );

  return findById(result.insertId);
}

async function update(id, data) {
  const sets = [];
  const values = [];

  if (data.nombre !== undefined) {
    sets.push('nombre = ?');
    values.push(data.nombre.trim());
  }

  if (data.descripcion !== undefined) {
    sets.push('descripcion = ?');
    values.push(data.descripcion === null || data.descripcion === '' ? null : data.descripcion.trim());
  }

  if (data.activo !== undefined) {
    sets.push('activo = ?');
    values.push(data.activo ? 1 : 0);
  }

  if (sets.length === 0) {
    return findById(id);
  }

  values.push(id);

  await pool.execute(`UPDATE categorias SET ${sets.join(', ')} WHERE id_categoria = ?`, values);

  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM categorias WHERE id_categoria = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { list, findById, create, update, remove };
