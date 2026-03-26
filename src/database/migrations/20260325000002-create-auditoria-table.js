'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('auditoria', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      usuario_id:     { type: Sequelize.INTEGER, allowNull: true },
      usuario_nombre: { type: Sequelize.STRING(100), allowNull: true },
      usuario_rol:    { type: Sequelize.STRING(50), allowNull: true },
      accion: {
        type: Sequelize.ENUM('crear', 'actualizar', 'eliminar', 'login', 'logout', 'ver', 'generar', 'otro'),
        allowNull: false
      },
      modulo:          { type: Sequelize.STRING(50), allowNull: false },
      descripcion:     { type: Sequelize.TEXT, allowNull: true },
      referencia_tipo: { type: Sequelize.STRING(50), allowNull: true },
      referencia_id:   { type: Sequelize.INTEGER, allowNull: true },
      datos_extra:     { type: Sequelize.JSON, allowNull: true },
      ip:              { type: Sequelize.STRING(45), allowNull: true },
      user_agent:      { type: Sequelize.TEXT, allowNull: true },
      created_at:      { type: Sequelize.DATE, allowNull: false },
      updated_at:      { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.addIndex('auditoria', ['usuario_id']);
    await queryInterface.addIndex('auditoria', ['accion']);
    await queryInterface.addIndex('auditoria', ['modulo']);
    await queryInterface.addIndex('auditoria', ['created_at']);
    await queryInterface.addIndex('auditoria', ['referencia_tipo', 'referencia_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('auditoria');
  }
};
