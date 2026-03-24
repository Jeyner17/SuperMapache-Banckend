const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const ClienteCredito = sequelize.define('ClienteCredito', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  cedula: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  limite_credito: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  saldo_pendiente: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'clientes_credito',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['cedula'] },
    { fields: ['nombre'] },
    { fields: ['activo'] }
  ]
});

module.exports = ClienteCredito;
