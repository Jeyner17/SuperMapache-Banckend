const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const jwtConfig = require('../../../shared/config/jwt');
const logger = require('../../../shared/utils/logger');

class AuthService {
  /**
   * Login de usuario
   */
  async login(username, password) {
    try {
      // Buscar usuario con su rol
      const user = await User.findOne({
        where: { username, activo: true },
        include: [{
          model: Role,
          as: 'rol',
          attributes: ['id', 'nombre', 'permisos']
        }]
      });

      if (!user) {
        throw new Error('Usuario o contraseña incorrectos');
      }

      // Verificar contraseña
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        throw new Error('Usuario o contraseña incorrectos');
      }

      // Actualizar último acceso
      await user.update({ ultimo_acceso: new Date() });

      // Generar tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      logger.info(`Login exitoso: ${username}`);

      return {
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          username: user.username,
          rol: user.rol.nombre,
          permisos: user.rol.permisos,
          avatar: user.avatar
        },
        token: accessToken,
        refreshToken
      };

    } catch (error) {
      logger.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Obtener perfil de usuario
   */
  async getProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [{
          model: Role,
          as: 'rol',
          attributes: ['id', 'nombre', 'permisos']
        }]
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        username: user.username,
        rol: user.rol.nombre,
        permisos: user.rol.permisos,
        avatar: user.avatar,
        ultimo_acceso: user.ultimo_acceso
      };

    } catch (error) {
      logger.error('Error al obtener perfil:', error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const isValid = await user.comparePassword(currentPassword);
      if (!isValid) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Actualizar contraseña
      await user.update({ password: newPassword });

      logger.info(`Contraseña cambiada: ${user.username}`);

      return true;

    } catch (error) {
      logger.error('Error al cambiar contraseña:', error);
      throw error;
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken) {
    try {
      // Verificar refresh token
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);

      // Buscar usuario
      const user = await User.findByPk(decoded.id, {
        include: [{
          model: Role,
          as: 'rol'
        }]
      });

      if (!user || !user.activo) {
        throw new Error('Usuario no válido');
      }

      // Generar nuevo access token
      const newAccessToken = this.generateAccessToken(user);

      return {
        token: newAccessToken
      };

    } catch (error) {
      logger.error('Error al renovar token:', error);
      throw new Error('Token inválido o expirado');
    }
  }

  /**
   * Generar access token (JWT)
   */
  generateAccessToken(user) {
    const payload = {
      id: user.id,
      username: user.username,
      rol: user.rol.nombre,
      permisos: user.rol.permisos
    };

    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn
    });
  }

  /**
   * Generar refresh token
   */
  generateRefreshToken(user) {
    const payload = {
      id: user.id,
      username: user.username
    };

    return jwt.sign(payload, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiresIn
    });
  }
}

module.exports = new AuthService();