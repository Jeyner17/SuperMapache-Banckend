'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar roles
    await queryInterface.bulkInsert('roles', [
      {
        id: 1,
        nombre: 'administrador',
        descripcion: 'Acceso total al sistema',
        permisos: JSON.stringify(['*']),
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        nombre: 'supervisor',
        descripcion: 'Acceso a reportes y gestión',
        permisos: JSON.stringify([
          'ver_reportes',
          'ver_auditoria',
          'gestionar_inventario',
          'gestionar_compras'
        ]),
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        nombre: 'cajero',
        descripcion: 'Acceso al punto de venta',
        permisos: JSON.stringify([
          'realizar_ventas',
          'abrir_cerrar_caja',
          'gestionar_creditos'
        ]),
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        nombre: 'empleado',
        descripcion: 'Acceso limitado',
        permisos: JSON.stringify([
          'consultar_productos',
          'ver_inventario'
        ]),
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Hash de contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Insertar usuario administrador
    await queryInterface.bulkInsert('usuarios', [
      {
        nombre: 'Jeyner Manzaba',
        email: 'admin@mapache.com',
        username: 'admin',
        password: hashedPassword,
        rol_id: 1,
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  }
};