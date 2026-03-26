const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const Auditoria = sequelize.define('Auditoria', {
  usuario_id:     { type: DataTypes.INTEGER, allowNull: true },
  usuario_nombre: { type: DataTypes.STRING(100), allowNull: true },
  usuario_rol:    { type: DataTypes.STRING(50),  allowNull: true },
  accion: {
    type: DataTypes.ENUM('crear', 'actualizar', 'eliminar', 'login', 'logout', 'ver', 'generar', 'otro'),
    allowNull: false
  },
  modulo:          { type: DataTypes.STRING(50), allowNull: false },
  descripcion:     { type: DataTypes.TEXT,       allowNull: true },
  referencia_tipo: { type: DataTypes.STRING(50), allowNull: true },
  referencia_id:   { type: DataTypes.INTEGER,    allowNull: true },
  datos_extra:     { type: DataTypes.JSON,        allowNull: true },
  ip:              { type: DataTypes.STRING(45), allowNull: true },
  user_agent:      { type: DataTypes.TEXT,        allowNull: true }
}, {
  tableName: 'auditoria',
  underscored: true
});

module.exports = Auditoria;
