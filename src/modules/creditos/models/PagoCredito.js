const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const PagoCredito = sequelize.define('PagoCredito', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  credito_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'creditos', key: 'id' }
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' }
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  fecha_pago: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  metodo_pago: {
    type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia'),
    allowNull: false,
    defaultValue: 'efectivo'
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'pagos_creditos',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['credito_id'] },
    { fields: ['usuario_id'] },
    { fields: ['fecha_pago'] }
  ]
});

module.exports = PagoCredito;
