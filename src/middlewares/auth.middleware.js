const jwt = require('jsonwebtoken');
const httpError = require('../utils/httpError');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(httpError(401, 'No se proporcionó el token de autenticación'));
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(httpError(401, 'Formato de autorización inválido. Use: Bearer <token>'));
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'El token ha expirado' : 'Token inválido';
    return next(httpError(401, message));
  }
}

module.exports = authMiddleware;
