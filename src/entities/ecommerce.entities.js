const { EntitySchema } = require('typeorm');

const ClienteDireccion = new EntitySchema({
  name: 'clientes_direcciones',
  columns: {
    id_cliente_direccion: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    cliente_id: { type: 'int', unsigned: true, nullable: false },
    alias: { type: 'varchar', length: 50, nullable: true },
    direccion: { type: 'varchar', length: 200, nullable: false },
    ciudad: { type: 'varchar', length: 100, nullable: false },
    barrio: { type: 'varchar', length: 100, nullable: false },
    departamento: { type: 'varchar', length: 100, nullable: true },
    referencia: { type: 'text', nullable: true },
    latitud: { type: 'decimal', precision: 10, scale: 7, nullable: true },
    longitud: { type: 'decimal', precision: 10, scale: 7, nullable: true },
    es_principal: { type: 'tinyint', default: 0, nullable: false },
    created_at: { type: 'timestamp', nullable: true },
    activo: { type: 'tinyint', default: 1, nullable: false },
  },
  relations: {
    cliente: { type: 'many-to-one', target: 'clientes', joinColumn: { name: 'cliente_id' }, onDelete: 'CASCADE' },
  },
});

const Carrito = new EntitySchema({
  name: 'carrito',
  columns: {
    id_carrito: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    cliente_id: { type: 'int', unsigned: true, nullable: false, unique: true },
    created_at: { type: 'timestamp', nullable: true },
    updated_at: { type: 'timestamp', nullable: true },
  },
  relations: {
    cliente: { type: 'many-to-one', target: 'clientes', joinColumn: { name: 'cliente_id' }, onDelete: 'CASCADE' },
  },
});

const ItemCarrito = new EntitySchema({
  name: 'item_carrito',
  columns: {
    id_item_carrito: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    carrito_id: { type: 'int', unsigned: true, nullable: false },
    producto_id: { type: 'int', unsigned: true, nullable: false },
    cantidad: { type: 'int', unsigned: true, default: 1, nullable: false },
    precio_unitario: { type: 'decimal', precision: 12, scale: 2, nullable: false },
    agregado_en: { type: 'timestamp', nullable: true },
    expira_en: { type: 'timestamp', nullable: false },
  },
  uniques: [{ name: 'uq_carrito_prod', columns: ['carrito_id', 'producto_id'] }],
  indices: [{ name: 'idx_expira', columns: ['expira_en'] }],
  relations: {
    carrito: { type: 'many-to-one', target: 'carrito', joinColumn: { name: 'carrito_id' }, onDelete: 'CASCADE' },
    producto: { type: 'many-to-one', target: 'productos', joinColumn: { name: 'producto_id' } },
  },
});

const PedidoOnline = new EntitySchema({
  name: 'pedidos_online',
  columns: {
    id_pedido_online: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    numero_pedido: { type: 'varchar', length: 30, nullable: false, unique: true },
    cliente_id: { type: 'int', unsigned: true, nullable: false },
    modalidad: { type: 'enum', enum: ['domicilio', 'click_collect'], default: 'domicilio', nullable: false },
    direccion_entrega_id: { type: 'int', unsigned: true, nullable: true },
    estado: {
      type: 'enum',
      enum: [
        'Pago confirmado',
        'En preparación',
        'Asignado a domiciliario',
        'Despachado',
        'Listo para recoger',
        'Entregado',
        'Cancelado',
      ],
      default: 'Pago confirmado',
      nullable: false,
    },
    subtotal: { type: 'decimal', precision: 14, scale: 2, default: 0, nullable: false },
    descuento: { type: 'decimal', precision: 14, scale: 2, default: 0, nullable: false },
    costo_envio: { type: 'decimal', precision: 10, scale: 2, default: 0, nullable: false },
    total: { type: 'decimal', precision: 14, scale: 2, default: 0, nullable: false },
    notas: { type: 'text', nullable: true },
    fecha_recogida: { type: 'date', nullable: true },
    franja_horaria: { type: 'varchar', length: 50, nullable: true },
    created_at: { type: 'timestamp', nullable: true },
    updated_at: { type: 'timestamp', nullable: true },
  },
  indices: [
    { name: 'idx_cliente', columns: ['cliente_id'] },
    { name: 'idx_estado', columns: ['estado'] },
    { name: 'idx_fecha', columns: ['created_at'] },
  ],
  relations: {
    cliente: { type: 'many-to-one', target: 'clientes', joinColumn: { name: 'cliente_id' }, onDelete: 'RESTRICT' },
    direccionEntrega: {
      type: 'many-to-one',
      target: 'clientes_direcciones',
      joinColumn: { name: 'direccion_entrega_id' },
      onDelete: 'SET NULL',
      nullable: true,
    },
  },
});

const DetallePedidoOnline = new EntitySchema({
  name: 'detalle_pedidos_online',
  columns: {
    id_detalle_pedido: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    pedido_id: { type: 'int', unsigned: true, nullable: false },
    producto_id: { type: 'int', unsigned: true, nullable: false },
    cantidad: { type: 'int', unsigned: true, nullable: false },
    precio_unitario: { type: 'decimal', precision: 12, scale: 2, nullable: false },
    descuento: { type: 'decimal', precision: 12, scale: 2, default: 0, nullable: false },
    subtotal: { type: 'decimal', precision: 12, scale: 2, nullable: false },
  },
  relations: {
    pedido: { type: 'many-to-one', target: 'pedidos_online', joinColumn: { name: 'pedido_id' }, onDelete: 'CASCADE' },
    producto: { type: 'many-to-one', target: 'productos', joinColumn: { name: 'producto_id' } },
  },
});

