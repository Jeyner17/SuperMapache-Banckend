const { body, validationResult } = require('express-validator');
const ApiResponse = require('../../../shared/utils/response');

const createCompraValidator = [
  body('proveedor_id')
    .notEmpty()
    .withMessage('El proveedor es requerido')
    .isInt()
    .withMessage('El proveedor debe ser un número entero'),
  
  body('productos')
    .notEmpty()
    .withMessage('Debe agregar al menos un producto')
    .isArray({ min: 1 })
    .withMessage('Productos debe ser un array con al menos un elemento'),
  
  body('productos.*.producto_id')
    .notEmpty()
    .withMessage('ID de producto requerido')
    .isInt()
    .withMessage('ID de producto debe ser un número'),
  
  body('productos.*.cantidad')
    .notEmpty()
    .withMessage('Cantidad requerida')
    .isFloat({ min: 0.01 })
    .withMessage('La cantidad debe ser mayor a 0'),
  
  body('productos.*.precio_unitario')
    .notEmpty()
    .withMessage('Precio unitario requerido')
    .isFloat({ min: 0.01 })
    .withMessage('El precio debe ser mayor a 0'),
  
  body('tipo_pago')
    .optional()
    .isIn(['contado', 'credito'])
    .withMessage('Tipo de pago inválido'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.validationError(res, errors.array());
    }
    next();
  }
];

const recibirCompraValidator = [
  body('productos')
    .notEmpty()
    .withMessage('Debe especificar los productos recibidos')
    .isArray({ min: 1 })
    .withMessage('Productos debe ser un array'),
  
  body('productos.*.detalle_id')
    .notEmpty()
    .withMessage('ID de detalle requerido')
    .isInt()
    .withMessage('ID de detalle debe ser un número'),
  
  body('productos.*.cantidad_recibida')
    .notEmpty()
    .withMessage('Cantidad recibida requerida')
    .isFloat({ min: 0 })
    .withMessage('La cantidad debe ser mayor o igual a 0'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.validationError(res, errors.array());
    }
    next();
  }
];

module.exports = {
  createCompraValidator,
  recibirCompraValidator
};