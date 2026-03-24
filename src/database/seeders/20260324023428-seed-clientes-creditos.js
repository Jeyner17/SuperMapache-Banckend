'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Clientes de crédito
    await queryInterface.bulkInsert('clientes_credito', [
      {
        id: 1,
        nombre: 'Carlos López',
        cedula: '1001234567',
        telefono: '0991234567',
        email: 'carlos.lopez@email.com',
        direccion: 'Calle Principal 123',
        limite_credito: 200.00,
        saldo_pendiente: 15.00,
        activo: true,
        notas: null,
        created_at: now,
        updated_at: now
      },
      {
        id: 2,
        nombre: 'María Fernanda Ríos',
        cedula: '1009876543',
        telefono: '0987654321',
        email: null,
        direccion: 'Av. Los Álamos 456',
        limite_credito: 500.00,
        saldo_pendiente: 0.00,
        activo: true,
        notas: 'Cliente frecuente',
        created_at: now,
        updated_at: now
      },
      {
        id: 3,
        nombre: 'Juan Pérez',
        cedula: null,
        telefono: '0961112233',
        email: null,
        direccion: null,
        limite_credito: 0.00,
        saldo_pendiente: 45.50,
        activo: true,
        notas: null,
        created_at: now,
        updated_at: now
      }
    ]);

    // Crédito pendiente de Carlos ($30 fiado, abonó $15)
    const vencCarlos = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // vence en 10 días
    await queryInterface.bulkInsert('creditos', [
      {
        id: 1,
        numero_credito: 'CRED-2026-000001',
        cliente_id: 1,
        venta_id: null,
        usuario_id: 1,
        monto_total: 30.00,
        monto_pagado: 15.00,
        saldo_pendiente: 15.00,
        fecha_credito: now,
        fecha_vencimiento: vencCarlos,
        dias_plazo: 15,
        estado: 'parcial',
        notas: 'Crédito de prueba',
        created_at: now,
        updated_at: now
      },
      {
        id: 2,
        numero_credito: 'CRED-2026-000002',
        cliente_id: 3,
        venta_id: null,
        usuario_id: 1,
        monto_total: 45.50,
        monto_pagado: 0.00,
        saldo_pendiente: 45.50,
        fecha_credito: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        fecha_vencimiento: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
        dias_plazo: 30,
        estado: 'pendiente',
        notas: null,
        created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      }
    ]);

    // Abono de Carlos
    await queryInterface.bulkInsert('pagos_creditos', [
      {
        credito_id: 1,
        usuario_id: 1,
        monto: 15.00,
        fecha_pago: now,
        metodo_pago: 'efectivo',
        notas: 'Abono parcial',
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('pagos_creditos', null, {});
    await queryInterface.bulkDelete('creditos', null, {});
    await queryInterface.bulkDelete('clientes_credito', null, {});
  }
};
