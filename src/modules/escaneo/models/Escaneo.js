const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const Escaneo = sequelize.define('Escaneo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo_barras: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Código de barras escaneado'
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'productos',
      key: 'id'
    },
    comment: 'Producto encontrado (null si no existe)'
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  modulo: {
    type: DataTypes.ENUM('pos', 'inventario', 'compras', 'verificacion'),
    allowNull: false,
    comment: 'Módulo desde donde se escaneó'
  },
  accion: {
    type: DataTypes.ENUM('busqueda', 'venta', 'recepcion', 'verificacion'),
    allowNull: false,
    comment: 'Acción realizada con el escaneo'
  },
  resultado: {
    type: DataTypes.ENUM('exitoso', 'no_encontrado', 'error'),
    defaultValue: 'exitoso'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Información adicional del escaneo'
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  }
}, {
  tableName: 'escaneos',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['codigo_barras'] },
    { fields: ['producto_id'] },
    { fields: ['usuario_id'] },
    { fields: ['modulo'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Escaneo;