const InventarioLote = require('./InventarioLote');
const MovimientoInventario = require('./MovimientoInventario');
const { Producto } = require('../../productos/models');
const { User } = require('../../auth/models');

// Relaciones
Producto.hasMany(InventarioLote, {
    foreignKey: 'producto_id',
    as: 'lotes'
});

InventarioLote.belongsTo(Producto, {
    foreignKey: 'producto_id',
    as: 'producto'
});

InventarioLote.hasMany(MovimientoInventario, {
    foreignKey: 'lote_id',
    as: 'movimientos'
});

MovimientoInventario.belongsTo(InventarioLote, {
    foreignKey: 'lote_id',
    as: 'lote'
});

MovimientoInventario.belongsTo(Producto, {
    foreignKey: 'producto_id',
    as: 'producto'
});

MovimientoInventario.belongsTo(User, {
    foreignKey: 'usuario_id',
    as: 'usuario'
});

module.exports = {
    InventarioLote,
    MovimientoInventario
};