'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar categorías principales
    await queryInterface.bulkInsert('categorias', [
  {
    id: 1,
    nombre: 'Bebidas',
    descripcion: 'Bebidas alcohólicas y no alcohólicas',
    icono: 'Coffee',
    color: '#3b82f6',
    activo: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    nombre: 'Lácteos',
    descripcion: 'Productos lácteos y derivados',
    icono: 'Milk',
    color: '#10b981',
    activo: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    nombre: 'Panadería',
    descripcion: 'Pan, pasteles y productos de panadería',
    icono: 'Croissant',
    color: '#f59e0b',
    activo: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 4,
    nombre: 'Snacks',
    descripcion: 'Botanas y aperitivos',
    icono: 'Cookie',
    color: '#ef4444',
    activo: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 5,
    nombre: 'Limpieza',
    descripcion: 'Productos de limpieza y aseo',
    icono: 'Sparkles',
    color: '#8b5cf6',
    activo: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 6,
    nombre: 'Cervezas',
    descripcion: 'Cervezas nacionales e importadas',
    icono: 'Beer',
    color: '#fbbf24',
    activo: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 7,
    nombre: 'Gaseosas',
    descripcion: 'Bebidas gaseosas',
    icono: 'Droplets',
    color: '#06b6d4',
    activo: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 8,
    nombre: 'Leches',
    descripcion: 'Leches de todo tipo',
    icono: 'Milk',
    color: '#60a5fa',
    activo: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 9,
    nombre: 'Yogures',
    descripcion: 'Yogures y productos fermentados',
    icono: 'IceCream',
    color: '#ec4899',
    activo: true,
    created_at: new Date(),
    updated_at: new Date()
  }
    ]);

    // Insertar productos de ejemplo
    await queryInterface.bulkInsert('productos', [
      {
        codigo_barras: '7891234567890',
        sku: 'CER-PIL-330',
        nombre: 'Cerveza Pilsener 330ml',
        descripcion: 'Cerveza nacional de alta calidad',
        categoria_id: 6,
        precio_costo: 0.85,
        precio_venta: 1.50,
        margen_ganancia: 76.47,
        stock_minimo: 50,
        stock_maximo: 500,
        requiere_caducidad: true,
        dias_alerta_caducidad: 30,
        unidad_medida: 'unidad',
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        codigo_barras: '7891234567891',
        sku: 'BEB-COC-500',
        nombre: 'Coca Cola 500ml',
        descripcion: 'Bebida gaseosa',
        categoria_id: 7,
        precio_costo: 0.45,
        precio_venta: 0.75,
        margen_ganancia: 66.67,
        stock_minimo: 100,
        stock_maximo: 1000,
        requiere_caducidad: true,
        dias_alerta_caducidad: 60,
        unidad_medida: 'unidad',
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        codigo_barras: '7891234567892',
        sku: 'LAC-ENT-1L',
        nombre: 'Leche Entera 1L',
        descripcion: 'Leche entera pasteurizada',
        categoria_id: 8,
        precio_costo: 1.00,
        precio_venta: 1.50,
        margen_ganancia: 50.00,
        stock_minimo: 30,
        stock_maximo: 200,
        requiere_caducidad: true,
        dias_alerta_caducidad: 7,
        unidad_medida: 'l',
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        codigo_barras: '7891234567893',
        sku: 'LAC-YOG-200',
        nombre: 'Yogurt Fresa 200ml',
        descripcion: 'Yogurt sabor fresa',
        categoria_id: 9,
        precio_costo: 0.60,
        precio_venta: 1.00,
        margen_ganancia: 66.67,
        stock_minimo: 20,
        stock_maximo: 150,
        requiere_caducidad: true,
        dias_alerta_caducidad: 14,
        unidad_medida: 'unidad',
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        codigo_barras: '7891234567894',
        sku: 'PAN-INT-500',
        nombre: 'Pan Integral 500g',
        descripcion: 'Pan integral tajado',
        categoria_id: 3,
        precio_costo: 0.80,
        precio_venta: 1.20,
        margen_ganancia: 50.00,
        stock_minimo: 15,
        stock_maximo: 100,
        requiere_caducidad: true,
        dias_alerta_caducidad: 5,
        unidad_medida: 'unidad',
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        codigo_barras: '7891234567895',
        sku: 'SNK-DOR-150',
        nombre: 'Doritos Nacho 150g',
        descripcion: 'Snack de maíz sabor nacho',
        categoria_id: 4,
        precio_costo: 1.20,
        precio_venta: 2.00,
        margen_ganancia: 66.67,
        stock_minimo: 25,
        stock_maximo: 200,
        requiere_caducidad: true,
        dias_alerta_caducidad: 90,
        unidad_medida: 'paquete',
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('productos', null, {});
    await queryInterface.bulkDelete('categorias', null, {});
  }
};