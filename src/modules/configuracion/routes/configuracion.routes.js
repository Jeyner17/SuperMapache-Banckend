const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracion.controller');
const { 
  updateConfiguracionValidator, 
  updateMultipleValidator,
  categoriaValidator 
} = require('../validators/configuracion.validator');
const { verifyToken, checkPermission } = require('../../../shared/middleware/auth.middleware');

/**
 * GET /api/configuracion/publicas
 * Obtener configuraciones públicas (sin autenticación)
 */
router.get('/publicas', configuracionController.getPublicas);

/**
 * GET /api/configuracion/iva
 * Obtener IVA configurado (público)
 */
router.get('/iva', configuracionController.getIVA);

// Todas las rutas siguientes requieren autenticación
router.use(verifyToken);

/**
 * GET /api/configuracion
 * Obtener todas las configuraciones
 */
router.get('/', configuracionController.getAll);

/**
 * GET /api/configuracion/empresa
 * Obtener datos de la empresa
 */
router.get('/empresa', configuracionController.getDatosEmpresa);

/**
 * GET /api/configuracion/categoria/:categoria
 * Obtener configuraciones por categoría
 */
router.get('/categoria/:categoria', categoriaValidator, configuracionController.getByCategoria);

/**
 * GET /api/configuracion/clave/:clave
 * Obtener configuración específica
 */
router.get('/clave/:clave', configuracionController.getByClave);

/**
 * PUT /api/configuracion/:clave
 * Actualizar configuración (requiere permisos de administrador)
 */
router.put(
  '/:clave',
  checkPermission('gestionar_configuracion'),
  updateConfiguracionValidator,
  configuracionController.update
);

/**
 * PUT /api/configuracion/multiple
 * Actualizar múltiples configuraciones (requiere permisos de administrador)
 */
router.put(
  '/multiple',
  checkPermission('gestionar_configuracion'),
  updateMultipleValidator,
  configuracionController.updateMultiple
);

module.exports = router;