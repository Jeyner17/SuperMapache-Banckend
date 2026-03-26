'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('gastos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      numero_gasto: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      categoria: {
        type: Sequelize.ENUM('servicios', 'mantenimiento', 'sueldos', 'insumos', 'alquiler', 'transporte', 'publicidad', 'otros'),
        allowNull: false
      },
      descripcion:  { type: Sequelize.TEXT, allowNull: false },
      monto:        { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      fecha_gasto:  { type: Sequelize.DATEONLY, allowNull: false },
      metodo_pago: {
        type: Sequelize.ENUM('efectivo', 'tarjeta', 'transferencia'),
        allowNull: false,
        defaultValue: 'efectivo'
      },
      comprobante: { type: Sequelize.STRING(100), allowNull: true },
      notas:       { type: Sequelize.TEXT, allowNull: true },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      turno_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'turnos_caja', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.addIndex('gastos', ['categoria']);
    await queryInterface.addIndex('gastos', ['fecha_gasto']);
    await queryInterface.addIndex('gastos', ['usuario_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('gastos');
  }
};
