const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const httpError = require('../utils/httpError');

const SALT_ROUNDS = 10;
const ADMIN_ROLE_NAME = 'Administrador';

const SELECT_USUARIO = `
  SELECT u.id_usuario,
         u.rol_id,
         r.nombre AS rol,
         u.nombre,
         u.apellido,
         u.tipo_documento,
         u.documento,
         u.correo,
         u.telefono,
         u.estado,
         u.bloqueado,
         u.intentos_fallidos,
         u.bloqueo_hasta,
         u.ultimo_acceso,
         u.created_by,
         CONCAT_WS(' ', cu.nombre, cu.apellido) AS creado_por,
         u.created_at,
         u.updated_at
    FROM usuarios u
    INNER JOIN roles r ON r.id_rol = u.rol_id
    LEFT JOIN usuarios cu ON cu.id_usuario = u.created_by
`;

async function findById(id) {
  const [rows] = await pool.execute(`${SELECT_USUARIO} WHERE u.id_usuario = ?`, [id]);
  return rows[0] || null;
}

async function findAdminRoleId() {
  const [rows] = await pool.execute('SELECT id_rol FROM roles WHERE nombre = ?', [ADMIN_ROLE_NAME]);
  return rows[0] ? rows[0].id_rol : null;
}

async function countActiveAdmins(adminRoleId) {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) AS total FROM usuarios WHERE rol_id = ? AND estado = 1',
    [adminRoleId]
  );
  return rows[0].total;
}

async function ensureCorreoAvailable(correo, excludeId = null) {
  const [rows] = await pool.execute(
    'SELECT id_usuario FROM usuarios WHERE correo = ? AND (? IS NULL OR id_usuario <> ?)',
    [correo, excludeId, excludeId]
  );
  if (rows.length > 0) {
    throw httpError(409, 'El correo ya se encuentra registrado');
  }
}

async function ensureDocumentoAvailable(documento, excludeId = null) {
  const [rows] = await pool.execute(
    'SELECT id_usuario FROM usuarios WHERE documento = ? AND (? IS NULL OR id_usuario <> ?)',
    [documento, excludeId, excludeId]
  );
  if (rows.length > 0) {
    throw httpError(409, 'El documento ya se encuentra registrado');
  }
}

async function ensureRolExists(rolId) {
  const [rows] = await pool.execute('SELECT id_rol FROM roles WHERE id_rol = ?', [rolId]);
  if (rows.length === 0) {
    throw httpError(400, 'El rol especificado no existe');
  }
}

async function ensureNotLastActiveAdmin(target, changes) {
  const adminRoleId = await findAdminRoleId();
  if (!adminRoleId) {
    return;
  }

  const isAdmin = target.rol_id === adminRoleId;
  const wasActive = target.estado === 1;

  const nextEstado =
    changes.estado !== undefined
      ? changes.estado
        ? 1
        : 0
      : target.estado;
  const nextRolId = changes.rol_id !== undefined ? changes.rol_id : target.rol_id;

  const removesAdmin = isAdmin && (nextEstado !== 1 || nextRolId !== adminRoleId);
  if (!wasActive || !removesAdmin) {
    return;
  }

  const totalActive = await countActiveAdmins(adminRoleId);
  if (totalActive <= 1) {
    throw httpError(409, 'No se puede desactivar o quitar el rol al último administrador activo');
  }
}

async function list(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.nombre) {
    conditions.push("CONCAT_WS(' ', u.nombre, u.apellido) LIKE ?");
    values.push(`%${filters.nombre}%`);
  }

  if (filters.correo) {
    conditions.push('u.correo LIKE ?');
    values.push(`%${filters.correo}%`);
  }

  if (filters.documento) {
    conditions.push('u.documento = ?');
    values.push(filters.documento);
  }

  if (filters.rol_id !== undefined && filters.rol_id !== null) {
    conditions.push('u.rol_id = ?');
    values.push(filters.rol_id);
  }

  if (filters.estado !== undefined && filters.estado !== null) {
    conditions.push('u.estado = ?');
    values.push(filters.estado ? 1 : 0);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.execute(`${SELECT_USUARIO} ${where} ORDER BY u.id_usuario ASC`, values);
  return rows;
}

