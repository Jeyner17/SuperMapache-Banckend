const { body, validationResult } = require('express-validator');
const ApiResponse = require('../../../shared/utils/response');

const CATEGORIAS   = ['servicios', 'mantenimiento', 'sueldos', 'insumos', 'alquiler', 'transporte', 'publicidad', 'otros'];
const METODOS_PAGO = ['efectivo', 'tarjeta', 'transferencia'];

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return ApiResponse.validationError(res, errors.array());
  next();
};

const crearGastoValidator = [
  body('categoria').isIn(CATEGORIAS).withMessage('Categoría inválida'),
  body('descripcion').notEmpty().withMessage('La descripción es requerida').isLength({ max: 500 }),
  body('monto').isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor a 0'),
  body('fecha_gasto').isDate().withMessage('Fecha de gasto inválida'),
  body('metodo_pago').isIn(METODOS_PAGO).withMessage('Método de pago inválido'),
  body('comprobante').optional().isLength({ max: 100 }),
  body('notas').optional().isLength({ max: 1000 }),
  handleErrors
];

const actualizarGastoValidator = [
  body('categoria').optional().isIn(CATEGORIAS).withMessage('Categoría inválida'),
  body('descripcion').optional().notEmpty().isLength({ max: 500 }),
  body('monto').optional().isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor a 0'),
  body('fecha_gasto').optional().isDate().withMessage('Fecha de gasto inválida'),
  body('metodo_pago').optional().isIn(METODOS_PAGO).withMessage('Método de pago inválido'),
  body('comprobante').optional().isLength({ max: 100 }),
  body('notas').optional().isLength({ max: 1000 }),
  handleErrors
];

module.exports = { crearGastoValidator, actualizarGastoValidator };
