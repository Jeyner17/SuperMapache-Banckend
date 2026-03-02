const authService = require('../services/auth.service');
const ApiResponse = require('../../../shared/utils/response');
const logger = require('../../../shared/utils/logger');

class AuthController {
  /**
   * POST /api/auth/login
   * Login de usuario
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;

      const result = await authService.login(username, password);

      return ApiResponse.success(res, result, 'Login exitoso');

    } catch (error) {
      logger.error('Error en login:', error);
      return ApiResponse.error(res, error.message, 401);
    }
  }

  /**
   * POST /api/auth/logout
   * Logout de usuario
   */
  async logout(req, res) {
    try {
      // En este caso, el logout se maneja en el frontend
      // eliminando el token. Aquí solo registramos el evento
      logger.info(`Logout: ${req.user.username}`);

      return ApiResponse.success(res, null, 'Sesión cerrada exitosamente');

    } catch (error) {
      logger.error('Error en logout:', error);
      return ApiResponse.serverError(res, 'Error al cerrar sesión');
    }
  }

  /**
   * GET /api/auth/profile
   * Obtener perfil del usuario autenticado
   */
  async getProfile(req, res) {
    try {
      const profile = await authService.getProfile(req.user.id);

      return ApiResponse.success(res, profile, 'Perfil obtenido');

    } catch (error) {
      logger.error('Error al obtener perfil:', error);
      return ApiResponse.serverError(res, 'Error al obtener perfil');
    }
  }

  /**
   * PUT /api/auth/change-password
   * Cambiar contraseña
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      await authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );

      return ApiResponse.success(res, null, 'Contraseña actualizada');

    } catch (error) {
      logger.error('Error al cambiar contraseña:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * POST /api/auth/refresh
   * Renovar access token
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return ApiResponse.error(res, 'Refresh token requerido', 400);
      }

      const result = await authService.refreshToken(refreshToken);

      return ApiResponse.success(res, result, 'Token renovado');

    } catch (error) {
      logger.error('Error al renovar token:', error);
      return ApiResponse.error(res, error.message, 401);
    }
  }
}

module.exports = new AuthController();