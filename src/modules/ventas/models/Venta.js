const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const Venta = sequelize.define('Venta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_venta: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Número único de la venta (ej: VENTA-2026-001)'
  },
  fecha_venta: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
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
  metodo_pago: {
    type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'mixto', 'credito'),
    defaultValue: 'efectivo'
  },
  monto_recibido: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Monto entregado por el cliente (para calcular cambio)'
  },
  cambio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  estado: {
    type: DataTypes.ENUM('completada', 'cancelada'),
    defaultValue: 'completada'
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    comment: 'Cajero que realizó la venta'
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'ventas',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['numero_venta'] },
    { fields: ['fecha_venta'] },
    { fields: ['usuario_id'] },
    { fields: ['estado'] }
  ]
});

module.exports = Venta;