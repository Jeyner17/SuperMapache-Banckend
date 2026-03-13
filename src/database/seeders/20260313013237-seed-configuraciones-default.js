'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const configuraciones = [
      // EMPRESA
      {
        clave: 'empresa_nombre',
        valor: 'Supermercado La Esquina',
        tipo: 'texto',
        categoria: 'empresa',
        descripcion: 'Nombre comercial de la empresa',
        es_publica: true
      },
      {
        clave: 'empresa_razon_social',
        valor: 'Supermercado La Esquina S.A.',
        tipo: 'texto',
        categoria: 'empresa',
        descripcion: 'Razón social de la empresa',
        es_publica: false
      },
      {
        clave: 'empresa_ruc',
        valor: '1799999999001',
        tipo: 'texto',
        categoria: 'empresa',
        descripcion: 'RUC o identificación fiscal',
        es_publica: true
      },
      {
        clave: 'empresa_direccion',
        valor: 'Av. Principal #123 y Secundaria',
        tipo: 'texto',
        categoria: 'empresa',
        descripcion: 'Dirección física de la empresa',
        es_publica: true
      },
      {
        clave: 'empresa_ciudad',
        valor: 'Quito',
        tipo: 'texto',
        categoria: 'empresa',
        descripcion: 'Ciudad donde opera',
        es_publica: true
      },
      {
        clave: 'empresa_pais',
        valor: 'Ecuador',
        tipo: 'texto',
        categoria: 'empresa',
        descripcion: 'País de operación',
        es_publica: true
      },
      {
        clave: 'empresa_telefono',
        valor: '02-2345678',
        tipo: 'texto',
        categoria: 'empresa',
        descripcion: 'Teléfono de contacto',
        es_publica: true
      },
      {
        clave: 'empresa_celular',
        valor: '0987654321',
        tipo: 'texto',
        categoria: 'empresa',
        descripcion: 'Celular de contacto',
        es_publica: true
      },
      {
        clave: 'empresa_email',
        valor: 'info@supermercado.com',
        tipo: 'email',
        categoria: 'empresa',
        descripcion: 'Email de contacto',
        es_publica: true
      },
      {
        clave: 'empresa_sitio_web',
        valor: 'www.supermercado.com',
        tipo: 'texto',
        categoria: 'empresa',
        descripcion: 'Sitio web de la empresa',
        es_publica: true
      },
      {
        clave: 'empresa_logo',
        valor: null,
        tipo: 'imagen',
        categoria: 'empresa',
        descripcion: 'Logo de la empresa (ruta)',
        es_publica: true
      },

      // IMPUESTOS
      {
        clave: 'impuesto_iva',
        valor: '12',
        tipo: 'porcentaje',
        categoria: 'impuestos',
        descripcion: 'Porcentaje de IVA aplicable',
        es_publica: true
      },
      {
        clave: 'impuesto_incluido_precio',
        valor: 'false',
        tipo: 'boolean',
        categoria: 'impuestos',
        descripcion: 'Si el IVA está incluido en el precio de venta',
        es_publica: false
      },

      // INVENTARIO
      {
        clave: 'inventario_stock_minimo_global',
        valor: '10',
        tipo: 'numero',
        categoria: 'inventario',
        descripcion: 'Stock mínimo por defecto para productos',
        es_publica: false
      },
      {
        clave: 'inventario_dias_alerta_caducidad',
        valor: '21',
        tipo: 'numero',
        categoria: 'inventario',
        descripcion: 'Días antes de vencimiento para alertar',
        es_publica: false
      },
      {
        clave: 'inventario_metodo_valuacion',
        valor: 'FIFO',
        tipo: 'texto',
        categoria: 'inventario',
        descripcion: 'Método de valuación de inventario (FIFO, LIFO, Promedio)',
        es_publica: false
      },

      // ALERTAS
      {
        clave: 'alertas_stock_bajo_activo',
        valor: 'true',
        tipo: 'boolean',
        categoria: 'alertas',
        descripcion: 'Activar alertas de stock bajo',
        es_publica: false
      },
      {
        clave: 'alertas_caducidad_activo',
        valor: 'true',
        tipo: 'boolean',
        categoria: 'alertas',
        descripcion: 'Activar alertas de productos próximos a vencer',
        es_publica: false
      },
      {
        clave: 'alertas_productos_vencidos_activo',
        valor: 'true',
        tipo: 'boolean',
        categoria: 'alertas',
        descripcion: 'Activar alertas de productos vencidos',
        es_publica: false
      },

      // SISTEMA
      {
        clave: 'sistema_moneda',
        valor: 'USD',
        tipo: 'texto',
        categoria: 'sistema',
        descripcion: 'Código de moneda (USD, EUR, etc)',
        es_publica: true
      },
      {
        clave: 'sistema_simbolo_moneda',
        valor: '$',
        tipo: 'texto',
        categoria: 'sistema',
        descripcion: 'Símbolo de la moneda',
        es_publica: true
      },
      {
        clave: 'sistema_formato_fecha',
        valor: 'DD/MM/YYYY',
        tipo: 'texto',
        categoria: 'sistema',
        descripcion: 'Formato de visualización de fechas',
        es_publica: true
      },
      {
        clave: 'sistema_idioma',
        valor: 'es',
        tipo: 'texto',
        categoria: 'sistema',
        descripcion: 'Idioma del sistema (es, en)',
        es_publica: true
      },
      {
        clave: 'sistema_zona_horaria',
        valor: 'America/Guayaquil',
        tipo: 'texto',
        categoria: 'sistema',
        descripcion: 'Zona horaria del sistema',
        es_publica: false
      },

      // POS
      {
        clave: 'pos_mensaje_ticket_header',
        valor: '¡Bienvenido a Supermercado La Esquina!',
        tipo: 'texto',
        categoria: 'pos',
        descripcion: 'Mensaje superior del ticket',
        es_publica: false
      },
      {
        clave: 'pos_mensaje_ticket_footer',
        valor: 'Gracias por su compra. ¡Vuelva pronto!',
        tipo: 'texto',
        categoria: 'pos',
        descripcion: 'Mensaje inferior del ticket',
        es_publica: false
      },
      {
        clave: 'pos_imprimir_logo_ticket',
        valor: 'true',
        tipo: 'boolean',
        categoria: 'pos',
        descripcion: 'Incluir logo en tickets',
        es_publica: false
      },
      {
        clave: 'pos_ancho_ticket',
        valor: '80',
        tipo: 'numero',
        categoria: 'pos',
        descripcion: 'Ancho del ticket en mm (58, 80)',
        es_publica: false
      },

      // NOTIFICACIONES
      {
        clave: 'notificaciones_email_activo',
        valor: 'false',
        tipo: 'boolean',
        categoria: 'notificaciones',
        descripcion: 'Activar envío de notificaciones por email',
        es_publica: false
      },
      {
        clave: 'notificaciones_email_alertas',
        valor: 'admin@supermercado.com',
        tipo: 'email',
        categoria: 'notificaciones',
        descripcion: 'Email para recibir alertas del sistema',
        es_publica: false
      }
    ];

    const now = new Date();
    const configuracionesConTimestamps = configuraciones.map(config => ({
      ...config,
      created_at: now,
      updated_at: now
    }));

    await queryInterface.bulkInsert('configuraciones', configuracionesConTimestamps);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('configuraciones', null, {});
  }
};