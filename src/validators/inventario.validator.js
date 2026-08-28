const TIPO_REFERENCIA_MAX_LENGTH = 50;
const NUMERO_FACTURA_MAX_LENGTH = 50;
const MAX_CANTIDAD = 2147483647;

function isString(value) {
  return typeof value === 'string';
}

function validateId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0;
}

function validateFecha(value) {
  if (!isString(value)) {
    return false;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  return date.toISOString().slice(0, 10) === value;
}

function validateEntrada(body = {}) {
  const errors = [];

  const {
    producto_id,
    cantidad,
    tipo_referencia,
    numero_factura_proveedor,
    notas,
    orden_compra_id,
  } = body;

  if (producto_id === undefined || producto_id === null) {
    errors.push('El campo "producto_id" es obligatorio');
  } else if (!validateId(producto_id)) {
    errors.push('El campo "producto_id" debe ser un número entero positivo');
  }

  if (cantidad === undefined || cantidad === null) {
    errors.push('El campo "cantidad" es obligatorio');
  } else if (!Number.isInteger(cantidad) || cantidad <= 0) {
    errors.push('El campo "cantidad" debe ser un número entero mayor que 0');
  } else if (cantidad > MAX_CANTIDAD) {
    errors.push(`El campo "cantidad" no debe superar ${MAX_CANTIDAD}`);
  }

  if (tipo_referencia !== undefined && tipo_referencia !== null) {
    if (!isString(tipo_referencia)) {
      errors.push('El campo "tipo_referencia" debe ser texto');
    } else if (tipo_referencia.trim().length > TIPO_REFERENCIA_MAX_LENGTH) {
      errors.push(`El campo "tipo_referencia" no debe superar ${TIPO_REFERENCIA_MAX_LENGTH} caracteres`);
    }
  }

  if (numero_factura_proveedor !== undefined && numero_factura_proveedor !== null) {
    if (!isString(numero_factura_proveedor)) {
      errors.push('El campo "numero_factura_proveedor" debe ser texto');
    } else if (numero_factura_proveedor.trim().length > NUMERO_FACTURA_MAX_LENGTH) {
      errors.push(`El campo "numero_factura_proveedor" no debe superar ${NUMERO_FACTURA_MAX_LENGTH} caracteres`);
    }
  }

  if (notas !== undefined && notas !== null && !isString(notas)) {
    errors.push('El campo "notas" debe ser texto');
  }

  if (orden_compra_id !== undefined && orden_compra_id !== null && !validateId(orden_compra_id)) {
    errors.push('El campo "orden_compra_id" debe ser un número entero positivo');
  }

  return errors;
}

module.exports = { validateEntrada, validateId, validateFecha };
