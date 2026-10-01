const { EntitySchema } = require('typeorm');

const ConfiguracionSistema = new EntitySchema({
  name: 'configuracion_sistema',
  columns: {
    id_configuracion: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    clave: { type: 'varchar', length: 100, nullable: false, unique: true },
    symbol: { type: 'varchar', length: 20, nullable: true },
    valor: { type: 'text', nullable: false },
    descripcion: { type: 'text', nullable: true },
    updated_at: { type: 'timestamp', nullable: true },
    prioridad: { type: 'int', default: 0, nullable: true },
  },
});

module.exports = { ConfiguracionSistema };
