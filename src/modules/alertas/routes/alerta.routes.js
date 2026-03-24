const { Router } = require('express');
const alertaController = require('../controllers/alerta.controller');
const { verifyToken, checkPermission } = require('../../../shared/middleware/auth.middleware');

const router = Router();

// Todos los usuarios autenticados pueden leer alertas
router.get('/',           verifyToken, alertaController.getAlertas.bind(alertaController));
router.get('/resumen',    verifyToken, alertaController.getResumen.bind(alertaController));
router.get('/no-leidas',  verifyToken, alertaController.getNoLeidas.bind(alertaController));

router.put('/leer-todas', verifyToken, alertaController.marcarTodasLeidas.bind(alertaController));
router.put('/:id/leer',   verifyToken, alertaController.marcarLeida.bind(alertaController));
router.put('/:id/resolver', verifyToken, alertaController.marcarResuelta.bind(alertaController));

// Solo admin puede disparar manualmente la generación
router.post('/generar', verifyToken, checkPermission('gestionar_configuracion'), alertaController.generarAlertas.bind(alertaController));

module.exports = router;
