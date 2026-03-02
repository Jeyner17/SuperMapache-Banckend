const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  icono: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'Package'
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '#3b82f6'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'categorias',
  timestamps: true,
  underscored: true
});

module.exports = Categoria;