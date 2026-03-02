const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  permisos: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'roles',
  timestamps: true,
  underscored: true
});

module.exports = Role;