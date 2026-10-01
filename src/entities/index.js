const base = require('./base.entities');
const catalogo = require('./catalogo.entities');
const proveedores = require('./proveedores.entities');
const inventario = require('./inventario.entities');
const ventas = require('./ventas.entities');
const devoluciones = require('./devoluciones.entities');
const auditoria = require('./auditoria.entities');
const prediccion = require('./prediccion.entities');
const ecommerce = require('./ecommerce.entities');
const configuracion = require('./configuracion.entities');

const entities = [
  ...Object.values(base),
  ...Object.values(catalogo),
  ...Object.values(proveedores),
  ...Object.values(inventario),
  ...Object.values(ventas),
  ...Object.values(devoluciones),
  ...Object.values(auditoria),
  ...Object.values(prediccion),
  ...Object.values(ecommerce),
  ...Object.values(configuracion),
];

module.exports = { entities };
