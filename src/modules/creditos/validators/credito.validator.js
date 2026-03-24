const { body, validationResult } = require('express-validator');
const ApiResponse = require('../../../shared/utils/response');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return ApiResponse.validationError(res, errors.array());
  next();
};

const crearClienteValidator = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 150 }).withMessage('El nombre no puede superar 150 caracteres'),
  body('cedula')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 20 }).withMessage('La cédula no puede superar 20 caracteres'),
  body('telefono')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 20 }).withMessage('El teléfono no puede superar 20 caracteres'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail().withMessage('Email inválido'),
  body('limite_credito')
    .optional()
    .isFloat({ min: 0 }).withMessage('El límite de crédito debe ser mayor o igual a 0'),
  handleValidation
];

const actualizarClienteValidator = [
  body('nombre')
    .optional()
    .notEmpty().withMessage('El nombre no puede estar vacío')
    .isLength({ max: 150 }).withMessage('El nombre no puede superar 150 caracteres'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail().withMessage('Email inválido'),
  body('limite_credito')
    .optional()
    .isFloat({ min: 0 }).withMessage('El límite de crédito debe ser mayor o igual a 0'),
  handleValidation
];

const crearCreditoValidator = [
  body('cliente_id')
    .notEmpty().withMessage('El cliente es requerido')
    .isInt({ min: 1 }).withMessage('ID de cliente inválido'),
  body('monto_total')
    .notEmpty().withMessage('El monto es requerido')
    .isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor a 0'),
  body('dias_plazo')
    .optional()
    .isInt({ min: 1, max: 365 }).withMessage('Los días de plazo deben estar entre 1 y 365'),
  body('notas')
    .optional()
    .isLength({ max: 500 }).withMessage('Las notas no pueden superar 500 caracteres'),
  handleValidation
];

const registrarPagoValidator = [
  body('monto')
    .notEmpty().withMessage('El monto es requerido')
    .isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor a 0'),
  body('metodo_pago')
    .optional()
    .isIn(['efectivo', 'tarjeta', 'transferencia']).withMessage('Método de pago inválido'),
  body('notas')
    .optional()
    .isLength({ max: 500 }).withMessage('Las notas no pueden superar 500 caracteres'),
  handleValidation
];

module.exports = {
  crearClienteValidator,
  actualizarClienteValidator,
  crearCreditoValidator,
  registrarPagoValidator
};
