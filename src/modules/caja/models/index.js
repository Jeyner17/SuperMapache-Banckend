const TurnoCaja = require('./TurnoCaja');
const MovimientoCaja = require('./MovimientoCaja');
const { User } = require('../../auth/models');

// Relaciones
TurnoCaja.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

User.hasMany(TurnoCaja, {
  foreignKey: 'usuario_id',
  as: 'turnos'
});

TurnoCaja.hasMany(MovimientoCaja, {
  foreignKey: 'turno_id',
  as: 'movimientos'
});

MovimientoCaja.belongsTo(TurnoCaja, {
  foreignKey: 'turno_id',
  as: 'turno'
});

MovimientoCaja.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

module.exports = { TurnoCaja, MovimientoCaja };
