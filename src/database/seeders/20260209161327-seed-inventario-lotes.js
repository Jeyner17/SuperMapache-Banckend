'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    
    // Insertar lotes de inventario
    await queryInterface.bulkInsert('inventario_lotes', [
      {
        id: 1,
        producto_id: 1, // Cerveza Pilsener
        numero_lote: 'LOTE-2026-001',
        cantidad_inicial: 100,
        cantidad_actual: 100,
        fecha_ingreso: now,
        fecha_caducidad: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // +90 días
        ubicacion: 'Estante A-1',
        estado: 'disponible',
        notas: 'Lote inicial de Cerveza Pilsener',
        created_at: now,
        updated_at: now
      },
      {
        id: 2,
        producto_id: 2, // Coca Cola
        numero_lote: 'LOTE-2026-002',
        cantidad_inicial: 200,
        cantidad_actual: 200,
        fecha_ingreso: now,
        fecha_caducidad: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000), // +120 días
        ubicacion: 'Estante A-2',
        estado: 'disponible',
        created_at: now,
        updated_at: now
      },
      {
        id: 3,
        producto_id: 3, // Leche Entera
        numero_lote: 'LOTE-2026-003',
        cantidad_inicial: 50,
        cantidad_actual: 50,
        fecha_ingreso: now,
        fecha_caducidad: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 días
        ubicacion: 'Refrigerador 1',
        estado: 'disponible',
        notas: 'Producto perecedero - refrigerar',
        created_at: now,
        updated_at: now
      },
      {
        id: 4,
        producto_id: 4, // Yogurt Fresa
        numero_lote: 'LOTE-2026-004',
        cantidad_inicial: 80,
        cantidad_actual: 80,
        fecha_ingreso: now,
        fecha_caducidad: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // +14 días
        ubicacion: 'Refrigerador 2',
        estado: 'disponible',
        created_at: now,
        updated_at: now
      },
      {
        id: 5,
        producto_id: 5, // Pan Integral
        numero_lote: 'LOTE-2026-005',
        cantidad_inicial: 30,
        cantidad_actual: 30,
        fecha_ingreso: now,
        fecha_caducidad: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // +5 días
        ubicacion: 'Estante B-1',
        estado: 'disponible',
        created_at: now,
        updated_at: now
      },
      {
        id: 6,
        producto_id: 6, // Doritos
        numero_lote: 'LOTE-2026-006',
        cantidad_inicial: 150,
        cantidad_actual: 150,
        fecha_ingreso: now,
        fecha_caducidad: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000), // +180 días
        ubicacion: 'Estante C-1',
        estado: 'disponible',
        created_at: now,
        updated_at: now
      },
      // Lote próximo a vencer (para testing de alertas)
      {
        id: 7,
        producto_id: 3, // Leche Entera
        numero_lote: 'LOTE-2026-007',
        cantidad_inicial: 30,
        cantidad_actual: 30,
        fecha_ingreso: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // -20 días
        fecha_caducidad: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // +5 días (por vencer)
        ubicacion: 'Refrigerador 1',
        estado: 'por_vencer',
        notas: 'URGENTE: Próximo a vencer',
        created_at: now,
        updated_at: now
      }
    ]);

    // Insertar movimientos de inventario (entradas iniciales)
    await queryInterface.bulkInsert('movimientos_inventario', [
      {
        lote_id: 1,
        producto_id: 1,
        tipo_movimiento: 'entrada',
        cantidad: 100,
        cantidad_anterior: 0,
        cantidad_nueva: 100,
        motivo: 'Compra inicial',
        referencia_tipo: 'compra',
        usuario_id: 1,
        notas: 'Carga inicial de inventario',
        created_at: now,
        updated_at: now
      },
      {
        lote_id: 2,
        producto_id: 2,
        tipo_movimiento: 'entrada',
        cantidad: 200,
        cantidad_anterior: 0,
        cantidad_nueva: 200,
        motivo: 'Compra inicial',
        referencia_tipo: 'compra',
        usuario_id: 1,
        created_at: now,
        updated_at: now
      },
      {
        lote_id: 3,
        producto_id: 3,
        tipo_movimiento: 'entrada',
        cantidad: 50,
        cantidad_anterior: 0,
        cantidad_nueva: 50,
        motivo: 'Compra inicial',
        referencia_tipo: 'compra',
        usuario_id: 1,
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('movimientos_inventario', null, {});
    await queryInterface.bulkDelete('inventario_lotes', null, {});
  }
};