import bcrypt from "bcrypt";
import dataSource from "../config/data-source.js";
import httpError from "../utils/httpError.js";

const SALT_ROUNDS = 10;
const ADMIN_ROLE_NAME = "Administrador";

const usuarioRepository = () => dataSource.getRepository("usuarios");
const rolRepository = () => dataSource.getRepository("roles");

function selectUsuario() {
  return usuarioRepository()
    .createQueryBuilder("u")
    .innerJoin("roles", "r", "r.id_rol = u.rol_id")
    .leftJoin("usuarios", "cu", "cu.id_usuario = u.created_by")
    .select("u.id_usuario", "id_usuario")
    .addSelect("u.rol_id", "rol_id")
    .addSelect("r.nombre", "rol")
    .addSelect("u.nombre", "nombre")
    .addSelect("u.apellido", "apellido")
    .addSelect("u.tipo_documento", "tipo_documento")
    .addSelect("u.documento", "documento")
    .addSelect("u.correo", "correo")
    .addSelect("u.telefono", "telefono")
    .addSelect("u.estado", "estado")
    .addSelect("u.bloqueado", "bloqueado")
    .addSelect("u.intentos_fallidos", "intentos_fallidos")
    .addSelect("u.bloqueo_hasta", "bloqueo_hasta")
    .addSelect("u.ultimo_acceso", "ultimo_acceso")
    .addSelect("u.created_by", "created_by")
    .addSelect("CONCAT_WS(' ', cu.nombre, cu.apellido)", "creado_por")
    .addSelect("u.created_at", "created_at")
    .addSelect("u.updated_at", "updated_at");
}

async function findById(id) {
  return (
    (await selectUsuario().where("u.id_usuario = :id", { id }).getRawOne()) ||
    null
  );
}

async function findAdminRoleId() {
  const role = await rolRepository().findOneBy({ nombre: ADMIN_ROLE_NAME });
  return role?.id_rol ?? null;
}

async function countActiveAdmins(adminRoleId) {
  return usuarioRepository()
    .createQueryBuilder("u")
    .where("u.rol_id = :adminRoleId", { adminRoleId })
    .andWhere("u.estado = :estado", { estado: 1 })
    .getCount();
}

async function ensureCorreoAvailable(correo, excludeId = null) {
  const existing = await usuarioRepository().findOneBy({ correo });
  if (
    existing &&
    (excludeId === null || Number(existing.id_usuario) !== Number(excludeId))
  ) {
    throw httpError(409, "El correo ya se encuentra registrado");
  }
}

async function ensureDocumentoAvailable(documento, excludeId = null) {
  const existing = await usuarioRepository().findOneBy({ documento });
  if (
    existing &&
    (excludeId === null || Number(existing.id_usuario) !== Number(excludeId))
  ) {
    throw httpError(409, "El documento ya se encuentra registrado");
  }
}

async function ensureRolExists(rolId) {
  const role = await rolRepository().findOneBy({ id_rol: rolId });
  if (!role) {
    throw httpError(400, "El rol especificado no existe");
  }
}

async function ensureNotLastActiveAdmin(target, changes) {
  const adminRoleId = await findAdminRoleId();
  if (!adminRoleId) {
    return;
  }

  const isAdmin = Number(target.rol_id) === Number(adminRoleId);
  const wasActive = Number(target.estado) === 1;
  const nextEstado =
    changes.estado !== undefined ? changes.estado : target.estado;
  const nextRolId =
    changes.rol_id !== undefined ? changes.rol_id : target.rol_id;
  const removesAdmin =
    isAdmin &&
    (Number(nextEstado) !== 1 || Number(nextRolId) !== Number(adminRoleId));

  if (!wasActive || !removesAdmin) {
    return;
  }

  const totalActive = await countActiveAdmins(adminRoleId);
  if (totalActive <= 1) {
    throw httpError(
      409,
      "No se puede desactivar o quitar el rol al último administrador activo",
    );
  }
}

