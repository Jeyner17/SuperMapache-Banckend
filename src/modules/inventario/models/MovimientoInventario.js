const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connection');

const MovimientoInventario = sequelize.define('MovimientoInventario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    lote_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'inventario_lotes',
            key: 'id'
        }
    },
    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'productos',
            key: 'id'
        }
    },
    tipo_movimiento: {
        type: DataTypes.ENUM('entrada', 'salida', 'ajuste', 'merma', 'devolucion'),
        allowNull: false
    },
    cantidad: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    cantidad_anterior: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Cantidad antes del movimiento'
    },
    cantidad_nueva: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Cantidad después del movimiento'
    },
    motivo: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Motivo del movimiento (venta, compra, ajuste, etc.)'
    },
    referencia_tipo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Tipo de documento (venta, compra, ajuste)'
    },
    referencia_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID del documento relacionado'
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    notas: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'movimientos_inventario',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['lote_id'] },
        { fields: ['producto_id'] },
        { fields: ['tipo_movimiento'] },
        { fields: ['created_at'] }
    ]
});

module.exports = MovimientoInventario;