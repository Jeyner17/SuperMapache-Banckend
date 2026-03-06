const { body, validationResult } = require('express-validator');
const ApiResponse = require('../../../shared/utils/response');

const escanearValidator = [
  body('codigo_barras')
    .trim()
    .notEmpty()
    .withMessage('El código de barras es requerido')
    .isLength({ min: 3, max: 50 })
    .withMessage('El código debe tener entre 3 y 50 caracteres'),
  
  body('modulo')
    .optional()
    .isIn(['pos', 'inventario', 'compras', 'verificacion'])
    .withMessage('Módulo inválido'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.validationError(res, errors.array());
    }
    next();
  }
];

module.exports = {
  escanearValidator
};