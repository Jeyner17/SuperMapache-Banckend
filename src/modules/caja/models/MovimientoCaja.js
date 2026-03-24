const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const MovimientoCaja = sequelize.define('MovimientoCaja', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  turno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'turnos_caja', key: 'id' }
  },
  tipo: {
    type: DataTypes.ENUM('apertura', 'venta_efectivo', 'venta_tarjeta', 'venta_transferencia', 'ingreso', 'egreso', 'cierre'),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  referencia_tipo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  referencia_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' }
  }
}, {
  tableName: 'movimientos_caja',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['turno_id'] },
    { fields: ['tipo'] },
    { fields: ['usuario_id'] }
  ]
});

module.exports = MovimientoCaja;
