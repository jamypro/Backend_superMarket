const {
  validateUsuario,
  validateUsuarioUpdate,
  validatePasswordChange,
  validateId,
} = require('../validators/usuario.validator');
const usuarioService = require('../services/usuario.service');
const httpError = require('../utils/httpError');

function parseId(rawId) {
  if (!validateId(rawId)) {
    throw httpError(400, 'El identificador debe ser un número entero positivo');
  }
  return Number(rawId);
}

function parseFilters(query = {}) {
  const filters = {};

  if (query.nombre !== undefined && query.nombre !== '') {
    filters.nombre = query.nombre;
  }

  if (query.correo !== undefined && query.correo !== '') {
    filters.correo = query.correo;
  }

  if (query.documento !== undefined && query.documento !== '') {
    filters.documento = query.documento;
  }

  if (query.rol_id !== undefined && query.rol_id !== '') {
    if (!validateId(query.rol_id)) {
      throw httpError(400, 'El parámetro "rol_id" debe ser un número entero positivo');
    }
    filters.rol_id = Number(query.rol_id);
  }

  if (query.estado !== undefined && query.estado !== '') {
    if (!['0', '1', 'true', 'false'].includes(query.estado)) {
      throw httpError(400, 'El parámetro "estado" debe ser 0 o 1');
    }
    filters.estado = query.estado === '1' || query.estado === 'true';
  }

  return filters;
}

async function list(req, res) {
  const filters = parseFilters(req.query);
  const usuarios = await usuarioService.list(filters);

  res.status(200).json({
    success: true,
    message: 'Usuarios obtenidos correctamente',
    data: usuarios,
  });
}

async function getById(req, res) {
  const id = parseId(req.params.id);

  const usuario = await usuarioService.findById(id);
  if (!usuario) {
    throw httpError(404, 'Usuario no encontrado');
  }

  res.status(200).json({
    success: true,
    message: 'Usuario obtenido correctamente',
    data: usuario,
  });
}

async function create(req, res) {
  const errors = validateUsuario(req.body);
  if (errors.length > 0) {
    throw httpError(400, errors.join('; '));
  }

  const usuario = await usuarioService.create(req.body, req.user && req.user.userId);

  res.status(201).json({
    success: true,
    message: 'Usuario creado correctamente',
    data: usuario,
  });
}

async function update(req, res) {
  const id = parseId(req.params.id);

  const errors = validateUsuarioUpdate(req.body);
  if (errors.length > 0) {
    throw httpError(400, errors.join('; '));
  }

  const usuario = await usuarioService.update(id, req.body);
  if (!usuario) {
    throw httpError(404, 'Usuario no encontrado');
  }

  res.status(200).json({
    success: true,
    message: 'Usuario actualizado correctamente',
    data: usuario,
  });
}

async function changePassword(req, res) {
  const id = parseId(req.params.id);

  const errors = validatePasswordChange(req.body);
  if (errors.length > 0) {
    throw httpError(400, errors.join('; '));
  }

  const existing = await usuarioService.findById(id);
  if (!existing) {
    throw httpError(404, 'Usuario no encontrado');
  }

  await usuarioService.changePassword(id, req.body.contrasena);

  res.status(200).json({
    success: true,
    message: 'Contraseña actualizada correctamente',
  });
}

async function remove(req, res) {
  const id = parseId(req.params.id);
  const currentUserId = req.user && req.user.userId;

  const removed = await usuarioService.remove(id, currentUserId);
  if (!removed) {
    throw httpError(404, 'Usuario no encontrado');
  }

  res.status(200).json({
    success: true,
    message: 'Usuario eliminado correctamente',
  });
}

module.exports = { list, getById, create, update, changePassword, remove };
