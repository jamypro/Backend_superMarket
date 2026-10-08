import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as usuarioRepository from "../repositories/usuario.repository.js";
import httpError from "../utils/httpError.js";

const SALT_ROUNDS = 10;
const DEFAULT_ROLE = 'Cajero';
const MAX_INTENTOS_FALLIDOS = 5;
const MINUTOS_BLOQUEO = 15;

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

  return jwt.sign(
    { id_usuario: user.id_usuario, rol_id: user.rol_id },
    secret,
    { expiresIn },
  );
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
  if (!user || Number(user.estado) !== 1) {
    throw httpError(401, 'Credenciales inválidas');
  }

  const bloqueoHasta = user.bloqueo_hasta ? new Date(user.bloqueo_hasta) : null;
  if (Number(user.bloqueado) === 1 && bloqueoHasta && bloqueoHasta > new Date()) {
    throw httpError(423, 'Cuenta bloqueada temporalmente. Intente de nuevo más tarde');
  }

  const match = await bcrypt.compare(data.contrasena, user.contrasena);
  if (!match) {
    const intentos = (Number(user.intentos_fallidos) || 0) + 1;

    if (intentos >= MAX_INTENTOS_FALLIDOS) {
      const bloqueoHasta = new Date(Date.now() + MINUTOS_BLOQUEO * 60 * 1000);
      await usuarioRepository.incrementarIntentosFallidos(user.id_usuario, intentos, {
        bloqueado: true,
        bloqueoHasta,
      });
      throw httpError(
        423,
        `Cuenta bloqueada temporalmente tras ${MAX_INTENTOS_FALLIDOS} intentos fallidos`,
      );
    }

    await usuarioRepository.incrementarIntentosFallidos(user.id_usuario, intentos);
    throw httpError(401, 'Credenciales inválidas');
  }

  await usuarioRepository.registrarAccesoExitoso(user.id_usuario);

  const token = generateToken(user);

  return { token, user: toSafeUser(user) };
}

export { registerUser, loginUser, getUserById };
