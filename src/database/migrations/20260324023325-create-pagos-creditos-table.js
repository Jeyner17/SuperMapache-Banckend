'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pagos_creditos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      credito_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'creditos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Cajero que recibió el pago'
      },
      monto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      fecha_pago: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      metodo_pago: {
        type: Sequelize.ENUM('efectivo', 'tarjeta', 'transferencia'),
        allowNull: false,
        defaultValue: 'efectivo'
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

    await queryInterface.addIndex('pagos_creditos', ['credito_id']);
    await queryInterface.addIndex('pagos_creditos', ['usuario_id']);
    await queryInterface.addIndex('pagos_creditos', ['fecha_pago']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pagos_creditos');
  }
};
