'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('compras_detalles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      compra_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'compras',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      cantidad_pedida: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      cantidad_recibida: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      precio_unitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      impuesto: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      descuento: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      lote_generado_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'inventario_lotes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      numero_lote_proveedor: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      fecha_caducidad: {
        type: Sequelize.DATE,
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
    await queryInterface.addIndex('compras_detalles', ['compra_id']);
    await queryInterface.addIndex('compras_detalles', ['producto_id']);
    await queryInterface.addIndex('compras_detalles', ['lote_generado_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('compras_detalles');
  }
};