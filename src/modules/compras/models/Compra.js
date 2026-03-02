const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const Compra = sequelize.define('Compra', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_compra: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Número único de la compra (ej: COMP-2026-001)'
  },
  proveedor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'proveedores',
      key: 'id'
    }
  },
  fecha_compra: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_entrega_estimada: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_entrega_real: {
    type: DataTypes.DATE,
    allowNull: true
  },
  numero_factura: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Número de factura del proveedor'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  impuestos: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  descuento: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'recibida', 'parcial', 'cancelada'),
    defaultValue: 'pendiente'
  },
  tipo_pago: {
    type: DataTypes.ENUM('contado', 'credito'),
    defaultValue: 'contado'
  },
  dias_credito: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  fecha_vencimiento_pago: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estado_pago: {
    type: DataTypes.ENUM('pendiente', 'pagado', 'parcial', 'vencido'),
    defaultValue: 'pendiente'
  },
  monto_pagado: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    comment: 'Usuario que registró la compra'
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'compras',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['numero_compra'] },
    { fields: ['proveedor_id'] },
    { fields: ['estado'] },
    { fields: ['fecha_compra'] },
    { fields: ['usuario_id'] }
  ]
});

module.exports = Compra;