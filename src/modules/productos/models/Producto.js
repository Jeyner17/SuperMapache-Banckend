const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo_barras: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categorias',
      key: 'id'
    }
  },
  precio_costo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  precio_venta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  margen_ganancia: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Porcentaje de ganancia'
  },
  imagen: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  stock_minimo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  stock_maximo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100
  },
  requiere_caducidad: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  dias_alerta_caducidad: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 21,
    comment: 'Días antes de caducidad para alertar (por defecto 3 semanas)'
  },
  unidad_medida: {
    type: DataTypes.ENUM('unidad', 'kg', 'g', 'lb', 'oz', 'l', 'ml', 'caja', 'paquete', 'docena', 'bolsa', 'lata', 'botella'),
    defaultValue: 'unidad'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'productos',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeSave: async (producto) => {
      // Calcular margen de ganancia automáticamente
      if (producto.precio_costo && producto.precio_venta) {
        const ganancia = producto.precio_venta - producto.precio_costo;
        producto.margen_ganancia = (ganancia / producto.precio_costo) * 100;
      }
    }
  }
});

module.exports = Producto;