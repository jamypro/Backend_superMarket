const NOMBRE_MAX_LENGTH = 200;
const CODIGO_BARRAS_MAX_LENGTH = 50;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isString(value) {
  return typeof value === 'string';
}

function validateId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0;
}

function isNonNegativeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isValidDate(value) {
  if (!isString(value) || !DATE_REGEX.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.toISOString().slice(0, 10) === value;
}

function validateActivo(activo, errors) {
  if (activo !== undefined && activo !== null && ![0, 1, true, false].includes(activo)) {
    errors.push('El campo "activo" debe ser 0 o 1');
  }
}

function validateProducto(body = {}) {
  const errors = [];

  const {
    codigo_barras,
    nombre,
    descripcion,
    id_categoria,
    id_unidad_de_medida,
    precio_venta,
    precio_compra,
    precio_minimo,
    porcentaje_iva,
    caducidad,
    activo,
  } = body;

  if (!isString(nombre) || !nombre.trim()) {
    errors.push('El campo "nombre" es obligatorio');
  } else if (nombre.trim().length > NOMBRE_MAX_LENGTH) {
    errors.push(`El campo "nombre" no debe superar ${NOMBRE_MAX_LENGTH} caracteres`);
  }

  if (codigo_barras !== undefined && codigo_barras !== null) {
    if (!isString(codigo_barras)) {
      errors.push('El campo "codigo_barras" debe ser texto');
    } else if (codigo_barras.trim().length > CODIGO_BARRAS_MAX_LENGTH) {
      errors.push(`El campo "codigo_barras" no debe superar ${CODIGO_BARRAS_MAX_LENGTH} caracteres`);
    }
  }

  if (descripcion !== undefined && descripcion !== null && !isString(descripcion)) {
    errors.push('El campo "descripcion" debe ser texto');
  }

  if (id_categoria !== undefined && id_categoria !== null && !validateId(id_categoria)) {
    errors.push('El campo "id_categoria" debe ser un número entero positivo');
  }

  if (id_unidad_de_medida !== undefined && id_unidad_de_medida !== null && !validateId(id_unidad_de_medida)) {
    errors.push('El campo "id_unidad_de_medida" debe ser un número entero positivo');
  }

  if (precio_venta !== undefined && precio_venta !== null && !isNonNegativeNumber(precio_venta)) {
    errors.push('El campo "precio_venta" debe ser un número mayor o igual a 0');
  }

  if (precio_compra !== undefined && precio_compra !== null && !isNonNegativeNumber(precio_compra)) {
    errors.push('El campo "precio_compra" debe ser un número mayor o igual a 0');
  }

  if (precio_minimo !== undefined && precio_minimo !== null && !isNonNegativeNumber(precio_minimo)) {
    errors.push('El campo "precio_minimo" debe ser un número mayor o igual a 0');
  }

  if (porcentaje_iva !== undefined && porcentaje_iva !== null && !isNonNegativeNumber(porcentaje_iva)) {
    errors.push('El campo "porcentaje_iva" debe ser un número mayor o igual a 0');
  }

  if (caducidad !== undefined && caducidad !== null && !isValidDate(caducidad)) {
    errors.push('El campo "caducidad" debe ser una fecha válida con formato YYYY-MM-DD');
  }

  validateActivo(activo, errors);

  return errors;
}

function validateProductoUpdate(body = {}) {
  const errors = [];

  if (Object.keys(body).length === 0) {
    errors.push('Debe enviar al menos un campo para actualizar');
  }

  const {
    codigo_barras,
    nombre,
    descripcion,
    id_categoria,
    id_unidad_de_medida,
    precio_venta,
    precio_compra,
    precio_minimo,
    porcentaje_iva,
    caducidad,
    activo,
  } = body;

  if (nombre !== undefined) {
    if (!isString(nombre) || !nombre.trim()) {
      errors.push('El campo "nombre" debe ser texto no vacío');
    } else if (nombre.trim().length > NOMBRE_MAX_LENGTH) {
      errors.push(`El campo "nombre" no debe superar ${NOMBRE_MAX_LENGTH} caracteres`);
    }
  }

  if (codigo_barras !== undefined && codigo_barras !== null) {
    if (!isString(codigo_barras)) {
      errors.push('El campo "codigo_barras" debe ser texto');
    } else if (codigo_barras.trim().length > CODIGO_BARRAS_MAX_LENGTH) {
      errors.push(`El campo "codigo_barras" no debe superar ${CODIGO_BARRAS_MAX_LENGTH} caracteres`);
    }
  }

  if (descripcion !== undefined && descripcion !== null && !isString(descripcion)) {
    errors.push('El campo "descripcion" debe ser texto');
  }

  if (id_categoria !== undefined && id_categoria !== null && !validateId(id_categoria)) {
    errors.push('El campo "id_categoria" debe ser un número entero positivo');
  }

  if (id_unidad_de_medida !== undefined && id_unidad_de_medida !== null && !validateId(id_unidad_de_medida)) {
    errors.push('El campo "id_unidad_de_medida" debe ser un número entero positivo');
  }

  if (precio_venta !== undefined && precio_venta !== null && !isNonNegativeNumber(precio_venta)) {
    errors.push('El campo "precio_venta" debe ser un número mayor o igual a 0');
  }

  if (precio_compra !== undefined && precio_compra !== null && !isNonNegativeNumber(precio_compra)) {
    errors.push('El campo "precio_compra" debe ser un número mayor o igual a 0');
  }

  if (precio_minimo !== undefined && precio_minimo !== null && !isNonNegativeNumber(precio_minimo)) {
    errors.push('El campo "precio_minimo" debe ser un número mayor o igual a 0');
  }

  if (porcentaje_iva !== undefined && porcentaje_iva !== null && !isNonNegativeNumber(porcentaje_iva)) {
    errors.push('El campo "porcentaje_iva" debe ser un número mayor o igual a 0');
  }

  if (caducidad !== undefined && caducidad !== null && !isValidDate(caducidad)) {
    errors.push('El campo "caducidad" debe ser una fecha válida con formato YYYY-MM-DD');
  }

  validateActivo(activo, errors);

  return errors;
}

module.exports = { validateProducto, validateProductoUpdate, validateId };
