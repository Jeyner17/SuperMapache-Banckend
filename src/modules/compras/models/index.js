const Compra = require('./Compra');
const CompraDetalle = require('./CompraDetalle');
const Proveedor = require('../../proveedores/models/Proveedor');
const { Producto } = require('../../productos/models');
const { User } = require('../../auth/models');
const { InventarioLote } = require('../../inventario/models');

// Relaciones
Proveedor.hasMany(Compra, {
  foreignKey: 'proveedor_id',
  as: 'compras'
});

Compra.belongsTo(Proveedor, {
  foreignKey: 'proveedor_id',
  as: 'proveedor'
});

Compra.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

Compra.hasMany(CompraDetalle, {
  foreignKey: 'compra_id',
  as: 'detalles'
});

CompraDetalle.belongsTo(Compra, {
  foreignKey: 'compra_id',
  as: 'compra'
});

CompraDetalle.belongsTo(Producto, {
  foreignKey: 'producto_id',
  as: 'producto'
});

CompraDetalle.belongsTo(InventarioLote, {
  foreignKey: 'lote_generado_id',
  as: 'lote'
});

module.exports = {
  Compra,
  CompraDetalle
};