const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const Credito = sequelize.define('Credito', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_credito: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'clientes_credito', key: 'id' }
  },
  venta_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'ventas', key: 'id' }
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' }
  },
  monto_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  monto_pagado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  saldo_pendiente: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  fecha_credito: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_vencimiento: {
    type: DataTypes.DATE,
    allowNull: false
  },
  dias_plazo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'parcial', 'pagado', 'vencido'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'creditos',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['numero_credito'] },
    { fields: ['cliente_id'] },
    { fields: ['estado'] },
    { fields: ['fecha_vencimiento'] }
  ]
});

module.exports = Credito;
