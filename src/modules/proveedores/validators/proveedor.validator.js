const { body, validationResult } = require('express-validator');
const ApiResponse = require('../../../shared/utils/response');

const createProveedorValidator = [
  body('razon_social')
    .trim()
    .notEmpty()
    .withMessage('La razón social es requerida')
    .isLength({ min: 3, max: 200 })
    .withMessage('La razón social debe tener entre 3 y 200 caracteres'),
  
  body('nombre_comercial')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('El nombre comercial no puede exceder 200 caracteres'),
  
  body('ruc')
    .optional()
    .trim()
    .isNumeric()
    .withMessage('El RUC solo puede contener números')
    .isLength({ min: 13, max: 13 })
    .withMessage('El RUC debe tener exactamente 13 dígitos'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email inválido'),
  
  body('tipo_proveedor')
    .optional()
    .isIn(['productos', 'servicios', 'ambos'])
    .withMessage('Tipo de proveedor inválido'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.validationError(res, errors.array());
    }
    next();
  }
];

const updateProveedorValidator = [
  body('razon_social')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('La razón social debe tener entre 3 y 200 caracteres'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email inválido'),
  
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('Activo debe ser verdadero o falso'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.validationError(res, errors.array());
    }
    next();
  }
];

module.exports = {
  createProveedorValidator,
  updateProveedorValidator
};