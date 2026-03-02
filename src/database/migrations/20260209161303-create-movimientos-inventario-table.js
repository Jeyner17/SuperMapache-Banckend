'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movimientos_inventario', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      lote_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'inventario_lotes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      producto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'productos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      tipo_movimiento: {
        type: Sequelize.ENUM('entrada', 'salida', 'ajuste', 'merma', 'devolucion'),
        allowNull: false
      },
      cantidad: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      cantidad_anterior: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      cantidad_nueva: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      motivo: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      referencia_tipo: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      referencia_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      notas: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Índices
    await queryInterface.addIndex('movimientos_inventario', ['lote_id']);
    await queryInterface.addIndex('movimientos_inventario', ['producto_id']);
    await queryInterface.addIndex('movimientos_inventario', ['tipo_movimiento']);
    await queryInterface.addIndex('movimientos_inventario', ['created_at']);
    await queryInterface.addIndex('movimientos_inventario', ['usuario_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('movimientos_inventario');
  }
};