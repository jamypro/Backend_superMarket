const dataSource = require("../config/data-source");

const usuarioRepo = () => dataSource.getRepository("usuarios");
const rolRepo = () => dataSource.getRepository("roles");

function userSelectBuilder({ includePassword = false } = {}) {
  const qb = usuarioRepo()
    .createQueryBuilder("u")
    .select([])
    .innerJoin("roles", "r", "r.id_rol = u.rol_id")
    .addSelect("u.id_usuario", "id_usuario")
    .addSelect("u.correo", "correo")
    .addSelect("u.nombre", "nombre")
    .addSelect("u.apellido", "apellido")
    .addSelect("u.estado", "estado")
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

module.exports = {
  findUserByCorreo,
  getUserById,
  findByCorreo,
  findRolById,
  findRolByNombre,
  create,
};
