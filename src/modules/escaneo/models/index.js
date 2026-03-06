const Escaneo = require('./Escaneo');
const { Producto } = require('../../productos/models');
const { User } = require('../../auth/models');

// Relaciones
Escaneo.belongsTo(Producto, {
  foreignKey: 'producto_id',
  as: 'producto'
});

Escaneo.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

module.exports = {
  Escaneo
};