const {
  validateCategoria,
  validateCategoriaUpdate,
  validateId,
} = require('../validators/categoria.validator');
const categoriaService = require('../services/categoria.service');
const httpError = require('../utils/httpError');

function parseId(rawId) {
  if (!validateId(rawId)) {
    throw httpError(400, 'El identificador debe ser un número entero positivo');
  }
  return Number(rawId);
}

async function list(req, res) {
  const categorias = await categoriaService.list();

  res.status(200).json({
    success: true,
    message: 'Categorías obtenidas correctamente',
    data: categorias,
  });
}

async function getById(req, res) {
  const id = parseId(req.params.id);

  const categoria = await categoriaService.findById(id);
  if (!categoria) {
    throw httpError(404, 'Categoría no encontrada');
  }

  res.status(200).json({
    success: true,
    message: 'Categoría obtenida correctamente',
    data: categoria,
  });
}

async function create(req, res) {
  const errors = validateCategoria(req.body);
  if (errors.length > 0) {
    throw httpError(400, errors.join('; '));
  }

  const categoria = await categoriaService.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Categoría creada correctamente',
    data: categoria,
  });
}

async function update(req, res) {
  const id = parseId(req.params.id);

  const errors = validateCategoriaUpdate(req.body);
  if (errors.length > 0) {
    throw httpError(400, errors.join('; '));
  }

  const existing = await categoriaService.findById(id);
  if (!existing) {
    throw httpError(404, 'Categoría no encontrada');
  }

  const categoria = await categoriaService.update(id, req.body);

  res.status(200).json({
    success: true,
    message: 'Categoría actualizada correctamente',
    data: categoria,
  });
}

async function remove(req, res) {
  const id = parseId(req.params.id);

  const removed = await categoriaService.remove(id);
  if (!removed) {
    throw httpError(404, 'Categoría no encontrada');
  }

  res.status(200).json({
    success: true,
    message: 'Categoría eliminada correctamente',
  });
}

module.exports = { list, getById, create, update, remove };
