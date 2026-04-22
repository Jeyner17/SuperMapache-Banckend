const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');
const { createProductoValidator, updateProductoValidator } = require('../validators/producto.validator');
const { verifyToken, checkPermission } = require('../../../shared/middleware/auth.middleware');
const { createUploader } = require('../../../shared/config/multer.config');

const upload = createUploader('productos');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * GET /api/productos
 */
router.get('/', productoController.getAll);

/**
 * GET /api/productos/codigo/:codigoBarras
 */
router.get('/codigo/:codigoBarras', productoController.getByCodigoBarras);

/**
 * GET /api/productos/:id/verificar-eliminacion
 */
router.get('/:id/verificar-eliminacion', productoController.verificarEliminacion);

/**
 * GET /api/productos/:id
 */
router.get('/:id', productoController.getById);

/**
 * POST /api/productos
 */
router.post(
  '/',
  checkPermission('gestionar_inventario'),
  upload.single('imagen'),
  createProductoValidator,
  productoController.create
);

/**
 * PUT /api/productos/:id
 */
router.put(
  '/:id',
  checkPermission('gestionar_inventario'),
  upload.single('imagen'),
  updateProductoValidator,
  productoController.update
);

/**
 * DELETE /api/productos/:id
 */
router.delete(
  '/:id',
  checkPermission('gestionar_inventario'),
  productoController.delete
);

module.exports = router;
