'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('creditos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      numero_credito: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Ej: CRED-2026-000001'
      },
      cliente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'clientes_credito', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      venta_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'ventas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Venta de origen si viene del POS'
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Usuario que registró el crédito'
      },
      monto_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      monto_pagado: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      saldo_pendiente: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      fecha_credito: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      fecha_vencimiento: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha límite de pago'
      },
      dias_plazo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'parcial', 'pagado', 'vencido'),
        allowNull: false,
        defaultValue: 'pendiente'
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

    await queryInterface.addIndex('creditos', ['numero_credito']);
    await queryInterface.addIndex('creditos', ['cliente_id']);
    await queryInterface.addIndex('creditos', ['estado']);
    await queryInterface.addIndex('creditos', ['fecha_vencimiento']);
    await queryInterface.addIndex('creditos', ['venta_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('creditos');
  }
};
