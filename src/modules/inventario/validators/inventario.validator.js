const { body, validationResult } = require('express-validator');
const ApiResponse = require('../../../shared/utils/response');

const crearLoteValidator = [
  body('producto_id')
    .notEmpty()
    .withMessage('El producto es requerido')
    .isInt()
    .withMessage('El producto debe ser un número entero'),
  
  body('numero_lote')
    .trim()
    .notEmpty()
    .withMessage('El número de lote es requerido')
    .isLength({ max: 50 })
    .withMessage('El número de lote no puede exceder 50 caracteres'),
  
  body('cantidad_inicial')
    .notEmpty()
    .withMessage('La cantidad inicial es requerida')
    .isFloat({ min: 0.01 })
    .withMessage('La cantidad debe ser mayor a 0'),
  
  body('fecha_ingreso')
    .optional()
    .isISO8601()
    .withMessage('Fecha de ingreso inválida'),
  
  body('fecha_caducidad')
    .optional()
    .isISO8601()
    .withMessage('Fecha de caducidad inválida')
    .custom((value, { req }) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('La fecha de caducidad debe ser futura');
      }
      return true;
    }),
  
  body('ubicacion')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ubicación no puede exceder 100 caracteres'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.validationError(res, errors.array());
    }
    next();
  }
];

const descontarStockValidator = [
  body('producto_id')
    .notEmpty()
    .withMessage('El producto es requerido')
    .isInt()
    .withMessage('El producto debe ser un número entero'),
  
  body('cantidad')
    .notEmpty()
    .withMessage('La cantidad es requerida')
    .isFloat({ min: 0.01 })
    .withMessage('La cantidad debe ser mayor a 0'),
  
  body('motivo')
    .trim()
    .notEmpty()
    .withMessage('El motivo es requerido')
    .isLength({ max: 200 })
    .withMessage('El motivo no puede exceder 200 caracteres'),
  
  body('referencia')
    .optional()
    .isObject()
    .withMessage('La referencia debe ser un objeto'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.validationError(res, errors.array());
    }
    next();
  }
];

const ajustarStockValidator = [
  body('nueva_cantidad')
    .notEmpty()
    .withMessage('La nueva cantidad es requerida')
    .isFloat({ min: 0 })
    .withMessage('La cantidad debe ser mayor o igual a 0'),
  
  body('motivo')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('El motivo no puede exceder 200 caracteres'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.validationError(res, errors.array());
    }
    next();
  }
];

module.exports = {
  crearLoteValidator,
  descontarStockValidator,
  ajustarStockValidator
};