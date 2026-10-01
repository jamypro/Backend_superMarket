const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuario.repository');
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
  return usuarioRepository.findUserByCorreo(correo);
}

async function getUserById(id) {
  return usuarioRepository.getUserById(id);
}

async function resolveRol(rolId) {
  if (rolId !== undefined && rolId !== null) {
    const rol = await usuarioRepository.findRolById(rolId);
    if (!rol) {
      throw httpError(400, 'El rol especificado no existe');
    }
    return rol;
  }

  const rol = await usuarioRepository.findRolByNombre(DEFAULT_ROLE);
  if (!rol) {
    throw httpError(500, `No se encontró el rol por defecto "${DEFAULT_ROLE}" en la base de datos`);
  }
  return rol;
}

async function registerUser(data) {
  const correo = data.correo.trim().toLowerCase();
  const nombre = data.nombre.trim();
  const apellido = data.apellido ? data.apellido.trim() : null;

  const existing = await usuarioRepository.findByCorreo(correo);
  if (existing) {
    throw httpError(409, 'El correo ya se encuentra registrado');
  }

  const rol = await resolveRol(data.rol_id);
  const hash = await bcrypt.hash(data.contrasena, SALT_ROUNDS);

  const user = await usuarioRepository.create({
    rol_id: rol.id_rol,
    nombre,
    apellido,
    correo,
    contrasena: hash,
  });

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
