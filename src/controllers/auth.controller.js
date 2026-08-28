const { validateRegister, validateLogin } = require('../validators/auth.validator');
const authService = require('../services/auth.service');
const httpError = require('../utils/httpError');

async function register(req, res) {
  const errors = validateRegister(req.body);
  if (errors.length > 0) {
    throw httpError(400, errors.join('; '));
  }

  const user = await authService.registerUser(req.body);

  res.status(201).json({
    success: true,
    message: 'Usuario registrado correctamente',
    data: user,
  });
}

async function login(req, res) {
  const errors = validateLogin(req.body);
  if (errors.length > 0) {
    throw httpError(400, errors.join('; '));
  }

  const { token, user } = await authService.loginUser(req.body);

  res.status(200).json({
    success: true,
    message: 'Inicio de sesión exitoso',
    data: { token, user },
  });
}

async function me(req, res) {
  const user = await authService.getUserById(req.user.userId);
  if (!user) {
    throw httpError(404, 'Usuario no encontrado');
  }

  res.status(200).json({
    success: true,
    message: 'Usuario autenticado',
    data: user,
  });
}

module.exports = { register, login, me };
