import dataSource from "../config/data-source.js";

const usuarioRepo = () => dataSource.getRepository("usuarios");
const rolRepo = () => dataSource.getRepository("roles");

function userSelectBuilder({ includePassword = false } = {}) {
  const qb = usuarioRepo()
    .createQueryBuilder("u")
    .select([])
    .innerJoin("roles", "r", "r.id_rol = u.rol_id")
    .addSelect("u.id_usuario", "id_usuario")
    .addSelect("u.rol_id", "rol_id")
    .addSelect("u.correo", "correo")
    .addSelect("u.nombre", "nombre")
    .addSelect("u.apellido", "apellido")
    .addSelect("u.estado", "estado")
    .addSelect("u.bloqueado", "bloqueado")
    .addSelect("u.intentos_fallidos", "intentos_fallidos")
    .addSelect("u.bloqueo_hasta", "bloqueo_hasta")
    .addSelect("u.ultimo_acceso", "ultimo_acceso")
    .addSelect("r.nombre", "rol");

  if (includePassword) {
    qb.addSelect("u.contrasena", "contrasena");
  }

  return qb;
}

async function findUserByCorreo(correo) {
  const rows = await userSelectBuilder({ includePassword: true })
    .where("u.correo = :correo", { correo })
    .getRawMany();
  return rows[0] || null;
}

async function getUserById(id) {
  const rows = await userSelectBuilder()
    .where("u.id_usuario = :id", { id })
    .getRawMany();
  return rows[0] || null;
}

async function findByCorreo(correo) {
  return usuarioRepo().findOneBy({ correo });
}

async function findRolById(id) {
  return rolRepo().findOneBy({ id_rol: id });
}

async function findRolByNombre(nombre) {
  return rolRepo().findOneBy({ nombre });
}

async function create(data) {
  const result = await usuarioRepo().insert(data);
  return getUserById(result.identifiers[0].id_usuario);
}

async function incrementarIntentosFallidos(
  id,
  intentosFallidos,
  { bloqueado = false, bloqueoHasta = null } = {},
) {
  const updates = {
    intentos_fallidos: intentosFallidos,
    bloqueado: bloqueado ? 1 : 0,
  };

  if (bloqueoHasta) {
    updates.bloqueo_hasta = bloqueoHasta;
  }

  return usuarioRepo().update(id, updates);
}

async function registrarAccesoExitoso(id) {
  return usuarioRepo().update(id, {
    intentos_fallidos: 0,
    bloqueado: 0,
    bloqueo_hasta: null,
    ultimo_acceso: new Date(),
  });
}

export {
  findUserByCorreo,
  getUserById,
  findByCorreo,
  findRolById,
  findRolByNombre,
  create,
  incrementarIntentosFallidos,
  registrarAccesoExitoso,
};
