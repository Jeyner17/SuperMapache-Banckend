const { body, param, validationResult } = require('express-validator');
const ApiResponse = require('../../../shared/utils/response');

const updateConfiguracionValidator = [
  param('clave')
    .trim()
    .notEmpty()
    .withMessage('La clave de configuración es requerida')
    .isLength({ min: 3, max: 100 })
    .withMessage('La clave debe tener entre 3 y 100 caracteres'),
  
  body('valor')
    .custom((value) => {
      // Permitir null, string, number, boolean
      if (value === null || value === undefined) return true;
      if (typeof value === 'string') return true;
      if (typeof value === 'number') return true;
      if (typeof value === 'boolean') return true;
      throw new Error('Valor inválido');
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.validationError(res, errors.array());
    }
    next();
  }
];

const updateMultipleValidator = [
  body('configuraciones')
    .isArray({ min: 1 })
    .withMessage('Configuraciones debe ser un array con al menos un elemento'),
  
  body('configuraciones.*.clave')
    .trim()
    .notEmpty()
    .withMessage('Cada configuración debe tener una clave')
    .isLength({ min: 3, max: 100 })
    .withMessage('La clave debe tener entre 3 y 100 caracteres'),
  
  body('configuraciones.*.valor')
    .custom((value) => {
      // Permitir null, string, number, boolean
      if (value === null || value === undefined) return true;
      if (typeof value === 'string') return true;
      if (typeof value === 'number') return true;
      if (typeof value === 'boolean') return true;
      throw new Error('Valor inválido');
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.validationError(res, errors.array());
    }
    next();
  }
];

const categoriaValidator = [
  param('categoria')
    .trim()
    .notEmpty()
    .withMessage('La categoría es requerida')
    .isIn(['empresa', 'impuestos', 'inventario', 'alertas', 'sistema', 'pos', 'notificaciones'])
    .withMessage('Categoría inválida'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.validationError(res, errors.array());
    }
    next();
  }
];

module.exports = {
  updateConfiguracionValidator,
  updateMultipleValidator,
  categoriaValidator
};