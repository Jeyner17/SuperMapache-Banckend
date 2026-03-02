const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedor.controller');
const { 
  createProveedorValidator, 
  updateProveedorValidator 
} = require('../validators/proveedor.validator');
const { verifyToken, checkPermission } = require('../../../shared/middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * GET /api/proveedores
 * Obtener todos los proveedores
 */
router.get('/', proveedorController.getAll);

/**
 * GET /api/proveedores/:id
 * Obtener proveedor por ID
 */
router.get('/:id', proveedorController.getById);

/**
 * GET /api/proveedores/:id/estadisticas
 * Obtener estadísticas de un proveedor
 */
router.get('/:id/estadisticas', proveedorController.getEstadisticas);

/**
 * POST /api/proveedores
 * Crear nuevo proveedor (requiere permisos)
 */
router.post(
  '/',
  checkPermission('gestionar_inventario'),
  createProveedorValidator,
  proveedorController.create
);

/**
 * PUT /api/proveedores/:id
 * Actualizar proveedor (requiere permisos)
 */
router.put(
  '/:id',
  checkPermission('gestionar_inventario'),
  updateProveedorValidator,
  proveedorController.update
);

/**
 * DELETE /api/proveedores/:id
 * Eliminar proveedor (solo admin)
 */
router.delete(
  '/:id',
  checkPermission('*'),
  proveedorController.delete
);

module.exports = router;