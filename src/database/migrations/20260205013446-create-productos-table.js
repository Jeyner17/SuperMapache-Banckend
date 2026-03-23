'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('productos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      codigo_barras: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      sku: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      nombre: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      categoria_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categorias',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      precio_costo: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      precio_venta: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      margen_ganancia: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      imagen: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      stock_minimo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10
      },
      stock_maximo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100
      },
      requiere_caducidad: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      dias_alerta_caducidad: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 21
      },
      unidad_medida: {
        type: Sequelize.ENUM('unidad', 'kg', 'g', 'lb', 'oz', 'l', 'ml', 'caja', 'paquete', 'docena', 'bolsa', 'lata', 'botella'),
        defaultValue: 'unidad'
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
    await queryInterface.addIndex('productos', ['nombre']);
    await queryInterface.addIndex('productos', ['codigo_barras']);
    await queryInterface.addIndex('productos', ['sku']);
    await queryInterface.addIndex('productos', ['categoria_id']);
    await queryInterface.addIndex('productos', ['activo']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('productos');
  }
};