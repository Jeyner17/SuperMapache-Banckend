const express = require('express');
const router = express.Router();
const escaneoController = require('../controllers/escaneo.controller');
const { escanearValidator } = require('../validators/escaneo.validator');
const { verifyToken } = require('../../../shared/middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * POST /api/escaneo/scan
 * Escanear código de barras
 */
router.post('/scan', escanearValidator, escaneoController.escanear);

/**
 * POST /api/escaneo/verificar
 * Verificar disponibilidad de producto
 */
router.post('/verificar', escanearValidator, escaneoController.verificarDisponibilidad);

/**
 * GET /api/escaneo/buscar/:codigo
 * Buscar productos por código parcial
 */
router.get('/buscar/:codigo', escaneoController.buscarPorCodigo);

/**
 * GET /api/escaneo/historial
 * Obtener historial de escaneos
 */
router.get('/historial', escaneoController.getHistorial);

/**
 * GET /api/escaneo/estadisticas
 * Obtener estadísticas de escaneos
 */
router.get('/estadisticas', escaneoController.getEstadisticas);

module.exports = router;