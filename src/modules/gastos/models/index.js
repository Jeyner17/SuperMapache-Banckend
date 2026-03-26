const Gasto = require('./Gasto');
const User = require('../../auth/models/User');
const TurnoCaja = require('../../caja/models/TurnoCaja');

Gasto.belongsTo(User,      { as: 'usuario',  foreignKey: 'usuario_id' });
Gasto.belongsTo(TurnoCaja, { as: 'turno',    foreignKey: 'turno_id'   });

module.exports = { Gasto };
