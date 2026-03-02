const Categoria = require('./Categoria');
const Producto = require('../../productos/models/Producto');

// Relación Categoria -> Productos
Categoria.hasMany(Producto, {
  foreignKey: 'categoria_id',
  as: 'productos'
});

Producto.belongsTo(Categoria, {
  foreignKey: 'categoria_id',
  as: 'categoria'
});

module.exports = {
  Categoria
};