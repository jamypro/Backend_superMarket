const { EntitySchema } = require('typeorm');

const Auditoria = new EntitySchema({
  name: 'auditoria',
  columns: {
    id_auditoria: { type: 'bigint', unsigned: true, primary: true, generated: 'increment' },
    usuario_id: { type: 'int', unsigned: true, nullable: true },
    tabla_afectada: { type: 'varchar', length: 100, nullable: false },
    accion: { type: 'enum', enum: ['INSERT', 'UPDATE', 'DELETE'], nullable: false },
    registro_id: { type: 'varchar', length: 50, nullable: true },
    valores_anteriores: { type: 'json', nullable: true },
    valores_nuevos: { type: 'json', nullable: true },
    ip_origen: { type: 'varchar', length: 45, nullable: true },
    created_at: { type: 'timestamp', nullable: true },
  },
  indices: [
    { name: 'idx_tabla_accion', columns: ['tabla_afectada', 'accion'] },
    { name: 'idx_usuario', columns: ['usuario_id'] },
    { name: 'idx_fecha', columns: ['created_at'] },
    { name: 'idx_registro', columns: ['registro_id'] },
  ],
});

const TipoAnomalia = new EntitySchema({
  name: 'tipo_anomalias',
  columns: {
    id_tipo_anomalia: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    codigo: { type: 'varchar', length: 20, nullable: false, unique: true },
    nombre: { type: 'varchar', length: 100, nullable: false },
    severidad: { type: 'varchar', length: 100, nullable: true },
    descripcion: { type: 'text', nullable: true },
    activo: { type: 'tinyint', default: 1, nullable: false },
  },
});

const Anomalia = new EntitySchema({
  name: 'anomalias',
  columns: {
    id_anomalia: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    tipo_anomalia_id: { type: 'int', unsigned: true, nullable: false },
    usuario_id: { type: 'int', unsigned: true, nullable: true },
    entidad_id: { type: 'varchar', length: 50, nullable: true },
    descripcion: { type: 'text', nullable: true },
    estado: { type: 'enum', enum: ['Pendiente', 'Revisada', 'Cerrada'], default: 'Pendiente', nullable: false },
    created_at: { type: 'timestamp', nullable: true },
  },
  indices: [
    { name: 'idx_estado', columns: ['estado'] },
    { name: 'idx_tipo', columns: ['tipo_anomalia_id'] },
  ],
  relations: {
    tipoAnomalia: { type: 'many-to-one', target: 'tipo_anomalias', joinColumn: { name: 'tipo_anomalia_id' } },
    usuario: { type: 'many-to-one', target: 'usuarios', joinColumn: { name: 'usuario_id' }, onDelete: 'SET NULL', nullable: true },
  },
});

const Notificacion = new EntitySchema({
  name: 'notificaciones',
  columns: {
    id_notificacion: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    usuario_id: { type: 'int', unsigned: true, nullable: true },
    cliente_id: { type: 'int', unsigned: true, nullable: true },
    tipo: { type: 'varchar', length: 50, nullable: true },
    titulo: { type: 'varchar', length: 200, nullable: false },
    descripcion: { type: 'text', nullable: true },
    leida: { type: 'tinyint', default: 0, nullable: false },
    data: { type: 'json', nullable: true },
    link: { type: 'varchar', length: 500, nullable: true },
    created_at: { type: 'timestamp', nullable: true },
  },
  indices: [
    { name: 'idx_usuario_leida', columns: ['usuario_id', 'leida'] },
    { name: 'idx_created', columns: ['created_at'] },
  ],
  relations: {
    usuario: { type: 'many-to-one', target: 'usuarios', joinColumn: { name: 'usuario_id' }, onDelete: 'CASCADE', nullable: true },
    cliente: { type: 'many-to-one', target: 'clientes', joinColumn: { name: 'cliente_id' }, onDelete: 'SET NULL', nullable: true },
  },
});

module.exports = { Auditoria, TipoAnomalia, Anomalia, Notificacion };
