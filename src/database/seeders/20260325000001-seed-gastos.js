'use strict';

module.exports = {
  up: async (queryInterface) => {
    const [usuarios] = await queryInterface.sequelize.query(
      `SELECT id FROM usuarios WHERE username = 'admin' LIMIT 1`
    );
    const adminId = usuarios[0]?.id;
    if (!adminId) return;

    const ahora = new Date();
    const mes   = String(ahora.getMonth() + 1).padStart(2, '0');
    const yyyy  = ahora.getFullYear();

    const gastos = [
      {
        numero_gasto: `GASTO-${yyyy}${mes}-000001`,
        categoria:    'servicios',
        descripcion:  'Pago de factura de luz eléctrica — mes actual',
        monto:        145.00,
        fecha_gasto:  new Date(ahora.getFullYear(), ahora.getMonth(), 5),
        metodo_pago:  'transferencia',
        comprobante:  'FAC-ELEC-00892',
        notas:        'Pago puntual, tarifa comercial',
        usuario_id:   adminId,
        turno_id:     null,
        created_at:   new Date(),
        updated_at:   new Date(),
      },
      {
        numero_gasto: `GASTO-${yyyy}${mes}-000002`,
        categoria:    'servicios',
        descripcion:  'Servicio de internet y teléfono',
        monto:        65.00,
        fecha_gasto:  new Date(ahora.getFullYear(), ahora.getMonth(), 5),
        metodo_pago:  'transferencia',
        comprobante:  'FAC-NET-00341',
        notas:        null,
        usuario_id:   adminId,
        turno_id:     null,
        created_at:   new Date(),
        updated_at:   new Date(),
      },
      {
        numero_gasto: `GASTO-${yyyy}${mes}-000003`,
        categoria:    'mantenimiento',
        descripcion:  'Reparación de refrigerador de lácteos — cambio de compresor',
        monto:        320.00,
        fecha_gasto:  new Date(ahora.getFullYear(), ahora.getMonth(), 10),
        metodo_pago:  'efectivo',
        comprobante:  'REC-MEC-0045',
        notas:        'Técnico: Refrigeraciones González',
        usuario_id:   adminId,
        turno_id:     null,
        created_at:   new Date(),
        updated_at:   new Date(),
      },
      {
        numero_gasto: `GASTO-${yyyy}${mes}-000004`,
        categoria:    'insumos',
        descripcion:  'Compra de bolsas plásticas y papel para caja registradora',
        monto:        38.50,
        fecha_gasto:  new Date(ahora.getFullYear(), ahora.getMonth(), 12),
        metodo_pago:  'efectivo',
        comprobante:  null,
        notas:        '500 bolsas medianas + 10 rollos de papel térmico',
        usuario_id:   adminId,
        turno_id:     null,
        created_at:   new Date(),
        updated_at:   new Date(),
      },
      {
        numero_gasto: `GASTO-${yyyy}${mes}-000005`,
        categoria:    'alquiler',
        descripcion:  'Pago de alquiler del local comercial — mes actual',
        monto:        850.00,
        fecha_gasto:  new Date(ahora.getFullYear(), ahora.getMonth(), 1),
        metodo_pago:  'transferencia',
        comprobante:  'RECIBO-ALQ-2026',
        notas:        null,
        usuario_id:   adminId,
        turno_id:     null,
        created_at:   new Date(),
        updated_at:   new Date(),
      },
      {
        numero_gasto: `GASTO-${yyyy}${mes}-000006`,
        categoria:    'transporte',
        descripcion:  'Flete para recolección de mercadería en proveedor',
        monto:        25.00,
        fecha_gasto:  new Date(ahora.getFullYear(), ahora.getMonth(), 15),
        metodo_pago:  'efectivo',
        comprobante:  null,
        notas:        'Transporte Rápido S.A.',
        usuario_id:   adminId,
        turno_id:     null,
        created_at:   new Date(),
        updated_at:   new Date(),
      },
    ];

    await queryInterface.bulkInsert('gastos', gastos, {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('gastos', null, {});
  }
};
