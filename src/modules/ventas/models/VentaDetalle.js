const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const VentaDetalle = sequelize.define('VentaDetalle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  venta_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ventas',
      key: 'id'
    }
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'productos',
      key: 'id'
    }
  },
  cantidad: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Precio al momento de la venta'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  impuesto: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  descuento: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  lotes_usados: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array de lotes usados con FIFO: [{lote_id, cantidad}]'
  }
}, {
  tableName: 'ventas_detalles',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['venta_id'] },
    { fields: ['producto_id'] }
  ]
});

module.exports = VentaDetalle;