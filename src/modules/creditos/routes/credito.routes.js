const { Router } = require('express');
const creditoController = require('../controllers/credito.controller');
const { verifyToken, checkPermission } = require('../../../shared/middleware/auth.middleware');
const {
  crearClienteValidator,
  actualizarClienteValidator,
  crearCreditoValidator,
  registrarPagoValidator
} = require('../validators/credito.validator');

const router = Router();

router.use(verifyToken);

// ─── RESUMEN ──────────────────────────────────────────────────────────────────
router.get('/resumen', checkPermission('gestionar_ventas'), creditoController.getResumen);

// ─── CLIENTES ─────────────────────────────────────────────────────────────────
router.get('/clientes', checkPermission('gestionar_ventas'), creditoController.getClientes);
router.get('/clientes/:id', checkPermission('gestionar_ventas'), creditoController.getClienteById);
router.post('/clientes', checkPermission('gestionar_ventas'), crearClienteValidator, creditoController.crearCliente);
router.put('/clientes/:id', checkPermission('gestionar_ventas'), actualizarClienteValidator, creditoController.actualizarCliente);

// ─── CRÉDITOS ─────────────────────────────────────────────────────────────────
router.get('/', checkPermission('gestionar_ventas'), creditoController.getCreditos);
router.get('/:id', checkPermission('gestionar_ventas'), creditoController.getCreditoById);
router.post('/', checkPermission('gestionar_ventas'), crearCreditoValidator, creditoController.crearCredito);
router.post('/:id/pagar', checkPermission('gestionar_ventas'), registrarPagoValidator, creditoController.registrarPago);

module.exports = router;
