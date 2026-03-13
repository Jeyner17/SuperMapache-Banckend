const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/venta.controller');
const { createVentaValidator } = require('../validators/venta.validator');
const { verifyToken, checkPermission } = require('../../../shared/middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * GET /api/ventas
 * Obtener todas las ventas con paginación
 */
router.get('/', ventaController.getAll);

/**
 * GET /api/ventas/estadisticas
 * Obtener estadísticas de ventas
 */
router.get('/estadisticas', ventaController.getEstadisticas);

/**
 * GET /api/ventas/productos-mas-vendidos
 * Obtener productos más vendidos
 */
router.get('/productos-mas-vendidos', ventaController.getProductosMasVendidos);

/**
 * GET /api/ventas/:id
 * Obtener venta por ID
 */
router.get('/:id', ventaController.getById);

/**
 * POST /api/ventas
 * Crear nueva venta
 */
router.post('/', createVentaValidator, ventaController.create);

/**
 * POST /api/ventas/:id/cancelar
 * Cancelar venta (requiere permisos)
 */
router.post(
  '/:id/cancelar',
  checkPermission('gestionar_inventario'),
  ventaController.cancelar
);

module.exports = router;