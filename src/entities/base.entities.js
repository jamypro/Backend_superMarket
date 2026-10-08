import { EntitySchema } from "typeorm";

const Codigo = new EntitySchema({
  name: 'codigos',
  columns: {
    id_codigo: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    clave: { type: 'varchar', length: 50, nullable: false, unique: true },
    clase: { type: 'varchar', length: 50, nullable: true },
    valor: { type: 'varchar', length: 255, nullable: false },
    descripcion: { type: 'text', nullable: true },
    created_at: { type: 'timestamp', nullable: true },
  },
});

const Rol = new EntitySchema({
  name: 'roles',
  columns: {
    id_rol: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    nombre: { type: 'varchar', length: 50, nullable: false, unique: true },
    descripcion: { type: 'text', nullable: true },
  },
});

const Usuario = new EntitySchema({
  name: 'usuarios',
  columns: {
    id_usuario: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    rol_id: { type: 'int', unsigned: true, nullable: false },
    nombre: { type: 'varchar', length: 100, nullable: false },
    apellido: { type: 'varchar', length: 100, nullable: true },
    tipo_documento: { type: 'enum', enum: ['CC', 'NIT', 'CE', 'Pasaporte'], default: 'CC', nullable: false },
    documento: { type: 'varchar', length: 20, nullable: true, unique: true },
    correo: { type: 'varchar', length: 150, nullable: false, unique: true },
    contrasena: { type: 'varchar', length: 255, nullable: false },
    telefono: { type: 'varchar', length: 20, nullable: true },
    estado: { type: 'tinyint', default: 1, nullable: false },
    bloqueado: { type: 'tinyint', default: 0, nullable: false },
    intentos_fallidos: { type: 'tinyint', unsigned: true, default: 0, nullable: false },
    bloqueo_hasta: { type: 'timestamp', nullable: true },
    ultimo_acceso: { type: 'timestamp', nullable: true },
    codigo_id: { type: 'int', unsigned: true, nullable: true },
    created_by: { type: 'int', unsigned: true, nullable: true },
    created_at: { type: 'timestamp', nullable: true },
    updated_at: { type: 'timestamp', nullable: true },
  },
  indices: [
    { name: 'idx_correo', columns: ['correo'] },
    { name: 'idx_documento', columns: ['documento'] },
    { name: 'idx_estado', columns: ['estado'] },
  ],
  relations: {
    rol: { type: 'many-to-one', target: 'roles', joinColumn: { name: 'rol_id' } },
    codigo: { type: 'many-to-one', target: 'codigos', joinColumn: { name: 'codigo_id' }, nullable: true },
    creador: { type: 'many-to-one', target: 'usuarios', joinColumn: { name: 'created_by' }, nullable: true },
  },
});

export { Codigo, Rol, Usuario };
