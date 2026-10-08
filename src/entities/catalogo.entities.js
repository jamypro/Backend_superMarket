import { EntitySchema } from "typeorm";

const Categoria = new EntitySchema({
  name: 'categorias',
  columns: {
    id_categoria: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    nombre: { type: 'varchar', length: 100, nullable: false },
    descripcion: { type: 'text', nullable: true },
    activo: { type: 'tinyint', default: 1, nullable: false },
  },
});

const UnidadMedida = new EntitySchema({
  name: 'unidades_de_medida',
  columns: {
    id_unidad: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    nombre: { type: 'varchar', length: 50, nullable: false },
    simbolo: { type: 'varchar', length: 10, nullable: false },
    conversion: { type: 'decimal', precision: 10, scale: 4, default: 1.0, nullable: true },
  },
});

const Producto = new EntitySchema({
  name: 'productos',
  columns: {
    id_producto: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    codigo_barras: { type: 'varchar', length: 50, nullable: true, unique: true },
    nombre: { type: 'varchar', length: 200, nullable: false },
    descripcion: { type: 'text', nullable: true },
    id_categoria: { type: 'int', unsigned: true, nullable: true },
    id_unidad_de_medida: { type: 'int', unsigned: true, nullable: true },
    precio_venta: { type: 'decimal', precision: 12, scale: 2, default: 0, nullable: false },
    precio_compra: { type: 'decimal', precision: 12, scale: 2, default: 0, nullable: false },
    precio_minimo: { type: 'decimal', precision: 12, scale: 2, default: 0, nullable: false },
    porcentaje_iva: { type: 'decimal', precision: 4, scale: 2, default: 0, nullable: false },
    caducidad: { type: 'date', nullable: true },
    activo: { type: 'tinyint', default: 1, nullable: false },
    created_at: { type: 'timestamp', nullable: true },
    updated_at: { type: 'timestamp', nullable: true },
  },
  indices: [
    { name: 'idx_codigo_barras', columns: ['codigo_barras'] },
    { name: 'idx_nombre', columns: ['nombre'] },
    { name: 'idx_categoria', columns: ['id_categoria'] },
    { name: 'idx_activo', columns: ['activo'] },
  ],
  relations: {
    categoria: {
      type: 'many-to-one',
      target: 'categorias',
      joinColumn: { name: 'id_categoria' },
      onDelete: 'SET NULL',
      nullable: true,
    },
    unidadMedida: {
      type: 'many-to-one',
      target: 'unidades_de_medida',
      joinColumn: { name: 'id_unidad_de_medida' },
      onDelete: 'SET NULL',
      nullable: true,
    },
  },
});

const ImgProducto = new EntitySchema({
  name: 'img_productos',
  columns: {
    id_img_producto: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    producto_id: { type: 'int', unsigned: true, nullable: false },
    img_url: { type: 'varchar', length: 500, nullable: false },
    es_principal: { type: 'tinyint', default: 0, nullable: false },
    created_at: { type: 'timestamp', nullable: true },
  },
  relations: {
    producto: {
      type: 'many-to-one',
      target: 'productos',
      joinColumn: { name: 'producto_id' },
      onDelete: 'CASCADE',
    },
  },
});

export { Categoria, UnidadMedida, Producto, ImgProducto };
