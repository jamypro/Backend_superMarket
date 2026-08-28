const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const httpError = require('../utils/httpError');

const SALT_ROUNDS = 10;
const DEFAULT_ROLE = 'Cajero';

function toSafeUser(user) {
  return {
    id: user.id_usuario,
    correo: user.correo,
    nombre: user.nombre,
    apellido: user.apellido,
    rol: user.rol,
  };
}

function generateToken(user) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

  return jwt.sign({ userId: user.id_usuario, rol: user.rol }, secret, { expiresIn });
}

async function findUserByCorreo(correo) {
  const [rows] = await pool.execute(
    `SELECT u.id_usuario, u.correo, u.contrasena, u.nombre, u.apellido, u.estado,
            r.nombre AS rol
       FROM usuarios u
       INNER JOIN roles r ON r.id_rol = u.rol_id
      WHERE u.correo = ?`,
    [correo]
  );

  return rows[0] || null;
}

async function getUserById(id) {
  const [rows] = await pool.execute(
    `SELECT u.id_usuario, u.correo, u.nombre, u.apellido, u.estado,
            r.nombre AS rol
       FROM usuarios u
       INNER JOIN roles r ON r.id_rol = u.rol_id
      WHERE u.id_usuario = ?`,
    [id]
  );

  return rows[0] || null;
}

async function resolveRol(rolId) {
  if (rolId !== undefined && rolId !== null) {
    const [roles] = await pool.execute('SELECT id_rol, nombre FROM roles WHERE id_rol = ?', [rolId]);
    if (roles.length === 0) {
      throw httpError(400, 'El rol especificado no existe');
    }
    return roles[0];
  }

  const [roles] = await pool.execute('SELECT id_rol, nombre FROM roles WHERE nombre = ?', [
    DEFAULT_ROLE,
  ]);
  if (roles.length === 0) {
    throw httpError(500, `No se encontró el rol por defecto "${DEFAULT_ROLE}" en la base de datos`);
  }
  return roles[0];
}

async function registerUser(data) {
  const correo = data.correo.trim().toLowerCase();
  const nombre = data.nombre.trim();
  const apellido = data.apellido ? data.apellido.trim() : null;

  const [existing] = await pool.execute('SELECT id_usuario FROM usuarios WHERE correo = ?', [
    correo,
  ]);
  if (existing.length > 0) {
    throw httpError(409, 'El correo ya se encuentra registrado');
  }

  const rol = await resolveRol(data.rol_id);
  const hash = await bcrypt.hash(data.contrasena, SALT_ROUNDS);

  const [result] = await pool.execute(
    'INSERT INTO usuarios (rol_id, nombre, apellido, correo, contrasena) VALUES (?, ?, ?, ?, ?)',
    [rol.id_rol, nombre, apellido, correo, hash]
  );

  const user = await getUserById(result.insertId);
  return toSafeUser(user);
}

async function loginUser(data) {
  const correo = data.correo.trim().toLowerCase();

  const user = await findUserByCorreo(correo);
  if (!user || user.estado !== 1) {
    throw httpError(401, 'Credenciales inválidas');
  }

  const match = await bcrypt.compare(data.contrasena, user.contrasena);
  if (!match) {
    throw httpError(401, 'Credenciales inválidas');
  }

  const token = generateToken(user);

  return { token, user: toSafeUser(user) };
}

module.exports = { registerUser, loginUser, getUserById };
