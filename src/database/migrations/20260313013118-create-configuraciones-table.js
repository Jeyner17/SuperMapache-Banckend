'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('configuraciones', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      clave: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      valor: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tipo: {
        type: Sequelize.ENUM('texto', 'numero', 'boolean', 'json', 'imagen', 'email', 'porcentaje'),
        defaultValue: 'texto'
      },
      categoria: {
        type: Sequelize.ENUM('empresa', 'impuestos', 'inventario', 'alertas', 'sistema', 'pos', 'notificaciones'),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      es_publica: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    await queryInterface.addIndex('configuraciones', ['clave'], { unique: true });
    await queryInterface.addIndex('configuraciones', ['categoria']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('configuraciones');
  }
};