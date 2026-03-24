const ClienteCredito = require('./ClienteCredito');
const Credito = require('./Credito');
const PagoCredito = require('./PagoCredito');
const { User } = require('../../auth/models');

// Cliente → Créditos
ClienteCredito.hasMany(Credito, {
  foreignKey: 'cliente_id',
  as: 'creditos'
});

Credito.belongsTo(ClienteCredito, {
  foreignKey: 'cliente_id',
  as: 'cliente'
});

// Crédito → Pagos
Credito.hasMany(PagoCredito, {
  foreignKey: 'credito_id',
  as: 'pagos'
});

PagoCredito.belongsTo(Credito, {
  foreignKey: 'credito_id',
  as: 'credito'
});

// Usuario → Créditos
Credito.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Usuario → Pagos
PagoCredito.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

module.exports = { ClienteCredito, Credito, PagoCredito };
