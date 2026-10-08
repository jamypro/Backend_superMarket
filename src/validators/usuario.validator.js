const NOMBRE_MAX_LENGTH = 100;
const APELLIDO_MAX_LENGTH = 100;
const DOCUMENTO_MAX_LENGTH = 20;
const CORREO_MAX_LENGTH = 150;
const TELEFONO_MAX_LENGTH = 20;
const MIN_PASSWORD_LENGTH = 8;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO_REGEX = /^[0-9+\-\s()]+$/;
const TIPOS_DOCUMENTO = ['CC', 'NIT', 'CE', 'Pasaporte'];

function isString(value) {
  return typeof value === 'string';
}

function validateId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0;
}

function validateActivo(activo, errors) {
  if (activo !== undefined && activo !== null && ![0, 1, true, false].includes(activo)) {
    errors.push('El campo "estado" debe ser 0 o 1');
  }
}

function validateNombre(nombre, errors) {
  if (nombre !== undefined) {
    if (!isString(nombre) || !nombre.trim()) {
      errors.push('El campo "nombre" debe ser texto no vacío');
    } else if (nombre.trim().length > NOMBRE_MAX_LENGTH) {
      errors.push(`El campo "nombre" no debe superar ${NOMBRE_MAX_LENGTH} caracteres`);
    }
  }
}

function validateApellido(apellido, errors) {
  if (apellido !== undefined && apellido !== null) {
    if (!isString(apellido)) {
      errors.push('El campo "apellido" debe ser texto');
    } else if (apellido.trim().length > APELLIDO_MAX_LENGTH) {
      errors.push(`El campo "apellido" no debe superar ${APELLIDO_MAX_LENGTH} caracteres`);
    }
  }
}

function validateTipoDocumento(tipoDocumento, errors) {
  if (tipoDocumento !== undefined && tipoDocumento !== null) {
    if (!isString(tipoDocumento) || !TIPOS_DOCUMENTO.includes(tipoDocumento)) {
      errors.push(`El campo "tipo_documento" debe ser uno de: ${TIPOS_DOCUMENTO.join(', ')}`);
    }
  }
}

function validateDocumento(documento, errors) {
  if (documento !== undefined && documento !== null && documento !== '') {
    if (!isString(documento)) {
      errors.push('El campo "documento" debe ser texto');
    } else if (documento.trim().length > DOCUMENTO_MAX_LENGTH) {
      errors.push(`El campo "documento" no debe superar ${DOCUMENTO_MAX_LENGTH} caracteres`);
    }
  }
}

function validateCorreo(correo, errors) {
  if (correo !== undefined) {
    if (!isString(correo) || !correo.trim()) {
      errors.push('El campo "correo" es obligatorio');
    } else if (correo.trim().length > CORREO_MAX_LENGTH) {
      errors.push(`El campo "correo" no debe superar ${CORREO_MAX_LENGTH} caracteres`);
    } else if (!EMAIL_REGEX.test(correo.trim())) {
      errors.push('El formato del correo no es válido');
    }
  }
}

function validateTelefono(telefono, errors) {
  if (telefono !== undefined && telefono !== null && telefono !== '') {
    if (!isString(telefono)) {
      errors.push('El campo "telefono" debe ser texto');
    } else if (telefono.trim().length > TELEFONO_MAX_LENGTH) {
      errors.push(`El campo "telefono" no debe superar ${TELEFONO_MAX_LENGTH} caracteres`);
    } else if (!TELEFONO_REGEX.test(telefono.trim())) {
      errors.push('El campo "telefono" solo puede contener números, espacios, +, - y paréntesis');
    }
  }
}

function validateRolId(rolId, errors) {
  if (rolId !== undefined && rolId !== null && !validateId(rolId)) {
    errors.push('El campo "rol_id" debe ser un número entero positivo');
  }
}

function validateContrasena(contrasena, errors) {
  if (contrasena !== undefined) {
    if (!isString(contrasena) || !contrasena) {
      errors.push('El campo "contrasena" es obligatorio');
    } else if (contrasena.length < MIN_PASSWORD_LENGTH) {
      errors.push(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
    }
  }
}

function validateUsuario(body = {}) {
  const errors = [];

  const {
    rol_id,
    nombre,
    apellido,
    tipo_documento,
    documento,
    correo,
    contrasena,
    telefono,
    estado,
  } = body;

  if (rol_id === undefined || rol_id === null) {
    errors.push('El campo "rol_id" es obligatorio');
  } else {
    validateRolId(rol_id, errors);
  }

  if (nombre === undefined || nombre === null) {
    errors.push('El campo "nombre" es obligatorio');
  } else {
    validateNombre(nombre, errors);
  }

  validateApellido(apellido, errors);
  validateTipoDocumento(tipo_documento, errors);
  validateDocumento(documento, errors);
  validateCorreo(correo, errors);
  validateContrasena(contrasena, errors);
  validateTelefono(telefono, errors);
  validateActivo(estado, errors);

  return errors;
}

function validateUsuarioUpdate(body = {}) {
  const errors = [];

  if (Object.keys(body).length === 0) {
    errors.push('Debe enviar al menos un campo para actualizar');
  }

  const { rol_id, nombre, apellido, tipo_documento, documento, correo, telefono, estado } = body;

  validateRolId(rol_id, errors);
  validateNombre(nombre, errors);
  validateApellido(apellido, errors);
  validateTipoDocumento(tipo_documento, errors);
  validateDocumento(documento, errors);
  validateCorreo(correo, errors);
  validateTelefono(telefono, errors);
  validateActivo(estado, errors);

  return errors;
}

function validatePasswordChange(body = {}) {
  const errors = [];

  if (body === null || typeof body !== 'object') {
    errors.push('Debe enviar el campo "contrasena"');
    return errors;
  }

  const { contrasena } = body;

  if (contrasena === undefined || contrasena === null) {
    errors.push('El campo "contrasena" es obligatorio');
  } else {
    validateContrasena(contrasena, errors);
  }

  return errors;
}

export {
  validateUsuario,
  validateUsuarioUpdate,
  validatePasswordChange,
  validateId,
};
