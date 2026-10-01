const { EntitySchema } = require('typeorm');

const EstadoDevolucion = new EntitySchema({
  name: 'estados_devoluciones',
  columns: {
    id_estado_devolucion: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    nombre: { type: 'varchar', length: 50, nullable: false },
    descripcion: { type: 'text', nullable: true },
  },
});

const Devolucion = new EntitySchema({
  name: 'devoluciones',
  columns: {
    id_devolucion: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    factura_id: { type: 'int', unsigned: true, nullable: false },
    usuario_id: { type: 'int', unsigned: true, nullable: false },
    cajero_id: { type: 'int', unsigned: true, nullable: true },
    supervisor_id: { type: 'int', unsigned: true, nullable: true },
    estado_id: { type: 'int', unsigned: true, default: 1, nullable: false },
    turno_id: { type: 'int', unsigned: true, nullable: false },
    motivo: { type: 'text', nullable: false },
    reembolso_total: { type: 'decimal', precision: 12, scale: 2, nullable: false },
    created_at: { type: 'timestamp', nullable: true },
    resuelta_en: { type: 'datetime', nullable: true },
  },
  indices: [{ name: 'idx_cajero', columns: ['cajero_id'] }],
  relations: {
    factura: { type: 'many-to-one', target: 'facturas_ventas', joinColumn: { name: 'factura_id' } },
    usuario: { type: 'many-to-one', target: 'usuarios', joinColumn: { name: 'usuario_id' } },
    cajero: { type: 'many-to-one', target: 'usuarios', joinColumn: { name: 'cajero_id' }, nullable: true },
    supervisor: { type: 'many-to-one', target: 'usuarios', joinColumn: { name: 'supervisor_id' }, nullable: true },
    turno: { type: 'many-to-one', target: 'caja', joinColumn: { name: 'turno_id' } },
    estado: { type: 'many-to-one', target: 'estados_devoluciones', joinColumn: { name: 'estado_id' } },
  },
});

const ItemDevolucion = new EntitySchema({
  name: 'items_devolucion',
  columns: {
    id_item_devolucion: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    devolucion_id: { type: 'int', unsigned: true, nullable: false },
    producto_id: { type: 'int', unsigned: true, nullable: false },
    item_factura_id: { type: 'int', unsigned: true, nullable: true },
    tipo: { type: 'enum', enum: ['reembolso', 'cambio'], default: 'reembolso', nullable: false },
    cantidad: { type: 'int', unsigned: true, nullable: false },
    monto_devolucion: { type: 'decimal', precision: 12, scale: 2, nullable: false },
    notas: { type: 'text', nullable: true },
  },
  relations: {
    devolucion: { type: 'many-to-one', target: 'devoluciones', joinColumn: { name: 'devolucion_id' }, onDelete: 'CASCADE' },
    producto: { type: 'many-to-one', target: 'productos', joinColumn: { name: 'producto_id' } },
    itemFactura: { type: 'many-to-one', target: 'items_factura', joinColumn: { name: 'item_factura_id' }, onDelete: 'SET NULL', nullable: true },
  },
});

module.exports = { EstadoDevolucion, Devolucion, ItemDevolucion };
