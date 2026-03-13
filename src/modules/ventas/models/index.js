const Venta = require('./Venta');
const VentaDetalle = require('./VentaDetalle');
const { Producto } = require('../../productos/models');
const { User } = require('../../auth/models');

// Relaciones
Venta.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

Venta.hasMany(VentaDetalle, {
  foreignKey: 'venta_id',
  as: 'detalles'
});

VentaDetalle.belongsTo(Venta, {
  foreignKey: 'venta_id',
  as: 'venta'
});

VentaDetalle.belongsTo(Producto, {
  foreignKey: 'producto_id',
  as: 'producto'
});

module.exports = {
  Venta,
  VentaDetalle
};