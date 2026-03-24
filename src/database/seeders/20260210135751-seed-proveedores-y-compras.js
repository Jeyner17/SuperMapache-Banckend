'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    
    // Insertar proveedores
    await queryInterface.bulkInsert('proveedores', [
      {
        id: 1,
        razon_social: 'Distribuidora Nacional S.A.',
        nombre_comercial: 'DistNacional',
        ruc: '1791234567001',
        email: 'ventas@distnacional.com',
        telefono: '02-2345678',
        celular: '0998765432',
        direccion: 'Av. América y Mariana de Jesús',
        ciudad: 'Quito',
        pais: 'Ecuador',
        contacto_nombre: 'Juan Pérez',
        contacto_telefono: '0998765432',
        contacto_email: 'jperez@distnacional.com',
        tipo_proveedor: 'productos',
        calificacion: 4.50,
        dias_credito: 30,
        limite_credito: 10000.00,
        activo: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 2,
        razon_social: 'Importadora del Pacífico Ltda.',
        nombre_comercial: 'Impacifico',
        ruc: '1792345678001',
        email: 'info@impacifico.com',
        telefono: '04-2456789',
        celular: '0987654321',
        direccion: 'Av. 9 de Octubre 123',
        ciudad: 'Guayaquil',
        pais: 'Ecuador',
        contacto_nombre: 'María García',
        contacto_telefono: '0987654321',
        contacto_email: 'mgarcia@impacifico.com',
        tipo_proveedor: 'productos',
        calificacion: 4.80,
        dias_credito: 15,
        limite_credito: 5000.00,
        activo: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 3,
        razon_social: 'Productos Lácteos del Norte',
        nombre_comercial: 'Lácteos Norte',
        ruc: '1793456789001',
        email: 'pedidos@lacnorte.com',
        telefono: '06-2567890',
        celular: '0976543210',
        direccion: 'Panamericana Norte Km 5',
        ciudad: 'Ibarra',
        pais: 'Ecuador',
        contacto_nombre: 'Carlos Ruiz',
        contacto_telefono: '0976543210',
        contacto_email: 'cruiz@lacnorte.com',
        tipo_proveedor: 'productos',
        calificacion: 5.00,
        dias_credito: 7,
        limite_credito: 3000.00,
        notas: 'Especializado en productos lácteos frescos',
        activo: true,
        created_at: now,
        updated_at: now
      }
    ]);

    // Insertar una compra de ejemplo
    await queryInterface.bulkInsert('compras', [
      {
        id: 1,
        numero_compra: 'COMP-2026-000001',
        proveedor_id: 1,
        fecha_compra: now,
        fecha_entrega_estimada: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        numero_factura: 'FACT-001-001-0001234',
        subtotal: 500.00,
        impuestos: 60.00,
        descuento: 0.00,
        total: 560.00,
        estado: 'recibida',
        tipo_pago: 'credito',
        dias_credito: 30,
        fecha_vencimiento_pago: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        estado_pago: 'pendiente',
        monto_pagado: 0.00,
        usuario_id: 1,
        notas: 'Primera compra de prueba',
        created_at: now,
        updated_at: now
      }
    ]);

    // Insertar detalles de la compra
    await queryInterface.bulkInsert('compras_detalles', [
      {
        compra_id: 1,
        producto_id: 1, // Cerveza Pilsener
        cantidad_pedida: 100,
        cantidad_recibida: 100,
        precio_unitario: 0.85,
        subtotal: 85.00,
        impuesto: 10.20,
        descuento: 0.00,
        total: 95.20,
        lote_generado_id: 1, // Relacionado con lote existente
        numero_lote_proveedor: 'LOTE-PROV-001',
        created_at: now,
        updated_at: now
      },
      {
        compra_id: 1,
        producto_id: 2, // Coca Cola
        cantidad_pedida: 200,
        cantidad_recibida: 200,
        precio_unitario: 0.45,
        subtotal: 90.00,
        impuesto: 10.80,
        descuento: 0.00,
        total: 100.80,
        lote_generado_id: 2,
        numero_lote_proveedor: 'LOTE-PROV-002',
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('compras_detalles', null, {});
    await queryInterface.bulkDelete('compras', null, {});
    await queryInterface.bulkDelete('proveedores', null, {});
  }
};