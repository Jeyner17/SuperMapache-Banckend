'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('proveedores', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      razon_social: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      nombre_comercial: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      ruc: {
        type: Sequelize.STRING(13),
        allowNull: true,
        unique: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      celular: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      direccion: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      ciudad: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      pais: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: 'Ecuador'
      },
      contacto_nombre: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      contacto_telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      contacto_email: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      tipo_proveedor: {
        type: Sequelize.ENUM('productos', 'servicios', 'ambos'),
        defaultValue: 'productos'
      },
      calificacion: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      dias_credito: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      limite_credito: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      notas: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.addIndex('proveedores', ['ruc']);
    await queryInterface.addIndex('proveedores', ['razon_social']);
    await queryInterface.addIndex('proveedores', ['activo']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('proveedores');
  }
};