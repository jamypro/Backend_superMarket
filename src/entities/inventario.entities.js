import { EntitySchema } from "typeorm";

const Inventario = new EntitySchema({
  name: 'inventario',
  columns: {
    id_inventario: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    producto_id: { type: 'int', unsigned: true, nullable: false, unique: true },
    stock_actual: { type: 'int', default: 0, nullable: false },
    stock_minimo: { type: 'int', unsigned: true, default: 0, nullable: false },
    stock_reservado: { type: 'int', default: 0, nullable: false },
    stock_maximo: { type: 'int', unsigned: true, nullable: true },
    expira_en: { type: 'date', nullable: true },
    actualizado_en: { type: 'timestamp', nullable: true },
  },
  indices: [
    { name: 'idx_stock_actual', columns: ['stock_actual'] },
    { name: 'idx_stock_minimo', columns: ['stock_minimo'] },
  ],
  relations: {
    producto: { type: 'many-to-one', target: 'productos', joinColumn: { name: 'producto_id' }, onDelete: 'CASCADE' },
  },
});

const EntradaInventario = new EntitySchema({
  name: 'entrada_inventario',
  columns: {
    id_entrada_inventario: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    producto_id: { type: 'int', unsigned: true, nullable: false },
    orden_compra_id: { type: 'int', unsigned: true, nullable: true },
    numero_factura_proveedor: { type: 'varchar', length: 50, nullable: true },
    tipo_referencia: { type: 'varchar', length: 50, nullable: true },
    cantidad: { type: 'int', nullable: false },
    notas: { type: 'text', nullable: true },
    creado_por: { type: 'int', unsigned: true, nullable: false },
    created_at: { type: 'timestamp', nullable: true },
  },
  indices: [{ name: 'idx_producto', columns: ['producto_id'] }],
  relations: {
    producto: { type: 'many-to-one', target: 'productos', joinColumn: { name: 'producto_id' } },
    creador: { type: 'many-to-one', target: 'usuarios', joinColumn: { name: 'creado_por' } },
    ordenCompra: {
      type: 'many-to-one',
      target: 'ordenes_compra',
      joinColumn: { name: 'orden_compra_id' },
      onDelete: 'SET NULL',
      nullable: true,
    },
  },
});

export { Inventario, EntradaInventario };
