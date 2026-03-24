'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clientes_credito', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      cedula: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Cédula o RUC del cliente'
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      direccion: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      limite_credito: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: '0 = sin límite definido'
      },
      saldo_pendiente: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Suma de todos los créditos pendientes'
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    await queryInterface.addIndex('clientes_credito', ['cedula']);
    await queryInterface.addIndex('clientes_credito', ['nombre']);
    await queryInterface.addIndex('clientes_credito', ['activo']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('clientes_credito');
  }
};
