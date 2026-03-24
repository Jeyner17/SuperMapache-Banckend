const Alerta = require('./Alerta');
const User = require('../../auth/models/Usuario');

// Asociaciones
Alerta.belongsTo(User, { as: 'resuelto_por_usuario', foreignKey: 'resuelta_por' });

module.exports = { Alerta };
