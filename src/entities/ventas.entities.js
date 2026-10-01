const { EntitySchema } = require('typeorm');

const MetodoPago = new EntitySchema({
  name: 'metodos_pago',
  columns: {
    id_metodo_pago: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    nombre: { type: 'varchar', length: 50, nullable: false },
    descripcion: { type: 'text', nullable: true },
    activo: { type: 'tinyint', default: 1, nullable: false },
  },
});

const TipoMovimiento = new EntitySchema({
  name: 'tipo_movimientos',
  columns: {
    id_tipo_movimiento: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    nombre: { type: 'varchar', length: 50, nullable: false },
    descripcion: { type: 'text', nullable: true },
    activo: { type: 'tinyint', default: 1, nullable: false },
  },
});

const Caja = new EntitySchema({
  name: 'caja',
  columns: {
    id_turno: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    cajero_id: { type: 'int', unsigned: true, nullable: false },
    monto_apertura: { type: 'decimal', precision: 12, scale: 2, default: 0, nullable: false },
    monto_esperado: { type: 'decimal', precision: 12, scale: 2, nullable: true },
    monto_real: { type: 'decimal', precision: 12, scale: 2, nullable: true },
    diferencia: { type: 'decimal', precision: 12, scale: 2, insert: false, update: false, nullable: true },
    estado: { type: 'enum', enum: ['Abierto', 'Cerrado'], default: 'Abierto', nullable: false },
    apertura_en: { type: 'timestamp', nullable: true },
    cierre_en: { type: 'timestamp', nullable: true },
    notas: { type: 'text', nullable: true },
  },
  indices: [
    { name: 'idx_cajero', columns: ['cajero_id'] },
    { name: 'idx_estado', columns: ['estado'] },
  ],
  relations: {
    cajero: { type: 'many-to-one', target: 'usuarios', joinColumn: { name: 'cajero_id' } },
  },
});

const MovimientoTurno = new EntitySchema({
  name: 'movimientos_turnos',
  columns: {
    id_movimiento_turno: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    turno_id: { type: 'int', unsigned: true, nullable: false },
    tipo_movimiento_id: { type: 'int', unsigned: true, nullable: false },
    monto: { type: 'decimal', precision: 12, scale: 2, nullable: false },
    referencia_id: { type: 'int', unsigned: true, nullable: true },
    notas: { type: 'text', nullable: true },
    created_at: { type: 'timestamp', nullable: true },
  },
  relations: {
    turno: { type: 'many-to-one', target: 'caja', joinColumn: { name: 'turno_id' }, onDelete: 'CASCADE' },
    tipoMovimiento: { type: 'many-to-one', target: 'tipo_movimientos', joinColumn: { name: 'tipo_movimiento_id' } },
  },
});

const Cliente = new EntitySchema({
  name: 'clientes',
  columns: {
    id_cliente: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    nombre: { type: 'varchar', length: 100, nullable: false },
    apellido: { type: 'varchar', length: 100, nullable: true },
    tipo_documento: { type: 'enum', enum: ['CC', 'NIT', 'CE', 'Pasaporte'], default: 'CC', nullable: false },
    documento: { type: 'varchar', length: 20, nullable: true },
    correo: { type: 'varchar', length: 150, nullable: true, unique: true },
    telefono: { type: 'varchar', length: 20, nullable: true },
    contrasena: { type: 'varchar', length: 255, nullable: true },
    estado: { type: 'tinyint', default: 1, nullable: false },
    registrado_por: { type: 'int', unsigned: true, nullable: true },
    ultimo_acceso: { type: 'timestamp', nullable: true },
    created_at: { type: 'timestamp', nullable: true },
    codigo_id: { type: 'int', unsigned: true, nullable: true },
  },
  indices: [
    { name: 'idx_documento', columns: ['documento'] },
    { name: 'idx_correo', columns: ['correo'] },
  ],
  relations: {
    registrador: { type: 'many-to-one', target: 'usuarios', joinColumn: { name: 'registrado_por' }, onDelete: 'SET NULL', nullable: true },
    codigo: { type: 'many-to-one', target: 'codigos', joinColumn: { name: 'codigo_id' }, nullable: true },
  },
});

const Promocion = new EntitySchema({
  name: 'promociones',
  columns: {
    id_promocion: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    nombre: { type: 'varchar', length: 150, nullable: false },
    descripcion: { type: 'text', nullable: true },
    tipo: { type: 'enum', enum: ['porcentaje', 'valor_fijo', '2x1'], default: 'porcentaje', nullable: false },
    valor: { type: 'decimal', precision: 10, scale: 2, default: 0, nullable: false },
    fecha_inicio: { type: 'date', nullable: false },
    fecha_fin: { type: 'date', nullable: false },
    activo: { type: 'tinyint', default: 1, nullable: false },
    created_at: { type: 'timestamp', nullable: true },
  },
  indices: [
    { name: 'idx_fechas', columns: ['fecha_inicio', 'fecha_fin'] },
    { name: 'idx_activo', columns: ['activo'] },
  ],
});