async function list(filters = {}) {
  const query = selectUsuario();

  if (filters.nombre) {
    query.andWhere("CONCAT_WS(' ', u.nombre, u.apellido) LIKE :nombre", {
      nombre: `%${filters.nombre}%`,
    });
  }

  if (filters.correo) {
    query.andWhere("u.correo LIKE :correo", { correo: `%${filters.correo}%` });
  }

  if (filters.documento) {
    query.andWhere("u.documento = :documento", {
      documento: filters.documento,
    });
  }

  if (filters.rol_id !== undefined && filters.rol_id !== null) {
    query.andWhere("u.rol_id = :rolId", { rolId: filters.rol_id });
  }

  if (filters.estado !== undefined && filters.estado !== null) {
    query.andWhere("u.estado = :estado", { estado: filters.estado ? 1 : 0 });
  }

  return query.orderBy("u.id_usuario", "ASC").getRawMany();
}

function toOptionalText(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return value.trim();
}

async function create(data, createdBy) {
  const rolId = data.rol_id;
  const nombre = data.nombre.trim();
  const apellido = toOptionalText(data.apellido);
  const tipoDocumento = data.tipo_documento || "CC";
  const documento = toOptionalText(data.documento);
  const correo = data.correo.trim().toLowerCase();
  const telefono = toOptionalText(data.telefono);
  const estado =
    data.estado === undefined || data.estado === null ? 1 : data.estado ? 1 : 0;

  await ensureRolExists(rolId);
  await ensureCorreoAvailable(correo);
  if (documento) {
    await ensureDocumentoAvailable(documento);
  }

  const contrasena = await bcrypt.hash(data.contrasena, SALT_ROUNDS);
  const usuario = usuarioRepository().create({
    rol_id: rolId,
    nombre,
    apellido,
    tipo_documento: tipoDocumento,
    documento,
    correo,
    contrasena,
    telefono,
    estado,
    created_by: createdBy ?? null,
  });

  const savedUsuario = await usuarioRepository().save(usuario);
  return findById(savedUsuario.id_usuario);
}

async function update(id, data) {
  const target = await findById(id);
  if (!target) {
    return null;
  }

  const changes = {};
  const updates = {};

  if (data.rol_id !== undefined && data.rol_id !== null) {
    await ensureRolExists(data.rol_id);
    changes.rol_id = data.rol_id;
    updates.rol_id = data.rol_id;
  }

  if (data.correo !== undefined) {
    const correo = data.correo.trim().toLowerCase();
    await ensureCorreoAvailable(correo, id);
    updates.correo = correo;
  }

  if (data.documento !== undefined) {
    const documento = toOptionalText(data.documento);
    if (documento) {
      await ensureDocumentoAvailable(documento, id);
    }
    updates.documento = documento;
  }

  if (data.estado !== undefined) {
    changes.estado = data.estado ? 1 : 0;
    updates.estado = changes.estado;
  }

  if (changes.rol_id !== undefined || changes.estado !== undefined) {
    await ensureNotLastActiveAdmin(target, changes);
  }

  if (data.nombre !== undefined) {
    updates.nombre = data.nombre.trim();
  }

  if (data.apellido !== undefined) {
    updates.apellido = toOptionalText(data.apellido);
  }

  if (data.tipo_documento !== undefined) {
    updates.tipo_documento = data.tipo_documento;
  }

  if (data.telefono !== undefined) {
    updates.telefono = toOptionalText(data.telefono);
  }

  if (Object.keys(updates).length === 0) {
    return findById(id);
  }

  await usuarioRepository().update(id, updates);
  return findById(id);
}

async function changePassword(id, contrasena) {
  const hash = await bcrypt.hash(contrasena, SALT_ROUNDS);
  const result = await usuarioRepository().update(id, { contrasena: hash });
  return (result.affected ?? 0) > 0;
}

async function remove(id, currentUserId) {
  if (id === currentUserId) {
    throw httpError(400, "No puede eliminar su propia cuenta");
  }

  const target = await findById(id);
  if (!target) {
    return false;
  }

  await ensureNotLastActiveAdmin(target, { estado: 0 });

  try {
    const result = await usuarioRepository().delete(id);
    return (result.affected ?? 0) > 0;
  } catch (error) {
    if (
      error.driverError?.code === "ER_ROW_IS_REFERENCED_2" ||
      error.code === "ER_ROW_IS_REFERENCED_2"
    ) {
      throw httpError(
        409,
        "El usuario tiene registros relacionados y no puede eliminarse",
      );
    }
    throw error;
  }
}

export { list, findById, create, update, changePassword, remove };
