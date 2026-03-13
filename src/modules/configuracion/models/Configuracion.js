const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const Configuracion = sequelize.define('Configuracion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clave: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Identificador único de la configuración'
  },
  valor: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Valor de la configuración (puede ser JSON para valores complejos)'
  },
  tipo: {
    type: DataTypes.ENUM('texto', 'numero', 'boolean', 'json', 'imagen', 'email', 'porcentaje'),
    defaultValue: 'texto',
    comment: 'Tipo de dato para validación'
  },
  categoria: {
    type: DataTypes.ENUM('empresa', 'impuestos', 'inventario', 'alertas', 'sistema', 'pos', 'notificaciones'),
    allowNull: false,
    comment: 'Categoría de la configuración'
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Descripción de qué hace esta configuración'
  },
  es_publica: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Si es true, está disponible sin autenticación'
  }
}, {
  tableName: 'configuraciones',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['clave'], unique: true },
    { fields: ['categoria'] }
  ]
});

module.exports = Configuracion;