const PromocionProducto = new EntitySchema({
  name: 'promociones_productos',
  columns: {
    id_promocion_producto: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    producto_id: { type: 'int', unsigned: true, nullable: false },
    id_promocion: { type: 'int', unsigned: true, nullable: false },
  },
  uniques: [{ name: 'uq_prod_prom', columns: ['producto_id', 'id_promocion'] }],
  relations: {
    producto: { type: 'many-to-one', target: 'productos', joinColumn: { name: 'producto_id' }, onDelete: 'CASCADE' },
    promocion: { type: 'many-to-one', target: 'promociones', joinColumn: { name: 'id_promocion' }, onDelete: 'CASCADE' },
  },
});

const FacturaVenta = new EntitySchema({
  name: 'facturas_ventas',
  columns: {
    id_factura_venta: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    numero_factura: { type: 'varchar', length: 20, nullable: false, unique: true },
    cajero_id: { type: 'int', unsigned: true, nullable: false },
    cliente_id: { type: 'int', unsigned: true, nullable: true },
    turno_id: { type: 'int', unsigned: true, nullable: true },
    subtotal: { type: 'decimal', precision: 14, scale: 2, default: 0, nullable: false },
    descuento: { type: 'decimal', precision: 14, scale: 2, default: 0, nullable: false },
    impuesto: { type: 'decimal', precision: 14, scale: 2, default: 0, nullable: false },
    total: { type: 'decimal', precision: 14, scale: 2, default: 0, nullable: false },
    estado: { type: 'enum', enum: ['Pendiente', 'Pagada', 'Anulada'], default: 'Pendiente', nullable: false },
    created_at: { type: 'timestamp', nullable: true },
  },
  indices: [
    { name: 'idx_cajero', columns: ['cajero_id'] },
    { name: 'idx_cliente', columns: ['cliente_id'] },
    { name: 'idx_fecha', columns: ['created_at'] },
    { name: 'idx_estado', columns: ['estado'] },
  ],
  relations: {
    cajero: { type: 'many-to-one', target: 'usuarios', joinColumn: { name: 'cajero_id' } },
    cliente: { type: 'many-to-one', target: 'clientes', joinColumn: { name: 'cliente_id' }, onDelete: 'SET NULL', nullable: true },
    turno: { type: 'many-to-one', target: 'caja', joinColumn: { name: 'turno_id' }, onDelete: 'SET NULL', nullable: true },
  },
});

const ItemFactura = new EntitySchema({
  name: 'items_factura',
  columns: {
    id_item_factura: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    factura_id: { type: 'int', unsigned: true, nullable: false },
    producto_id: { type: 'int', unsigned: true, nullable: false },
    cantidad: { type: 'int', unsigned: true, nullable: false },
    precio_unitario: { type: 'decimal', precision: 12, scale: 2, nullable: false },
    precio_minimo: { type: 'decimal', precision: 12, scale: 2, default: 0, nullable: false },
    total_impuesto: { type: 'decimal', precision: 12, scale: 2, default: 0, nullable: false },
    total_descuento: { type: 'decimal', precision: 12, scale: 2, default: 0, nullable: false },
    promocion_id: { type: 'int', unsigned: true, nullable: true },
    total: { type: 'decimal', precision: 12, scale: 2, nullable: false },
  },
  relations: {
    factura: { type: 'many-to-one', target: 'facturas_ventas', joinColumn: { name: 'factura_id' }, onDelete: 'CASCADE' },
    producto: { type: 'many-to-one', target: 'productos', joinColumn: { name: 'producto_id' } },
    promocion: { type: 'many-to-one', target: 'promociones', joinColumn: { name: 'promocion_id' }, onDelete: 'SET NULL', nullable: true },
  },
});

const PagoFacturaVenta = new EntitySchema({
  name: 'pagos_facturas_ventas',
  columns: {
    id_pago_factura_venta: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    factura_id: { type: 'int', unsigned: true, nullable: false },
    metodo_id: { type: 'int', unsigned: true, nullable: false },
    monto: { type: 'decimal', precision: 12, scale: 2, nullable: false },
    referencia_transaccion: { type: 'varchar', length: 100, nullable: true },
    creado_en: { type: 'timestamp', nullable: true },
  },
  relations: {
    factura: { type: 'many-to-one', target: 'facturas_ventas', joinColumn: { name: 'factura_id' }, onDelete: 'CASCADE' },
    metodo: { type: 'many-to-one', target: 'metodos_pago', joinColumn: { name: 'metodo_id' } },
  },
});

module.exports = {
  MetodoPago,
  TipoMovimiento,
  Caja,
  MovimientoTurno,
  Cliente,
  Promocion,
  PromocionProducto,
  FacturaVenta,
  ItemFactura,
  PagoFacturaVenta,
};
