const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const Alerta = sequelize.define('Alerta', {
  tipo: {
    type: DataTypes.ENUM('stock_bajo', 'agotado', 'por_vencer', 'vencido', 'credito_vencer', 'credito_vencido'),
    allowNull: false
  },
  prioridad: {
    type: DataTypes.ENUM('baja', 'media', 'alta', 'critica'),
    allowNull: false,
    defaultValue: 'media'
  },
  titulo:          { type: DataTypes.STRING(255), allowNull: false },
  mensaje:         { type: DataTypes.TEXT, allowNull: false },
  referencia_tipo: { type: DataTypes.STRING(50), allowNull: true },
  referencia_id:   { type: DataTypes.INTEGER, allowNull: true },
  leida:           { type: DataTypes.BOOLEAN, defaultValue: false },
  resuelta:        { type: DataTypes.BOOLEAN, defaultValue: false },
  fecha_lectura:   { type: DataTypes.DATE, allowNull: true },
  fecha_resolucion:{ type: DataTypes.DATE, allowNull: true },
  resuelta_por:    { type: DataTypes.INTEGER, allowNull: true },
  datos_extra:     { type: DataTypes.JSON, allowNull: true }
}, {
  tableName: 'alertas',
  underscored: true
});

module.exports = Alerta;
