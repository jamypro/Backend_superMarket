import * as base from "./base.entities.js";
import * as catalogo from "./catalogo.entities.js";
import * as proveedores from "./proveedores.entities.js";
import * as inventario from "./inventario.entities.js";
import * as ventas from "./ventas.entities.js";
import * as devoluciones from "./devoluciones.entities.js";
import * as auditoria from "./auditoria.entities.js";
import * as prediccion from "./prediccion.entities.js";
import * as ecommerce from "./ecommerce.entities.js";
import * as configuracion from "./configuracion.entities.js";

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

export { entities };
