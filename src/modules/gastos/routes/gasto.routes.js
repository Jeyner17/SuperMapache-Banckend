const express = require('express');
const router  = express.Router();
const { verifyToken, checkPermission } = require('../../../shared/middleware/auth.middleware');
const { crearGastoValidator, actualizarGastoValidator } = require('../validators/gasto.validator');
const ctrl = require('../controllers/gasto.controller');

router.get('/resumen',  verifyToken, ctrl.getResumen);
router.get('/',         verifyToken, ctrl.getGastos);
router.get('/:id',      verifyToken, ctrl.getGastoById);
router.post('/',        verifyToken, crearGastoValidator,      ctrl.crearGasto);
router.put('/:id',      verifyToken, actualizarGastoValidator, ctrl.actualizarGasto);
router.delete('/:id',   verifyToken, checkPermission('gestionar_configuracion'), ctrl.eliminarGasto);

module.exports = router;
