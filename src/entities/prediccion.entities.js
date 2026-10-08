import { EntitySchema } from "typeorm";

const PrediccionReabastecimiento = new EntitySchema({
  name: 'prediccion_reabastecimiento',
  columns: {
    id_prediccion: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    producto_id: { type: 'int', unsigned: true, nullable: false, unique: true },
    promedio_venta_diaria: { type: 'decimal', precision: 10, scale: 2, nullable: true },
    promedio_venta_diaria_30d: { type: 'decimal', precision: 10, scale: 2, nullable: true },
    promedio_venta_diaria_60d: { type: 'decimal', precision: 10, scale: 2, nullable: true },
    promedio_venta_diaria_90d: { type: 'decimal', precision: 10, scale: 2, nullable: true },
    stock_actual: { type: 'int', nullable: true },
    dias_stock_restante: { type: 'decimal', precision: 8, scale: 1, nullable: true },
    cantidad_sugerida: { type: 'int', nullable: true },
    es_urgente: { type: 'tinyint', default: 0, nullable: false },
    calculado_en: { type: 'timestamp', nullable: true },
  },
  indices: [{ name: 'idx_urgente', columns: ['es_urgente'] }],
  relations: {
    producto: { type: 'many-to-one', target: 'productos', joinColumn: { name: 'producto_id' }, onDelete: 'CASCADE' },
  },
});

export { PrediccionReabastecimiento };
