const express = require('express');
const router  = express.Router();
const { verifyToken, checkRole } = require('../../../shared/middleware/auth.middleware');
const ctrl = require('../controllers/auditoria.controller');

// Solo admin puede consultar auditoría
router.get('/',          verifyToken, checkRole('admin'), ctrl.getAuditorias);
router.get('/modulos',   verifyToken, checkRole('admin'), ctrl.getModulos);
router.get('/usuarios',  verifyToken, checkRole('admin'), ctrl.getUsuarios);

module.exports = router;
