function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    error: `No existe la ruta ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;
  const isServerError = statusCode >= 500;
  const message = isServerError ? 'Error interno del servidor' : err.message || 'Error interno del servidor';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: isServerError ? 'Error interno del servidor' : message,
  });
}

module.exports = { notFoundHandler, errorHandler };
