const { Router } = require('express');
const cajaController = require('../controllers/caja.controller');
const { verifyToken, checkPermission } = require('../../../shared/middleware/auth.middleware');
const {
  abrirTurnoValidator,
  cerrarTurnoValidator,
  registrarMovimientoValidator
} = require('../validators/caja.validator');

const router = Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

// GET /api/caja/turno-activo — Turno abierto del usuario actual
router.get('/turno-activo', cajaController.getTurnoActivo);

// GET /api/caja/turnos — Listar todos los turnos
router.get('/turnos', checkPermission('gestionar_ventas'), cajaController.getTurnos);

// GET /api/caja/turnos/:id — Detalle de un turno
router.get('/turnos/:id', checkPermission('gestionar_ventas'), cajaController.getTurnoById);

// GET /api/caja/turnos/:id/movimientos — Movimientos de un turno
router.get('/turnos/:id/movimientos', checkPermission('gestionar_ventas'), cajaController.getMovimientos);

// POST /api/caja/abrir — Abrir turno
router.post('/abrir', checkPermission('gestionar_ventas'), abrirTurnoValidator, cajaController.abrirTurno);

// POST /api/caja/cerrar — Cerrar turno activo
router.post('/cerrar', checkPermission('gestionar_ventas'), cerrarTurnoValidator, cajaController.cerrarTurno);

// POST /api/caja/movimientos — Registrar ingreso/egreso manual
router.post('/movimientos', checkPermission('gestionar_ventas'), registrarMovimientoValidator, cajaController.registrarMovimiento);

module.exports = router;
