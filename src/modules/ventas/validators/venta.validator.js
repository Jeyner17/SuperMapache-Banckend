const { body, validationResult } = require('express-validator');
const ApiResponse = require('../../../shared/utils/response');

const createVentaValidator = [
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
  
  body('metodo_pago')
    .optional()
    .isIn(['efectivo', 'tarjeta', 'transferencia', 'mixto'])
    .withMessage('Método de pago inválido'),
  
  body('monto_recibido')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El monto recibido debe ser mayor o igual a 0'),
  
  body('descuento')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El descuento debe ser mayor o igual a 0'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.validationError(res, errors.array());
    }
    next();
  }
];

module.exports = {
  createVentaValidator
};