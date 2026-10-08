const NOMBRE_MAX_LENGTH = 100;

function isString(value) {
  return typeof value === 'string';
}

function validateId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0;
}

function validateCategoria(body = {}) {
  const errors = [];

  const { nombre, descripcion, activo } = body;

  if (!isString(nombre) || !nombre.trim()) {
    errors.push('El campo "nombre" es obligatorio');
  } else if (nombre.trim().length > NOMBRE_MAX_LENGTH) {
    errors.push(`El campo "nombre" no debe superar ${NOMBRE_MAX_LENGTH} caracteres`);
  }

  if (descripcion !== undefined && descripcion !== null && !isString(descripcion)) {
    errors.push('El campo "descripcion" debe ser texto');
  }

  if (activo !== undefined && activo !== null && ![0, 1, true, false].includes(activo)) {
    errors.push('El campo "activo" debe ser 0 o 1');
  }

  return errors;
}

function validateCategoriaUpdate(body = {}) {
  const errors = [];

  if (Object.keys(body).length === 0) {
    errors.push('Debe enviar al menos un campo para actualizar');
  }

  const { nombre, descripcion, activo } = body;

  if (nombre !== undefined) {
    if (!isString(nombre) || !nombre.trim()) {
      errors.push('El campo "nombre" debe ser texto no vacío');
    } else if (nombre.trim().length > NOMBRE_MAX_LENGTH) {
      errors.push(`El campo "nombre" no debe superar ${NOMBRE_MAX_LENGTH} caracteres`);
    }
  }

  if (descripcion !== undefined && descripcion !== null && !isString(descripcion)) {
    errors.push('El campo "descripcion" debe ser texto');
  }

  if (activo !== undefined && activo !== null && ![0, 1, true, false].includes(activo)) {
    errors.push('El campo "activo" debe ser 0 o 1');
  }

  return errors;
}

export { validateCategoria, validateCategoriaUpdate, validateId };
