import dataSource from "../config/data-source.js";

const categoriaRepo = () => dataSource.getRepository('categorias');

async function list() {
  return categoriaRepo().find({ order: { id_categoria: 'ASC' } });
}

async function findById(id) {
  return categoriaRepo().findOneBy({ id_categoria: id });
}

async function create(data) {
  const result = await categoriaRepo().insert(data);
  return findById(result.identifiers[0].id_categoria);
}

async function update(id, data) {
  await categoriaRepo().update(id, data);
  return findById(id);
}

async function remove(id) {
  const result = await categoriaRepo().delete(id);
  return result.affected > 0;
}

export { list, findById, create, update, remove };
