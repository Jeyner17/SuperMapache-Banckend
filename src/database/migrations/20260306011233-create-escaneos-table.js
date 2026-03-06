'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('escaneos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      codigo_barras: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      producto_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'productos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
      modulo: {
        type: Sequelize.ENUM('pos', 'inventario', 'compras', 'verificacion'),
        allowNull: false
      },
      accion: {
        type: Sequelize.ENUM('busqueda', 'venta', 'recepcion', 'verificacion'),
        allowNull: false
      },
      resultado: {
        type: Sequelize.ENUM('exitoso', 'no_encontrado', 'error'),
        defaultValue: 'exitoso'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING(45),
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
    await queryInterface.addIndex('escaneos', ['codigo_barras']);
    await queryInterface.addIndex('escaneos', ['producto_id']);
    await queryInterface.addIndex('escaneos', ['usuario_id']);
    await queryInterface.addIndex('escaneos', ['modulo']);
    await queryInterface.addIndex('escaneos', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('escaneos');
  }
};