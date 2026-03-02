const { body, validationResult } = require('express-validator');
const ApiResponse = require('../../../shared/utils/response');

const createCategoriaValidator = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La descripción no puede exceder 255 caracteres'),
  
  body('icono')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El icono no puede exceder 50 caracteres'),
  
  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('El color debe ser un código hexadecimal válido (ej: #3b82f6)'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.validationError(res, errors.array());
    }
    next();
  }
];

const updateCategoriaValidator = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La descripción no puede exceder 255 caracteres'),
  
  body('icono')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El icono no puede exceder 50 caracteres'),
  
  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('El color debe ser un código hexadecimal válido'),
  
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
  createCategoriaValidator,
  updateCategoriaValidator
};