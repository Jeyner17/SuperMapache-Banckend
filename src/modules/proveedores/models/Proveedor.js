const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const Proveedor = sequelize.define('Proveedor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  razon_social: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  nombre_comercial: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  ruc: {
    type: DataTypes.STRING(13),
    allowNull: true,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  celular: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ciudad: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  pais: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Ecuador'
  },
  contacto_nombre: {
    type: DataTypes.STRING(150),
    allowNull: true,
    comment: 'Nombre del contacto principal'
  },
  contacto_telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  contacto_email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tipo_proveedor: {
    type: DataTypes.ENUM('productos', 'servicios', 'ambos'),
    defaultValue: 'productos'
  },
  calificacion: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0.00,
    comment: 'Calificación del proveedor (0-5)'
  },
  dias_credito: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Días de crédito que otorga el proveedor'
  },
  limite_credito: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Límite de crédito en USD'
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'proveedores',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['ruc'] },
    { fields: ['razon_social'] },
    { fields: ['activo'] }
  ]
});

module.exports = Proveedor;