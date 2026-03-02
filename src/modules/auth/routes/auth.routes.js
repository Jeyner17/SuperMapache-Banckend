const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { loginValidator, changePasswordValidator } = require('../validators/auth.validator');
const { verifyToken } = require('../../../shared/middleware/auth.middleware');

/**
 * POST /api/auth/login
 * Login de usuario
 */
router.post('/login', loginValidator, authController.login);

/**
 * POST /api/auth/logout
 * Logout de usuario (requiere autenticación)
 */
router.post('/logout', verifyToken, authController.logout);

/**
 * GET /api/auth/profile
 * Obtener perfil del usuario autenticado
 */
router.get('/profile', verifyToken, authController.getProfile);

/**
 * PUT /api/auth/change-password
 * Cambiar contraseña del usuario autenticado
 */
router.put(
  '/change-password',
  verifyToken,
  changePasswordValidator,
  authController.changePassword
);

/**
 * POST /api/auth/refresh
 * Renovar access token
 */
router.post('/refresh', authController.refreshToken);

module.exports = router;