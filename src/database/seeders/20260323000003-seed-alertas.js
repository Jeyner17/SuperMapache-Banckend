'use strict';

module.exports = {
  up: async (queryInterface) => {
    const ahora = new Date();
    await queryInterface.bulkInsert('alertas', [
      {
        tipo: 'stock_bajo',
        prioridad: 'alta',
        titulo: 'Stock bajo: Leche Entera 1L',
        mensaje: '"Leche Entera 1L" tiene 8 unid. (mínimo: 20).',
        referencia_tipo: 'producto',
        referencia_id: null,
        leida: false,
        resuelta: false,
        fecha_lectura: null,
        fecha_resolucion: null,
        resuelta_por: null,
        datos_extra: JSON.stringify({ stock_actual: 8, stock_minimo: 20 }),
        created_at: ahora,
        updated_at: ahora
      },
      {
        tipo: 'por_vencer',
        prioridad: 'alta',
        titulo: 'Próximo a vencer: Yogurt Fresa',
        mensaje: 'Lote de "Yogurt Fresa" vence en 5 días. Stock: 24.',
        referencia_tipo: 'lote',
        referencia_id: null,
        leida: false,
        resuelta: false,
        fecha_lectura: null,
        fecha_resolucion: null,
        resuelta_por: null,
        datos_extra: JSON.stringify({ dias_restantes: 5, cantidad_actual: 24 }),
        created_at: ahora,
        updated_at: ahora
      },
      {
        tipo: 'vencido',
        prioridad: 'critica',
        titulo: 'VENCIDO: Pan Integral',
        mensaje: 'Lote de "Pan Integral" venció hace 2 días. Stock: 12.',
        referencia_tipo: 'lote',
        referencia_id: null,
        leida: false,
        resuelta: false,
        fecha_lectura: null,
        fecha_resolucion: null,
        resuelta_por: null,
        datos_extra: JSON.stringify({ dias_vencido: 2, cantidad_actual: 12 }),
        created_at: ahora,
        updated_at: ahora
      },
      {
        tipo: 'credito_vencer',
        prioridad: 'media',
        titulo: 'Crédito por vencer: Carlos López',
        mensaje: 'El crédito CRED-2026-000001 de "Carlos López" vence en 3 días. Pendiente: $15.00.',
        referencia_tipo: 'credito',
        referencia_id: null,
        leida: true,
        resuelta: false,
        fecha_lectura: ahora,
        fecha_resolucion: null,
        resuelta_por: null,
        datos_extra: JSON.stringify({ saldo_pendiente: 15.00, dias_restantes: 3 }),
        created_at: ahora,
        updated_at: ahora
      }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('alertas', null, {});
  }
};
