'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const ayer = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const ayCierre = new Date(ayer.getTime() + 8 * 60 * 60 * 1000); // 8 horas después

    // Turno cerrado de ayer
    await queryInterface.bulkInsert('turnos_caja', [
      {
        id: 1,
        numero_turno: 'CAJA-2026-000001',
        usuario_id: 1,
        fecha_apertura: ayer,
        fecha_cierre: ayCierre,
        saldo_inicial: 50.00,
        total_ventas_efectivo: 285.00,
        total_ventas_tarjeta: 120.00,
        total_ventas_transferencia: 0.00,
        total_ingresos: 0.00,
        total_egresos: 20.00,
        total_esperado: 315.00,
        total_real: 315.00,
        diferencia: 0.00,
        estado: 'cerrada',
        notas_apertura: 'Turno de apertura de prueba',
        notas_cierre: 'Cierre sin novedades',
        created_at: ayer,
        updated_at: ayCierre
      }
    ]);

    // Movimientos del turno cerrado
    await queryInterface.bulkInsert('movimientos_caja', [
      {
        turno_id: 1,
        tipo: 'apertura',
        descripcion: 'Apertura de caja',
        monto: 50.00,
        referencia_tipo: 'manual',
        referencia_id: null,
        usuario_id: 1,
        created_at: ayer,
        updated_at: ayer
      },
      {
        turno_id: 1,
        tipo: 'venta_efectivo',
        descripcion: 'Venta: VENTA-202603-000001',
        monto: 285.00,
        referencia_tipo: 'venta',
        referencia_id: 1,
        usuario_id: 1,
        created_at: new Date(ayer.getTime() + 2 * 60 * 60 * 1000),
        updated_at: new Date(ayer.getTime() + 2 * 60 * 60 * 1000)
      },
      {
        turno_id: 1,
        tipo: 'egreso',
        descripcion: 'Compra de bolsas y material de empaque',
        monto: 20.00,
        referencia_tipo: 'manual',
        referencia_id: null,
        usuario_id: 1,
        created_at: new Date(ayer.getTime() + 4 * 60 * 60 * 1000),
        updated_at: new Date(ayer.getTime() + 4 * 60 * 60 * 1000)
      },
      {
        turno_id: 1,
        tipo: 'cierre',
        descripcion: 'Cierre de caja. Diferencia: $0.00',
        monto: 315.00,
        referencia_tipo: 'manual',
        referencia_id: null,
        usuario_id: 1,
        created_at: ayCierre,
        updated_at: ayCierre
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('movimientos_caja', null, {});
    await queryInterface.bulkDelete('turnos_caja', null, {});
  }
};
