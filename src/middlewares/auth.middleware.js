import jwt from "jsonwebtoken";
import httpError from "../utils/httpError.js";

/**
 * Middleware de autenticación que valida el token JWT enviado en el header
 * `Authorization` y adjunta su payload al objeto `req.usuario`.
 *
 * @param {import('express').Request} req - Objeto de solicitud HTTP.
 * @param {import('express').Response} res - Objeto de respuesta HTTP.
 * @param {import('express').NextFunction} next - Callback para continuar la cadena.
 * @returns {void}
 */
function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(httpError(401, "No se proporcionó el token de autenticación"));
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return next(
      httpError(401, "Formato de autorización inválido. Use: Bearer <token>"),
    );
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    return next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "El token ha expirado"
        : "Token inválido";
    return next(httpError(401, message));
  }
}

/**
 * Factory de middleware de autorización que valida que el rol del usuario
 * autenticado (`req.usuario.rol_id`) esté incluido en la lista de roles
 * permitidos. Si no coincide, responde con HTTP 403 Forbidden.
 *
 * @param {...number} rolesPermitidos - IDs de rol autorizados para acceder a la ruta.
 * @returns {import('express').RequestHandler} Middleware de autorización.
 */
function autorizarRoles(...rolesPermitidos) {
  return function roleMiddleware(req, res, next) {
    const rolId = Number(req.usuario && req.usuario.rol_id);

    if (!rolesPermitidos.includes(rolId)) {
      return next(httpError(403, "No tienes permiso para realizar esta acción"));
    }

    return next();
  };
}

export { verificarToken, autorizarRoles };
