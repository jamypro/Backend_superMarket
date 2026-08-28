const {
  validateEntrada,
  validateId,
  validateFecha,
} = require('../validators/inventario.validator');
const inventarioService = require('../services/inventario.service');
const httpError = require('../utils/httpError');

function parseId(rawId) {
  if (!validateId(rawId)) {
    throw httpError(400, 'El identificador debe ser un número entero positivo');
  }
  return Number(rawId);
}

function parseMovimientoFilters(query = {}) {
  const filters = {};

  if (query.producto_id !== undefined && query.producto_id !== '') {
    if (!validateId(query.producto_id)) {
      throw httpError(400, 'El parámetro "producto_id" debe ser un número entero positivo');
    }
    filters.producto_id = Number(query.producto_id);
  }

  if (query.orden_compra_id !== undefined && query.orden_compra_id !== '') {
    if (!validateId(query.orden_compra_id)) {
      throw httpError(400, 'El parámetro "orden_compra_id" debe ser un número entero positivo');
    }
    filters.orden_compra_id = Number(query.orden_compra_id);
  }

  if (query.tipo_referencia !== undefined && query.tipo_referencia !== '') {
    filters.tipo_referencia = query.tipo_referencia;
  }

  if (query.fecha_inicio !== undefined && query.fecha_inicio !== '') {
    if (!validateFecha(query.fecha_inicio)) {
      throw httpError(400, 'El parámetro "fecha_inicio" debe ser una fecha válida con formato YYYY-MM-DD');
    }
    filters.fecha_inicio = query.fecha_inicio;
  }

  if (query.fecha_fin !== undefined && query.fecha_fin !== '') {
    if (!validateFecha(query.fecha_fin)) {
      throw httpError(400, 'El parámetro "fecha_fin" debe ser una fecha válida con formato YYYY-MM-DD');
    }
    filters.fecha_fin = query.fecha_fin;
  }

  return filters;
}

async function list(req, res) {
  const inventario = await inventarioService.listStock();

  res.status(200).json({
    success: true,
    message: 'Inventario obtenido correctamente',
    data: inventario,
  });
}

async function getByProducto(req, res) {
  const productoId = parseId(req.params.productoId);

  const stock = await inventarioService.findStockByProducto(productoId);
  if (!stock) {
    throw httpError(404, 'Producto no encontrado');
  }

  res.status(200).json({
    success: true,
    message: 'Inventario del producto obtenido correctamente',
    data: stock,
  });
}

async function registrarEntrada(req, res) {
  const errors = validateEntrada(req.body);
  if (errors.length > 0) {
    throw httpError(400, errors.join('; '));
  }

  const creadoPor = req.user && req.user.userId;
  if (!creadoPor) {
    throw httpError(401, 'No se pudo determinar el usuario autenticado');
  }

  const entrada = await inventarioService.registerEntrada(req.body, creadoPor);

  res.status(201).json({
    success: true,
    message: 'Entrada de inventario registrada correctamente',
    data: entrada,
  });
}

async function listMovimientos(req, res) {
  const filters = parseMovimientoFilters(req.query);

  const movimientos = await inventarioService.listMovimientos(filters);

  res.status(200).json({
    success: true,
    message: 'Movimientos de inventario obtenidos correctamente',
    data: movimientos,
  });
}

module.exports = { list, getByProducto, registrarEntrada, listMovimientos };
