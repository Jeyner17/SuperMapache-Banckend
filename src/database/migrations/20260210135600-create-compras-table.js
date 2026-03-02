'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('compras', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      numero_compra: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      proveedor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'proveedores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      fecha_compra: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      fecha_entrega_estimada: {
        type: Sequelize.DATE,
        allowNull: true
      },
      fecha_entrega_real: {
        type: Sequelize.DATE,
        allowNull: true
      },
      numero_factura: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      impuestos: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      descuento: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'confirmada', 'recibida', 'parcial', 'cancelada'),
        defaultValue: 'pendiente'
      },
      tipo_pago: {
        type: Sequelize.ENUM('contado', 'credito'),
        defaultValue: 'contado'
      },
      dias_credito: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      fecha_vencimiento_pago: {
        type: Sequelize.DATE,
        allowNull: true
      },
      estado_pago: {
        type: Sequelize.ENUM('pendiente', 'pagado', 'parcial', 'vencido'),
        defaultValue: 'pendiente'
      },
      monto_pagado: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
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
    await queryInterface.addIndex('compras', ['numero_compra']);
    await queryInterface.addIndex('compras', ['proveedor_id']);
    await queryInterface.addIndex('compras', ['estado']);
    await queryInterface.addIndex('compras', ['fecha_compra']);
    await queryInterface.addIndex('compras', ['usuario_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('compras');
  }
};