'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categorias', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      descripcion: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      icono: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'Package'
      },
      color: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: '#3b82f6'
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    await queryInterface.addIndex('categorias', ['nombre'], {
      unique: true,
      name: 'categorias_nombre_unique'
    });
    await queryInterface.addIndex('categorias', ['activo']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('categorias');
  }
};