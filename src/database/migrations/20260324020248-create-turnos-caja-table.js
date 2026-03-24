'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('turnos_caja', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      numero_turno: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Número único del turno (ej: CAJA-2026-000001)'
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      fecha_apertura: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      fecha_cierre: {
        type: Sequelize.DATE,
        allowNull: true
      },
      saldo_inicial: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Dinero con el que se abre la caja'
      },
      total_ventas_efectivo: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Suma de ventas pagadas en efectivo'
      },
      total_ventas_tarjeta: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      total_ventas_transferencia: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      total_ingresos: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Ingresos manuales de efectivo durante el turno'
      },
      total_egresos: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Egresos manuales (gastos de caja chica)'
      },
      total_esperado: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'saldo_inicial + ventas_efectivo + ingresos - egresos'
      },
      total_real: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Dinero real contado al cierre'
      },
      diferencia: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'total_real - total_esperado'
      },
      estado: {
        type: Sequelize.ENUM('abierta', 'cerrada'),
        allowNull: false,
        defaultValue: 'abierta'
      },
      notas_apertura: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      notas_cierre: {
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

    await queryInterface.addIndex('turnos_caja', ['numero_turno']);
    await queryInterface.addIndex('turnos_caja', ['usuario_id']);
    await queryInterface.addIndex('turnos_caja', ['estado']);
    await queryInterface.addIndex('turnos_caja', ['fecha_apertura']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('turnos_caja');
  }
};