function toOptionalText(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return value.trim();
}

async function create(data, createdBy) {
  const rolId = data.rol_id;
  const nombre = data.nombre.trim();
  const apellido = toOptionalText(data.apellido);
  const tipoDocumento = data.tipo_documento || 'CC';
  const documento = toOptionalText(data.documento);
  const correo = data.correo.trim().toLowerCase();
  const telefono = toOptionalText(data.telefono);
  const estado = data.estado === undefined || data.estado === null ? 1 : data.estado ? 1 : 0;

  await ensureRolExists(rolId);
  await ensureCorreoAvailable(correo);
  if (documento) {
    await ensureDocumentoAvailable(documento);
  }

  const hash = await bcrypt.hash(data.contrasena, SALT_ROUNDS);

  const [result] = await pool.execute(
    `INSERT INTO usuarios
       (rol_id, nombre, apellido, tipo_documento, documento, correo, contrasena, telefono, estado, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [rolId, nombre, apellido, tipoDocumento, documento, correo, hash, telefono, estado, createdBy ?? null]
  );

  return findById(result.insertId);
}

async function update(id, data) {
  const target = await findById(id);
  if (!target) {
    return null;
  }

  const changes = {};

  if (data.rol_id !== undefined && data.rol_id !== null) {
    await ensureRolExists(data.rol_id);
    changes.rol_id = data.rol_id;
  }

  if (data.correo !== undefined) {
    const correo = data.correo.trim().toLowerCase();
    await ensureCorreoAvailable(correo, id);
    changes.correo = correo;
  }

  if (data.documento !== undefined) {
    const documento = toOptionalText(data.documento);
    if (documento) {
      await ensureDocumentoAvailable(documento, id);
    }
    changes.documento = documento;
  }

  if (data.estado !== undefined) {
    changes.estado = data.estado ? 1 : 0;
  }

  if (changes.rol_id !== undefined || changes.estado !== undefined) {
    await ensureNotLastActiveAdmin(target, changes);
  }

  const sets = [];
  const values = [];

  if (changes.rol_id !== undefined) {
    sets.push('rol_id = ?');
    values.push(changes.rol_id);
  }

  if (data.nombre !== undefined) {
    sets.push('nombre = ?');
    values.push(data.nombre.trim());
  }

  if (data.apellido !== undefined) {
    sets.push('apellido = ?');
    values.push(toOptionalText(data.apellido));
  }

  if (data.tipo_documento !== undefined) {
    sets.push('tipo_documento = ?');
    values.push(data.tipo_documento);
  }

  if (changes.documento !== undefined) {
    sets.push('documento = ?');
    values.push(changes.documento);
  }

  if (changes.correo !== undefined) {
    sets.push('correo = ?');
    values.push(changes.correo);
  }

  if (data.telefono !== undefined) {
    sets.push('telefono = ?');
    values.push(toOptionalText(data.telefono));
  }

  if (changes.estado !== undefined) {
    sets.push('estado = ?');
    values.push(changes.estado);
  }

  if (sets.length === 0) {
    return findById(id);
  }

  values.push(id);

  await pool.execute(`UPDATE usuarios SET ${sets.join(', ')} WHERE id_usuario = ?`, values);

  return findById(id);
}

async function changePassword(id, contrasena) {
  const hash = await bcrypt.hash(contrasena, SALT_ROUNDS);

  const [result] = await pool.execute('UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?', [
    hash,
    id,
  ]);

  return result.affectedRows > 0;
}

async function remove(id, currentUserId) {
  if (id === currentUserId) {
    throw httpError(400, 'No puede eliminar su propia cuenta');
  }

  const target = await findById(id);
  if (!target) {
    return false;
  }

  await ensureNotLastActiveAdmin(target, { estado: 0 });

  try {
    const [result] = await pool.execute('DELETE FROM usuarios WHERE id_usuario = ?', [id]);
    return result.affectedRows > 0;
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      throw httpError(409, 'El usuario tiene registros relacionados y no puede eliminarse');
    }
    throw err;
  }
}

module.exports = {
  list,
  findById,
  create,
  update,
  changePassword,
  remove,
};
