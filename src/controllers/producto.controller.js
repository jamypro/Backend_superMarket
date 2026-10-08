import {
  validateProducto,
  validateProductoUpdate,
  validateId,
} from "../validators/producto.validator.js";
import * as productoService from "../services/producto.service.js";
import httpError from "../utils/httpError.js";

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

  if (query.codigo_barras !== undefined && query.codigo_barras !== '') {
    filters.codigo_barras = query.codigo_barras;
  }

  if (query.id_categoria !== undefined && query.id_categoria !== '') {
    if (!validateId(query.id_categoria)) {
      throw httpError(400, 'El parámetro "id_categoria" debe ser un número entero positivo');
    }
    filters.id_categoria = Number(query.id_categoria);
  }

  if (query.activo !== undefined && query.activo !== '') {
    if (!['0', '1', 'true', 'false'].includes(query.activo)) {
      throw httpError(400, 'El parámetro "activo" debe ser 0 o 1');
    }
    filters.activo = query.activo === '1' || query.activo === 'true';
  }

  return filters;
}

async function list(req, res) {
  const filters = parseFilters(req.query);
  const productos = await productoService.list(filters);

  res.status(200).json({
    success: true,
    message: 'Productos obtenidos correctamente',
    data: productos,
  });
}

async function getById(req, res) {
  const id = parseId(req.params.id);

  const producto = await productoService.findById(id);
  if (!producto) {
    throw httpError(404, 'Producto no encontrado');
  }

  res.status(200).json({
    success: true,
    message: 'Producto obtenido correctamente',
    data: producto,
  });
}

async function create(req, res) {
  const errors = validateProducto(req.body);
  if (errors.length > 0) {
    throw httpError(400, errors.join('; '));
  }

  const producto = await productoService.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Producto creado correctamente',
    data: producto,
  });
}

async function update(req, res) {
  const id = parseId(req.params.id);

  const errors = validateProductoUpdate(req.body);
  if (errors.length > 0) {
    throw httpError(400, errors.join('; '));
  }

  const existing = await productoService.findById(id);
  if (!existing) {
    throw httpError(404, 'Producto no encontrado');
  }

  const producto = await productoService.update(id, req.body);

  res.status(200).json({
    success: true,
    message: 'Producto actualizado correctamente',
    data: producto,
  });
}

async function remove(req, res) {
  const id = parseId(req.params.id);

  const removed = await productoService.remove(id);
  if (!removed) {
    throw httpError(404, 'Producto no encontrado');
  }

  res.status(200).json({
    success: true,
    message: 'Producto eliminado correctamente',
  });
}

export { list, getById, create, update, remove };
