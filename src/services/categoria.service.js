import * as categoriaRepository from "../repositories/categoria.repository.js";

async function list() {
  return categoriaRepository.list();
}

async function findById(id) {
  return categoriaRepository.findById(id);
}

async function create(data) {
  const nombre = data.nombre.trim();
  const descripcion = data.descripcion ? data.descripcion.trim() : null;
  const activo = data.activo === undefined || data.activo === null ? 1 : data.activo ? 1 : 0;

  return categoriaRepository.create({ nombre, descripcion, activo });
}

async function update(id, data) {
  const partial = {};

  if (data.nombre !== undefined) {
    partial.nombre = data.nombre.trim();
  }

  if (data.descripcion !== undefined) {
    partial.descripcion = data.descripcion === null || data.descripcion === '' ? null : data.descripcion.trim();
  }

  if (data.activo !== undefined) {
    partial.activo = data.activo ? 1 : 0;
  }

  if (Object.keys(partial).length === 0) {
    return findById(id);
  }

  return categoriaRepository.update(id, partial);
}

async function remove(id) {
  return categoriaRepository.remove(id);
}

export { list, findById, create, update, remove };
