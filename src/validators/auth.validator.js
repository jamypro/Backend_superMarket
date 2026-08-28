const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIN_PASSWORD_LENGTH = 8;

function isString(value) {
  return typeof value === 'string';
}

function validateRegister(body = {}) {
  const errors = [];

  const { nombre, apellido, correo, contrasena, rol_id } = body;

  if (!isString(nombre) || !nombre.trim()) {
    errors.push('El campo "nombre" es obligatorio');
  }

  if (apellido !== undefined && apellido !== null && !isString(apellido)) {
    errors.push('El campo "apellido" debe ser texto');
  }

  if (!isString(correo) || !correo.trim()) {
    errors.push('El campo "correo" es obligatorio');
  } else if (!EMAIL_REGEX.test(correo.trim())) {
    errors.push('El formato del correo no es válido');
  }

  if (!isString(contrasena) || !contrasena) {
    errors.push('El campo "contrasena" es obligatorio');
  } else if (contrasena.length < MIN_PASSWORD_LENGTH) {
    errors.push(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
  }

  if (rol_id !== undefined && rol_id !== null && !(Number.isInteger(rol_id) && rol_id > 0)) {
    errors.push('El campo "rol_id" debe ser un número entero positivo');
  }

  return errors;
}

function validateLogin(body = {}) {
  const errors = [];

  const { correo, contrasena } = body;

  if (!isString(correo) || !correo.trim()) {
    errors.push('El campo "correo" es obligatorio');
  } else if (!EMAIL_REGEX.test(correo.trim())) {
    errors.push('El formato del correo no es válido');
  }

  if (!isString(contrasena) || !contrasena) {
    errors.push('El campo "contrasena" es obligatorio');
  }

  return errors;
}

module.exports = { validateRegister, validateLogin };
