const { body, validationResult } = require('express-validator');
const ApiResponse = require('../../../shared/utils/response');

const loginValidator = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('El usuario es requerido')
    .isLength({ min: 3 })
    .withMessage('El usuario debe tener al menos 3 caracteres'),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.validationError(res, errors.array());
    }
    next();
  }
];

const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  
  body('newPassword')
    .notEmpty()
    .withMessage('La nueva contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirma la nueva contraseña')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Las contraseñas no coinciden'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.validationError(res, errors.array());
    }
    next();
  }
];

module.exports = {
  loginValidator,
  changePasswordValidator
};