const { body, validationResult } = require('express-validator');
const ApiResponse = require('../../../shared/utils/response');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.validationError(res, errors.array());
  }
  next();
};

const abrirTurnoValidator = [
  body('saldo_inicial')
    .notEmpty().withMessage('El saldo inicial es requerido')
    .isFloat({ min: 0 }).withMessage('El saldo inicial debe ser un número mayor o igual a 0'),
  body('notas')
    .optional()
    .isString().withMessage('Las notas deben ser texto')
    .isLength({ max: 500 }).withMessage('Las notas no pueden superar 500 caracteres'),
  handleValidation
];

const cerrarTurnoValidator = [
  body('total_real')
    .notEmpty().withMessage('El total real contado es requerido')
    .isFloat({ min: 0 }).withMessage('El total real debe ser un número mayor o igual a 0'),
  body('notas')
    .optional()
    .isString().withMessage('Las notas deben ser texto')
    .isLength({ max: 500 }).withMessage('Las notas no pueden superar 500 caracteres'),
  handleValidation
];

const registrarMovimientoValidator = [
  body('tipo')
    .notEmpty().withMessage('El tipo es requerido')
    .isIn(['ingreso', 'egreso']).withMessage('El tipo debe ser ingreso o egreso'),
  body('descripcion')
    .notEmpty().withMessage('La descripción es requerida')
    .isString().withMessage('La descripción debe ser texto')
    .isLength({ max: 255 }).withMessage('La descripción no puede superar 255 caracteres'),
  body('monto')
    .notEmpty().withMessage('El monto es requerido')
    .isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor a 0'),
  handleValidation
];

module.exports = {
  abrirTurnoValidator,
  cerrarTurnoValidator,
  registrarMovimientoValidator
};
