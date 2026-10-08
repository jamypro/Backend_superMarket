import { EntitySchema } from "typeorm";

const Proveedor = new EntitySchema({
  name: 'proveedores',
  columns: {
    id_proveedor: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    nombre: { type: 'varchar', length: 150, nullable: false },
    nit: { type: 'varchar', length: 20, nullable: true },
    contacto: { type: 'varchar', length: 100, nullable: true },
    telefono: { type: 'varchar', length: 20, nullable: true },
    email: { type: 'varchar', length: 100, nullable: true },
    direccion: { type: 'varchar', length: 200, nullable: true },
    municipio: { type: 'varchar', length: 100, nullable: true },
    departamento: { type: 'varchar', length: 100, nullable: true },
    activo: { type: 'tinyint', default: 1, nullable: false },
    notas: { type: 'text', nullable: true },
    codigo_proveedor: { type: 'varchar', length: 30, nullable: true, unique: true },
    created_at: { type: 'timestamp', nullable: true },
  },
  indices: [
    { name: 'idx_nit', columns: ['nit'] },
    { name: 'idx_activo', columns: ['activo'] },
  ],
});

const ProveedorProducto = new EntitySchema({
  name: 'proveedor_producto',
  columns: {
    id_proveedor_producto: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    proveedor_id: { type: 'int', unsigned: true, nullable: false },
    producto_id: { type: 'int', unsigned: true, nullable: false },
    precio_unitario: { type: 'decimal', precision: 12, scale: 2, nullable: true },
  },
  uniques: [{ name: 'uq_prov_prod', columns: ['proveedor_id', 'producto_id'] }],
  relations: {
    proveedor: {
      type: 'many-to-one',
      target: 'proveedores',
      joinColumn: { name: 'proveedor_id' },
      onDelete: 'CASCADE',
    },
    producto: {
      type: 'many-to-one',
      target: 'productos',
      joinColumn: { name: 'producto_id' },
      onDelete: 'CASCADE',
    },
  },
});

const OrdenCompra = new EntitySchema({
  name: 'ordenes_compra',
  columns: {
    id_orden_compra: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    proveedor_id: { type: 'int', unsigned: true, nullable: false },
    usuario_id: { type: 'int', unsigned: true, nullable: false },
    numero_orden: { type: 'varchar', length: 30, nullable: false, unique: true },
    fecha_orden: { type: 'date', nullable: false },
    fecha_prevista_entrega: { type: 'date', nullable: true },
    fecha_entrega: { type: 'date', nullable: true },
    estado: {
      type: 'enum',
      enum: ['Borrador', 'Enviada', 'Parcial', 'Completada', 'Cancelada'],
      default: 'Borrador',
      nullable: false,
    },
    notas: { type: 'text', nullable: true },
    subtotal: { type: 'decimal', precision: 14, scale: 2, default: 0, nullable: false },
    total_iva: { type: 'decimal', precision: 14, scale: 2, default: 0, nullable: false },
    total: { type: 'decimal', precision: 14, scale: 2, default: 0, nullable: false },
    created_at: { type: 'timestamp', nullable: true },
  },
  indices: [
    { name: 'idx_estado', columns: ['estado'] },
    { name: 'idx_proveedor', columns: ['proveedor_id'] },
  ],
  relations: {
    proveedor: { type: 'many-to-one', target: 'proveedores', joinColumn: { name: 'proveedor_id' } },
    usuario: { type: 'many-to-one', target: 'usuarios', joinColumn: { name: 'usuario_id' } },
  },
});

const ItemOrdenCompra = new EntitySchema({
  name: 'items_orden_compra',
  columns: {
    id_item_orden_compra: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    orden_compra_id: { type: 'int', unsigned: true, nullable: false },
    producto_id: { type: 'int', unsigned: true, nullable: false },
    cantidad_pedida: { type: 'int', unsigned: true, nullable: false },
    precio_unitario: { type: 'decimal', precision: 12, scale: 2, nullable: false },
    cantidad_recibida: { type: 'int', unsigned: true, default: 0, nullable: false },
    descuento: { type: 'decimal', precision: 5, scale: 2, default: 0, nullable: false },
    codigo_unidad: { type: 'varchar', length: 20, nullable: true },
    subtotal: { type: 'decimal', precision: 14, scale: 2, insert: false, update: false, nullable: true },
    notas: { type: 'text', nullable: true },
  },
  relations: {
    ordenCompra: {
      type: 'many-to-one',
      target: 'ordenes_compra',
      joinColumn: { name: 'orden_compra_id' },
      onDelete: 'CASCADE',
    },
    producto: { type: 'many-to-one', target: 'productos', joinColumn: { name: 'producto_id' } },
  },
});

export { Proveedor, ProveedorProducto, OrdenCompra, ItemOrdenCompra };
