const productoRepository = require('../repositories/producto.repository');
const httpError = require('../utils/httpError');

async function findById(id) {
  return productoRepository.findById(id);
}

async function findByCodigoBarras(codigoBarras) {
  return productoRepository.findByCodigoBarras(codigoBarras);
}

async function ensureCodigoBarrasAvailable(codigoBarras, excludeId) {
  const disponible = await productoRepository.codigoBarrasDisponible(codigoBarras, excludeId);
  if (!disponible) {
    throw httpError(409, 'El código de barras ya se encuentra registrado');
  }
}

async function ensureCategoriaExists(idCategoria) {
  const exists = await productoRepository.existsCategoria(idCategoria);
  if (!exists) {
    throw httpError(400, 'La categoría especificada no existe');
  }
}

async function ensureUnidadExists(idUnidad) {
  const exists = await productoRepository.existsUnidad(idUnidad);
  if (!exists) {
    throw httpError(400, 'La unidad de medida especificada no existe');
  }
}

async function list(filters = {}) {
  return productoRepository.list(filters);
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

  return productoRepository.create(p);
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

  const partial = {};

  if (data.codigo_barras !== undefined) {
    partial.codigo_barras =
      data.codigo_barras !== null && data.codigo_barras.trim() ? data.codigo_barras.trim() : null;
  }

  if (data.nombre !== undefined) {
    partial.nombre = data.nombre.trim();
  }

  if (data.descripcion !== undefined) {
    partial.descripcion = data.descripcion === null || data.descripcion === '' ? null : data.descripcion.trim();
  }

  if (data.id_categoria !== undefined) {
    partial.id_categoria = data.id_categoria === null ? null : data.id_categoria;
  }

  if (data.id_unidad_de_medida !== undefined) {
    partial.id_unidad_de_medida = data.id_unidad_de_medida === null ? null : data.id_unidad_de_medida;
  }

  if (data.precio_venta !== undefined) {
    partial.precio_venta = data.precio_venta;
  }

  if (data.precio_compra !== undefined) {
    partial.precio_compra = data.precio_compra;
  }

  if (data.precio_minimo !== undefined) {
    partial.precio_minimo = data.precio_minimo;
  }

  if (data.porcentaje_iva !== undefined) {
    partial.porcentaje_iva = data.porcentaje_iva;
  }

  if (data.caducidad !== undefined) {
    partial.caducidad = data.caducidad === null ? null : data.caducidad;
  }

  if (data.activo !== undefined) {
    partial.activo = data.activo ? 1 : 0;
  }

  if (Object.keys(partial).length === 0) {
    return findById(id);
  }

  return productoRepository.update(id, partial);
}

async function remove(id) {
  try {
    return await productoRepository.remove(id);
  } catch (err) {
    const code = err && err.driverError && err.driverError.code;
    if (code === 'ER_ROW_IS_REFERENCED_2') {
      throw httpError(409, 'El producto tiene registros relacionados y no puede eliminarse');
    }
    throw err;
  }
}

module.exports = { list, findById, findByCodigoBarras, create, update, remove };
