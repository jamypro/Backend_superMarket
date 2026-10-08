import dataSource from "../config/data-source.js";

const productoRepo = () => dataSource.getRepository('productos');

function baseQuery() {
  return productoRepo()
    .createQueryBuilder('p')
    .select([])
    .leftJoin('categorias', 'c', 'c.id_categoria = p.id_categoria')
    .leftJoin('unidades_de_medida', 'u', 'u.id_unidad = p.id_unidad_de_medida')
    .addSelect('p.id_producto', 'id_producto')
    .addSelect('p.codigo_barras', 'codigo_barras')
    .addSelect('p.nombre', 'nombre')
    .addSelect('p.descripcion', 'descripcion')
    .addSelect('p.id_categoria', 'id_categoria')
    .addSelect('c.nombre', 'categoria')
    .addSelect('p.id_unidad_de_medida', 'id_unidad_de_medida')
    .addSelect('u.nombre', 'unidad_medida')
    .addSelect('p.precio_venta', 'precio_venta')
    .addSelect('p.precio_compra', 'precio_compra')
    .addSelect('p.precio_minimo', 'precio_minimo')
    .addSelect('p.porcentaje_iva', 'porcentaje_iva')
    .addSelect('p.caducidad', 'caducidad')
    .addSelect('p.activo', 'activo')
    .addSelect('p.created_at', 'created_at')
    .addSelect('p.updated_at', 'updated_at');
}

async function findById(id) {
  const rows = await baseQuery().where('p.id_producto = :id', { id }).getRawMany();
  return rows[0] || null;
}

async function findByCodigoBarras(codigoBarras) {
  return productoRepo().findOneBy({ codigo_barras: codigoBarras });
}

async function codigoBarrasDisponible(codigoBarras, excludeId = null) {
  const qb = productoRepo().createQueryBuilder('p').where('p.codigo_barras = :codigo_barras', { codigo_barras: codigoBarras });
  if (excludeId !== null && excludeId !== undefined) {
    qb.andWhere('p.id_producto <> :excludeId', { excludeId });
  }
  const found = await qb.getOne();
  return !found;
}

async function existsCategoria(idCategoria) {
  return Boolean(await dataSource.getRepository('categorias').findOneBy({ id_categoria: idCategoria }));
}

async function existsUnidad(idUnidad) {
  return Boolean(await dataSource.getRepository('unidades_de_medida').findOneBy({ id_unidad: idUnidad }));
}

async function list(filters = {}) {
  const qb = baseQuery();

  if (filters.nombre) {
    qb.andWhere('p.nombre LIKE :nombre', { nombre: `%${filters.nombre}%` });
  }

  if (filters.codigo_barras) {
    qb.andWhere('p.codigo_barras = :codigo_barras', { codigo_barras: filters.codigo_barras });
  }

  if (filters.id_categoria !== undefined && filters.id_categoria !== null) {
    qb.andWhere('p.id_categoria = :id_categoria', { id_categoria: filters.id_categoria });
  }

  if (filters.activo !== undefined && filters.activo !== null) {
    qb.andWhere('p.activo = :activo', { activo: filters.activo ? 1 : 0 });
  }

  qb.orderBy('p.nombre', 'ASC');

  return qb.getRawMany();
}

async function create(data) {
  const result = await productoRepo().insert(data);
  const id = result.identifiers[0].id_producto;
  return findById(id);
}

async function update(id, data) {
  await productoRepo().update(id, data);
  return findById(id);
}

async function remove(id) {
  const result = await productoRepo().delete(id);
  return result.affected > 0;
}

export {
  list,
  findById,
  findByCodigoBarras,
  codigoBarrasDisponible,
  existsCategoria,
  existsUnidad,
  create,
  update,
  remove,
};
