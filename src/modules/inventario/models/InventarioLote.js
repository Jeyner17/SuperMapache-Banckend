const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const InventarioLote = sequelize.define('InventarioLote', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'productos',
            key: 'id'
        }
    },
    numero_lote: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Número de lote del proveedor'
    },
    cantidad_inicial: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Cantidad inicial del lote'
    },
    cantidad_actual: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Cantidad actual disponible'
    },
    fecha_ingreso: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    fecha_caducidad: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha de vencimiento del lote'
    },
    proveedor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID del proveedor de este lote'
    },
    ubicacion: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Ubicación física en el almacén (ej: Estante A-3)'
    },
    estado: {
        type: DataTypes.ENUM('disponible', 'por_vencer', 'vencido', 'agotado'),
        defaultValue: 'disponible'
    },
    notas: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'inventario_lotes',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['producto_id'] },
        { fields: ['estado'] },
        { fields: ['fecha_caducidad'] },
        { fields: ['numero_lote'] }
    ]
});

module.exports = InventarioLote;