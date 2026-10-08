import * as inventarioRepository from "../repositories/inventario.repository.js";
import httpError from "../utils/httpError.js";

function mapStockRow(row) {
  return { ...row, stock_critico: Boolean(row.stock_critico) };
}

async function listStock() {
  const rows = await inventarioRepository.listStock();
  return rows.map(mapStockRow);
}

async function findStockByProducto(productoId) {
  const producto = await inventarioRepository.findProductoResumen(productoId);

  if (!producto) {
    return null;
  }

  const inv = await inventarioRepository.findInventarioByProducto(productoId);

  if (!inv) {
    return {
      producto_id: producto.id_producto,
      codigo_barras: producto.codigo_barras,
      producto: producto.nombre,
      producto_activo: producto.activo,
      id_inventario: null,
      stock_actual: 0,
      stock_minimo: 0,
      stock_maximo: null,
      stock_reservado: 0,
      expira_en: null,
      actualizado_en: null,
      stock_critico: false,
      nivel_alerta: 'NORMAL',
      tiene_registro_inventario: false,
    };
  }

  return {
    producto_id: producto.id_producto,
    codigo_barras: producto.codigo_barras,
    producto: producto.nombre,
    producto_activo: producto.activo,
    id_inventario: inv.id_inventario,
    stock_actual: inv.stock_actual,
    stock_minimo: inv.stock_minimo,
    stock_maximo: inv.stock_maximo,
    stock_reservado: inv.stock_reservado,
    expira_en: inv.expira_en,
    actualizado_en: inv.actualizado_en,
    stock_critico: inv.stock_actual <= inv.stock_minimo,
    nivel_alerta:
      inv.stock_actual === 0
        ? 'AGOTADO'
        : inv.stock_actual <= inv.stock_minimo
          ? 'CRÍTICO'
          : 'NORMAL',
    tiene_registro_inventario: true,
  };
}

async function findEntradaById(id) {
  return inventarioRepository.findEntradaById(id);
}

async function registerEntrada(data, creadoPor) {
  try {
    const idEntrada = await inventarioRepository.transaction(async (entityManager) => {
      const productoExiste = await inventarioRepository.existsProducto(entityManager, data.producto_id);
      if (!productoExiste) {
        throw httpError(404, 'Producto no encontrado');
      }

      if (data.orden_compra_id !== undefined && data.orden_compra_id !== null) {
        const ordenExiste = await inventarioRepository.existsOrdenCompra(entityManager, data.orden_compra_id);
        if (!ordenExiste) {
          throw httpError(400, 'La orden de compra especificada no existe');
        }
      }

      return inventarioRepository.insertEntrada(entityManager, {
        producto_id: data.producto_id,
        orden_compra_id: data.orden_compra_id ?? null,
        numero_factura_proveedor: data.numero_factura_proveedor ?? null,
        tipo_referencia: data.tipo_referencia ?? null,
        cantidad: data.cantidad,
        notas: data.notas ?? null,
        creado_por: creadoPor,
      });
    });

    return findEntradaById(idEntrada);
  } catch (err) {
    const code = err && err.driverError && err.driverError.code;
    if (code === 'ER_NO_REFERENCED_ROW_2') {
      throw httpError(400, 'El usuario o la referencia especificada no existe');
    }
    throw err;
  }
}

async function listMovimientos(filters = {}) {
  return inventarioRepository.listMovimientos(filters);
}

export {
  listStock,
  findStockByProducto,
  registerEntrada,
  listMovimientos,
};
