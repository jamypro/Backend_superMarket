import dataSource from "../config/data-source.js";

const productoRepo = () => dataSource.getRepository('productos');
const inventarioRepo = () => dataSource.getRepository('inventario');
const entradaRepo = () => dataSource.getRepository('entrada_inventario');

function stockQuery() {
  return inventarioRepo()
    .createQueryBuilder('inv')
    .select([])
    .innerJoin('productos', 'p', 'p.id_producto = inv.producto_id')
    .addSelect('inv.id_inventario', 'id_inventario')
    .addSelect('inv.producto_id', 'producto_id')
    .addSelect('p.codigo_barras', 'codigo_barras')
    .addSelect('p.nombre', 'producto')
    .addSelect('p.activo', 'producto_activo')
    .addSelect('inv.stock_actual', 'stock_actual')
    .addSelect('inv.stock_minimo', 'stock_minimo')
    .addSelect('inv.stock_maximo', 'stock_maximo')
    .addSelect('inv.stock_reservado', 'stock_reservado')
    .addSelect('inv.expira_en', 'expira_en')
    .addSelect('inv.actualizado_en', 'actualizado_en')
    .addSelect('(inv.stock_actual <= inv.stock_minimo)', 'stock_critico')
    .addSelect(
      "CASE WHEN inv.stock_actual = 0 THEN 'AGOTADO' WHEN inv.stock_actual <= inv.stock_minimo THEN 'CRÍTICO' ELSE 'NORMAL' END",
      'nivel_alerta'
    );
}

function entradaQuery() {
  return entradaRepo()
    .createQueryBuilder('e')
    .select([])
    .innerJoin('productos', 'p', 'p.id_producto = e.producto_id')
    .addSelect('e.id_entrada_inventario', 'id_entrada_inventario')
    .addSelect('e.producto_id', 'producto_id')
    .addSelect('p.codigo_barras', 'codigo_barras')
    .addSelect('p.nombre', 'producto')
    .addSelect('e.cantidad', 'cantidad')
    .addSelect('e.tipo_referencia', 'tipo_referencia')
    .addSelect('e.numero_factura_proveedor', 'numero_factura_proveedor')
    .addSelect('e.orden_compra_id', 'orden_compra_id')
    .addSelect('e.notas', 'notas')
    .addSelect('e.creado_por', 'creado_por')
    .addSelect('e.created_at', 'created_at')
    .addSelect("'ENTRADA'", 'tipo');
}

async function listStock() {
  const rows = await stockQuery().orderBy('p.nombre', 'ASC').getRawMany();
  return rows;
}

async function findProductoResumen(productoId) {
  return productoRepo().findOne({
    select: ['id_producto', 'codigo_barras', 'nombre', 'activo'],
    where: { id_producto: productoId },
  });
}

async function findInventarioByProducto(productoId) {
  return inventarioRepo().findOne({
    select: [
      'id_inventario',
      'stock_actual',
      'stock_minimo',
      'stock_maximo',
      'stock_reservado',
      'expira_en',
      'actualizado_en',
    ],
    where: { producto_id: productoId },
  });
}

async function findEntradaById(id) {
  const rows = await entradaQuery().where('e.id_entrada_inventario = :id', { id }).getRawMany();
  return rows[0] || null;
}

async function existsProducto(entityManager, productoId) {
  return Boolean(await entityManager.getRepository('productos').findOneBy({ id_producto: productoId }));
}

async function existsOrdenCompra(entityManager, ordenCompraId) {
  return Boolean(await entityManager.getRepository('ordenes_compra').findOneBy({ id_orden_compra: ordenCompraId }));
}

async function insertEntrada(entityManager, data) {
  const result = await entityManager.getRepository('entrada_inventario').insert(data);
  return result.identifiers[0].id_entrada_inventario;
}

async function listMovimientos(filters = {}) {
  const qb = entradaQuery();

  if (filters.producto_id !== undefined && filters.producto_id !== null) {
    qb.andWhere('e.producto_id = :producto_id', { producto_id: filters.producto_id });
  }

  if (filters.orden_compra_id !== undefined && filters.orden_compra_id !== null) {
    qb.andWhere('e.orden_compra_id = :orden_compra_id', { orden_compra_id: filters.orden_compra_id });
  }

  if (filters.tipo_referencia) {
    qb.andWhere('e.tipo_referencia = :tipo_referencia', { tipo_referencia: filters.tipo_referencia });
  }

  if (filters.fecha_inicio) {
    qb.andWhere('e.created_at >= :fecha_inicio', { fecha_inicio: `${filters.fecha_inicio} 00:00:00` });
  }

  if (filters.fecha_fin) {
    qb.andWhere('e.created_at <= :fecha_fin', { fecha_fin: `${filters.fecha_fin} 23:59:59` });
  }

  qb.orderBy('e.created_at', 'DESC');

  return qb.getRawMany();
}

function transaction(callback) {
  return dataSource.transaction(callback);
}

export {
  transaction,
  listStock,
  findProductoResumen,
  findInventarioByProducto,
  findEntradaById,
  existsProducto,
  existsOrdenCompra,
  insertEntrada,
  listMovimientos,
};
