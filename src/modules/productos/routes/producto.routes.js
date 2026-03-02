const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');
const { createProductoValidator, updateProductoValidator } = require('../validators/producto.validator');
const { verifyToken, checkPermission } = require('../../../shared/middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * GET /api/productos
 * Obtener todos los productos con paginación
 */
router.get('/', productoController.getAll);

/**
 * GET /api/productos/codigo/:codigoBarras
 * Buscar producto por código de barras
 */
router.get('/codigo/:codigoBarras', productoController.getByCodigoBarras);

/**
 * GET /api/productos/:id
 * Obtener producto por ID
 */
router.get('/:id', productoController.getById);

/**
 * POST /api/productos
 * Crear nuevo producto (solo admin y supervisor)
 */
router.post(
  '/',
  checkPermission('gestionar_inventario'),
  createProductoValidator,
  productoController.create
);

/**
 * PUT /api/productos/:id
 * Actualizar producto (solo admin y supervisor)
 */
router.put(
  '/:id',
  checkPermission('gestionar_inventario'),
  updateProductoValidator,
  productoController.update
);

/**
 * DELETE /api/productos/:id
 * Eliminar producto (solo admin)
 */
router.delete(
  '/:id',
  checkPermission('*'),
  productoController.delete
);

module.exports = router;