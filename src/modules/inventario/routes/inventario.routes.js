const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventario.controller');
const {
  crearLoteValidator,
  descontarStockValidator,
  ajustarStockValidator
} = require('../validators/inventario.validator');
const { verifyToken, checkPermission } = require('../../../shared/middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * GET /api/inventario/lotes
 * Obtener todos los lotes
 */
router.get('/lotes', inventarioController.getAllLotes);

/**
 * GET /api/inventario/resumen
 * Obtener resumen de inventario por producto
 */
router.get('/resumen', inventarioController.getResumen);

/**
 * GET /api/inventario/alertas
 * Obtener alertas de inventario
 */
router.get('/alertas', inventarioController.getAlertas);

/**
 * GET /api/inventario/movimientos
 * Obtener movimientos de inventario
 */
router.get('/movimientos', inventarioController.getMovimientos);

/**
 * GET /api/inventario/producto/:productoId/stock
 * Obtener stock de un producto
 */
router.get('/producto/:productoId/stock', inventarioController.getStockProducto);

/**
 * GET /api/inventario/lotes/:id
 * Obtener lote por ID
 */
router.get('/lotes/:id', inventarioController.getLoteById);

/**
 * POST /api/inventario/lotes
 * Crear nuevo lote (requiere permisos)
 */
router.post(
  '/lotes',
  checkPermission('gestionar_inventario'),
  crearLoteValidator,
  inventarioController.crearLote
);

/**
 * POST /api/inventario/descontar
 * Descontar stock (FIFO automático)
 */
router.post(
  '/descontar',
  descontarStockValidator,
  inventarioController.descontarStock
);

/**
 * PUT /api/inventario/lotes/:id/ajustar
 * Ajustar stock de un lote (requiere permisos)
 */
router.put(
  '/lotes/:id/ajustar',
  checkPermission('gestionar_inventario'),
  ajustarStockValidator,
  inventarioController.ajustarStock
);

/**
 * POST /api/inventario/verificar-estados
 * Verificar y actualizar estados de lotes (solo admin)
 */
router.post(
  '/verificar-estados',
  checkPermission('*'),
  inventarioController.verificarEstados
);

module.exports = router;