'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventario_lotes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      numero_lote: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      cantidad_inicial: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      cantidad_actual: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      fecha_ingreso: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      fecha_caducidad: {
        type: Sequelize.DATE,
        allowNull: true
      },
      proveedor_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      ubicacion: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      estado: {
        type: Sequelize.ENUM('disponible', 'por_vencer', 'vencido', 'agotado'),
        defaultValue: 'disponible'
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
    await queryInterface.addIndex('inventario_lotes', ['producto_id']);
    await queryInterface.addIndex('inventario_lotes', ['estado']);
    await queryInterface.addIndex('inventario_lotes', ['fecha_caducidad']);
    await queryInterface.addIndex('inventario_lotes', ['numero_lote']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inventario_lotes');
  }
};