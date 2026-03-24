'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('alertas', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      tipo: {
        type: Sequelize.ENUM('stock_bajo', 'agotado', 'por_vencer', 'vencido', 'credito_vencer', 'credito_vencido'),
        allowNull: false
      },
      prioridad: {
        type: Sequelize.ENUM('baja', 'media', 'alta', 'critica'),
        allowNull: false,
        defaultValue: 'media'
      },
      titulo:          { type: Sequelize.STRING(255), allowNull: false },
      mensaje:         { type: Sequelize.TEXT, allowNull: false },
      referencia_tipo: { type: Sequelize.STRING(50), allowNull: true },
      referencia_id:   { type: Sequelize.INTEGER, allowNull: true },
      leida:           { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
      resuelta:        { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
      fecha_lectura:   { type: Sequelize.DATE, allowNull: true },
      fecha_resolucion:{ type: Sequelize.DATE, allowNull: true },
      resuelta_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      datos_extra:  { type: Sequelize.JSON, allowNull: true },
      created_at:   { type: Sequelize.DATE, allowNull: false },
      updated_at:   { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.addIndex('alertas', ['tipo']);
    await queryInterface.addIndex('alertas', ['prioridad']);
    await queryInterface.addIndex('alertas', ['leida']);
    await queryInterface.addIndex('alertas', ['resuelta']);
    await queryInterface.addIndex('alertas', ['referencia_tipo', 'referencia_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('alertas');
  }
};
