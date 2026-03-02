const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Middleware para verificar JWT
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return ApiResponse.unauthorized(res, 'Token no proporcionado');
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return ApiResponse.unauthorized(res, 'Token no proporcionado');
    }

    // Verificar token
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // Agregar usuario al request
    req.user = decoded;
    
    next();

  } catch (error) {
    logger.error('Error al verificar token:', error);
    
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized(res, 'Token expirado');
    }
    
    return ApiResponse.unauthorized(res, 'Token inválido');
  }
};

/**
 * Middleware para verificar roles
 */
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'No autorizado');
    }

    const userRole = req.user.rol;

    // Administrador tiene acceso a todo
    if (userRole === 'administrador') {
      return next();
    }

    // Verificar si el rol del usuario está en los permitidos
    if (!allowedRoles.includes(userRole)) {
      return ApiResponse.forbidden(res, 'No tiene permisos suficientes');
    }

    next();
  };
};

/**
 * Middleware para verificar permisos específicos
 */
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'No autorizado');
    }

    const userPermissions = req.user.permisos || [];

    // Administrador tiene todos los permisos
    if (userPermissions.includes('*')) {
      return next();
    }

    // Verificar permiso específico
    if (!userPermissions.includes(permission)) {
      return ApiResponse.forbidden(res, 'No tiene permisos suficientes');
    }

    next();
  };
};

module.exports = {
  verifyToken,
  checkRole,
  checkPermission
};