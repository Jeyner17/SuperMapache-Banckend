const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const Gasto = sequelize.define('Gasto', {
  numero_gasto: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  categoria: {
    type: DataTypes.ENUM('servicios', 'mantenimiento', 'sueldos', 'insumos', 'alquiler', 'transporte', 'publicidad', 'otros'),
    allowNull: false
  },
  descripcion:  { type: DataTypes.TEXT, allowNull: false },
  monto:        { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  fecha_gasto:  { type: DataTypes.DATEONLY, allowNull: false },
  metodo_pago: {
    type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia'),
    allowNull: false,
    defaultValue: 'efectivo'
  },
  comprobante: { type: DataTypes.STRING(100), allowNull: true },
  notas:       { type: DataTypes.TEXT, allowNull: true },
  usuario_id:  { type: DataTypes.INTEGER, allowNull: false },
  turno_id:    { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'gastos',
  underscored: true
});

module.exports = Gasto;
