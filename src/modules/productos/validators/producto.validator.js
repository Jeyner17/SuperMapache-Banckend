const { body, validationResult } = require('express-validator');
const ApiResponse = require('../../../shared/utils/response');

const createProductoValidator = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 200 })
    .withMessage('El nombre debe tener entre 3 y 200 caracteres'),
  
  body('categoria_id')
    .notEmpty()
    .withMessage('La categoría es requerida')
    .isInt()
    .withMessage('La categoría debe ser un número entero'),
  
  body('precio_costo')
    .notEmpty()
    .withMessage('El precio de costo es requerido')
    .isFloat({ min: 0 })
    .withMessage('El precio de costo debe ser un número positivo'),
  
  body('precio_venta')
    .notEmpty()
    .withMessage('El precio de venta es requerido')
    .isFloat({ min: 0 })
    .withMessage('El precio de venta debe ser un número positivo')
    .custom((value, { req }) => {
      if (parseFloat(value) < parseFloat(req.body.precio_costo)) {
        throw new Error('El precio de venta debe ser mayor al precio de costo');
      }
      return true;
    }),
  
  body('codigo_barras')
    .optional()
    .trim()
    .isNumeric()
    .withMessage('El código de barras solo puede contener números')
    .isLength({ min: 8, max: 13 })
    .withMessage('El código de barras debe tener entre 8 y 13 dígitos'),

  body('sku')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El SKU no puede exceder 50 caracteres'),
  
  body('descripcion')
    .optional()
    .trim(),
  
  body('stock_minimo')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock mínimo debe ser un número entero positivo'),
  
  body('stock_maximo')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock máximo debe ser un número entero positivo'),
  
  body('requiere_caducidad')
    .optional()
    .isBoolean()
    .withMessage('Requiere caducidad debe ser verdadero o falso'),
  
  body('dias_alerta_caducidad')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Los días de alerta deben ser un número positivo'),
  
  body('unidad_medida')
    .optional()
    .isIn(['unidad', 'kg', 'g', 'l', 'ml', 'caja', 'paquete'])
    .withMessage('Unidad de medida no válida'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.validationError(res, errors.array());
    }
    next();
  }
];

const updateProductoValidator = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('El nombre debe tener entre 3 y 200 caracteres'),
  
  body('categoria_id')
    .optional()
    .isInt()
    .withMessage('La categoría debe ser un número entero'),
  
  body('precio_costo')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio de costo debe ser un número positivo'),
  
  body('precio_venta')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio de venta debe ser un número positivo'),
  
  body('codigo_barras')
    .optional()
    .trim()
    .isNumeric()
    .withMessage('El código de barras solo puede contener números')
    .isLength({ min: 8, max: 13 })
    .withMessage('El código de barras debe tener entre 8 y 13 dígitos'),

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
  createProductoValidator,
  updateProductoValidator
};