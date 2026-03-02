const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compra.controller');
const { 
  createCompraValidator, 
  recibirCompraValidator 
} = require('../validators/compra.validator');
const { verifyToken, checkPermission } = require('../../../shared/middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * GET /api/compras
 * Obtener todas las compras con paginación
 */
router.get('/', compraController.getAll);

/**
 * GET /api/compras/resumen
 * Obtener resumen de compras
 */
router.get('/resumen', compraController.getResumen);

/**
 * GET /api/compras/:id
 * Obtener compra por ID
 */
router.get('/:id', compraController.getById);

/**
 * POST /api/compras
 * Crear nueva compra (requiere permisos)
 */
router.post(
  '/',
  checkPermission('gestionar_inventario'),
  createCompraValidator,
  compraController.create
);

/**
 * POST /api/compras/:id/recibir
 * Recibir mercancía de la compra (requiere permisos)
 */
router.post(
  '/:id/recibir',
  checkPermission('gestionar_inventario'),
  recibirCompraValidator,
  compraController.recibir
);

/**
 * POST /api/compras/:id/cancelar
 * Cancelar compra (requiere permisos)
 */
router.post(
  '/:id/cancelar',
  checkPermission('gestionar_inventario'),
  compraController.cancelar
);

/**
 * POST /api/compras/:id/pagar
 * Registrar pago de compra (requiere permisos)
 */
router.post(
  '/:id/pagar',
  checkPermission('gestionar_inventario'),
  compraController.registrarPago
);

module.exports = router;