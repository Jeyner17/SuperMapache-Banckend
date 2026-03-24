'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movimientos_caja', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      turno_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'turnos_caja', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      tipo: {
        type: Sequelize.ENUM('apertura', 'venta_efectivo', 'venta_tarjeta', 'venta_transferencia', 'ingreso', 'egreso', 'cierre'),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      monto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Siempre positivo; el tipo determina si es entrada o salida'
      },
      referencia_tipo: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'venta | manual'
      },
      referencia_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID de la venta relacionada'
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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

    await queryInterface.addIndex('movimientos_caja', ['turno_id']);
    await queryInterface.addIndex('movimientos_caja', ['tipo']);
    await queryInterface.addIndex('movimientos_caja', ['usuario_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('movimientos_caja');
  }
};
