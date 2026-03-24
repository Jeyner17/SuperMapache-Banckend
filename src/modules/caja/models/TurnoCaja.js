const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const TurnoCaja = sequelize.define('TurnoCaja', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_turno: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' }
  },
  fecha_apertura: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_cierre: {
    type: DataTypes.DATE,
    allowNull: true
  },
  saldo_inicial: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total_ventas_efectivo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total_ventas_tarjeta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total_ventas_transferencia: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total_ingresos: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total_egresos: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total_esperado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total_real: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  diferencia: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('abierta', 'cerrada'),
    allowNull: false,
    defaultValue: 'abierta'
  },
  notas_apertura: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notas_cierre: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'turnos_caja',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['numero_turno'] },
    { fields: ['usuario_id'] },
    { fields: ['estado'] },
    { fields: ['fecha_apertura'] }
  ]
});

module.exports = TurnoCaja;
