const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const CompraDetalle = sequelize.define('CompraDetalle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  compra_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'compras',
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
  cantidad_pedida: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cantidad_recibida: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
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
  lote_generado_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'inventario_lotes',
      key: 'id'
    },
    comment: 'Lote de inventario generado al recibir'
  },
  numero_lote_proveedor: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Número de lote del proveedor'
  },
  fecha_caducidad: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'compras_detalles',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['compra_id'] },
    { fields: ['producto_id'] },
    { fields: ['lote_generado_id'] }
  ]
});

module.exports = CompraDetalle;