const PagoOnline = new EntitySchema({
  name: 'pagos_online',
  columns: {
    id_pago_online: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    pedido_id: { type: 'int', unsigned: true, nullable: false },
    metodo: { type: 'enum', enum: ['tarjeta', 'PSE', 'Nequi', 'Daviplata'], nullable: false },
    monto: { type: 'decimal', precision: 14, scale: 2, nullable: false },
    wompi_referencia: { type: 'varchar', length: 100, nullable: true, unique: true },
    wompi_estado: { type: 'varchar', length: 50, nullable: true },
    created_at: { type: 'timestamp', nullable: true },
    updated_at: { type: 'timestamp', nullable: true },
  },
  relations: {
    pedido: { type: 'many-to-one', target: 'pedidos_online', joinColumn: { name: 'pedido_id' }, onDelete: 'CASCADE' },
  },
});

const AsignacionDomiciliario = new EntitySchema({
  name: 'asignaciones_domiciliario',
  columns: {
    id_asignacion_domicilio: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    pedido_id: { type: 'int', unsigned: true, nullable: false, unique: true },
    domiciliario_id: { type: 'int', unsigned: true, nullable: false },
    asignado_por: { type: 'int', unsigned: true, nullable: false },
    asignado_en: { type: 'timestamp', nullable: true },
    en_camino_en: { type: 'timestamp', nullable: true },
    entregado_en: { type: 'timestamp', nullable: true },
    estado: { type: 'enum', enum: ['Asignado', 'En camino', 'Entregado', 'No entregado'], default: 'Asignado', nullable: false },
    codigo_confirmacion: { type: 'char', length: 4, nullable: true },
    motivo_no_entrega: { type: 'text', nullable: true },
    intentos_confirmacion: { type: 'tinyint', unsigned: true, default: 0, nullable: false },
    confirmado_en: { type: 'timestamp', nullable: true },
  },
  indices: [
    { name: 'idx_domiciliario', columns: ['domiciliario_id'] },
    { name: 'idx_estado', columns: ['estado'] },
  ],
  relations: {
    pedido: { type: 'many-to-one', target: 'pedidos_online', joinColumn: { name: 'pedido_id' }, onDelete: 'CASCADE' },
    domiciliario: { type: 'many-to-one', target: 'usuarios', joinColumn: { name: 'domiciliario_id' } },
    asignador: { type: 'many-to-one', target: 'usuarios', joinColumn: { name: 'asignado_por' } },
  },
});

const EstadoPedidoHistorial = new EntitySchema({
  name: 'estados_pedidos_historial',
  columns: {
    id_historial: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    pedido_id: { type: 'int', unsigned: true, nullable: false },
    estado: { type: 'varchar', length: 60, nullable: false },
    cambiado_por: { type: 'int', unsigned: true, nullable: true },
    observaciones: { type: 'text', nullable: true },
    created_at: { type: 'timestamp', nullable: true },
  },
  indices: [{ name: 'idx_pedido', columns: ['pedido_id'] }],
  relations: {
    pedido: { type: 'many-to-one', target: 'pedidos_online', joinColumn: { name: 'pedido_id' }, onDelete: 'CASCADE' },
    cambiador: { type: 'many-to-one', target: 'usuarios', joinColumn: { name: 'cambiado_por' }, onDelete: 'SET NULL', nullable: true },
  },
});

const Resena = new EntitySchema({
  name: 'resenas',
  columns: {
    id_resena: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    producto_id: { type: 'int', unsigned: true, nullable: false },
    cliente_id: { type: 'int', unsigned: true, nullable: false },
    pedido_id: { type: 'int', unsigned: true, nullable: false },
    calificacion: { type: 'tinyint', unsigned: true, nullable: false },
    comentario: { type: 'text', nullable: true },
    created_at: { type: 'timestamp', nullable: true },
    updated_at: { type: 'timestamp', nullable: true },
  },
  uniques: [{ name: 'uq_prod_cliente_pedido', columns: ['producto_id', 'cliente_id', 'pedido_id'] }],
  indices: [{ name: 'idx_producto', columns: ['producto_id'] }],
  relations: {
    producto: { type: 'many-to-one', target: 'productos', joinColumn: { name: 'producto_id' }, onDelete: 'CASCADE' },
    cliente: { type: 'many-to-one', target: 'clientes', joinColumn: { name: 'cliente_id' }, onDelete: 'CASCADE' },
    pedido: { type: 'many-to-one', target: 'pedidos_online', joinColumn: { name: 'pedido_id' }, onDelete: 'CASCADE' },
  },
});

const ResenaRespuesta = new EntitySchema({
  name: 'resenas_respuestas',
  columns: {
    id_resena_respuesta: { type: 'int', unsigned: true, primary: true, generated: 'increment' },
    resena_id: { type: 'int', unsigned: true, nullable: false },
    usuario_id: { type: 'int', unsigned: true, nullable: false },
    respuesta: { type: 'text', nullable: false },
    created_at: { type: 'timestamp', nullable: true },
    updated_at: { type: 'timestamp', nullable: true },
  },
  relations: {
    resena: { type: 'many-to-one', target: 'resenas', joinColumn: { name: 'resena_id' }, onDelete: 'CASCADE' },
    usuario: { type: 'many-to-one', target: 'usuarios', joinColumn: { name: 'usuario_id' } },
  },
});

module.exports = {
  ClienteDireccion,
  Carrito,
  ItemCarrito,
  PedidoOnline,
  DetallePedidoOnline,
  PagoOnline,
  AsignacionDomiciliario,
  EstadoPedidoHistorial,
  Resena,
  ResenaRespuesta,
};
