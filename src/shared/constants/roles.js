module.exports = {
  ADMIN: 'administrador',
  SUPERVISOR: 'supervisor',
  CAJERO: 'cajero',
  EMPLEADO: 'empleado',
  
  // Lista de todos los roles
  ALL_ROLES: ['administrador', 'supervisor', 'cajero', 'empleado'],
  
  // Permisos por rol
  PERMISSIONS: {
    administrador: ['*'],
    supervisor: [
      'ver_reportes',
      'ver_auditoria',
      'gestionar_inventario',
      'gestionar_compras',
      'gestionar_proveedores',
      'ver_dashboard',
    ],
    cajero: [
      'realizar_ventas',
      'abrir_cerrar_caja',
      'gestionar_creditos',
      'consultar_productos',
    ],
    empleado: [
      'consultar_productos',
      'ver_inventario',
    ]
  }
};