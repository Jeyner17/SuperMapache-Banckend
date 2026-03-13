const configuracionService = require('../services/configuracion.service');
const ApiResponse = require('../../../shared/utils/response');
const logger = require('../../../shared/utils/logger');

class ConfiguracionController {
  /**
   * GET /api/configuracion
   * Obtener todas las configuraciones agrupadas por categoría
   */
  async getAll(req, res) {
    try {
      const configuraciones = await configuracionService.getAll();

      return ApiResponse.success(res, configuraciones, 'Configuraciones obtenidas');
    } catch (error) {
      logger.error('Error al obtener configuraciones:', error);
      return ApiResponse.serverError(res, 'Error al obtener configuraciones');
    }
  }

  /**
   * GET /api/configuracion/publicas
   * Obtener configuraciones públicas (sin autenticación)
   */
  async getPublicas(req, res) {
    try {
      const configuraciones = await configuracionService.getPublicas();

      return ApiResponse.success(res, configuraciones, 'Configuraciones públicas obtenidas');
    } catch (error) {
      logger.error('Error al obtener configuraciones públicas:', error);
      return ApiResponse.serverError(res, 'Error al obtener configuraciones públicas');
    }
  }

  /**
   * GET /api/configuracion/categoria/:categoria
   * Obtener configuraciones por categoría
   */
  async getByCategoria(req, res) {
    try {
      const { categoria } = req.params;
      const configuraciones = await configuracionService.getByCategoria(categoria);

      return ApiResponse.success(res, configuraciones, `Configuraciones de ${categoria} obtenidas`);
    } catch (error) {
      logger.error('Error al obtener configuraciones por categoría:', error);
      return ApiResponse.serverError(res, 'Error al obtener configuraciones');
    }
  }

  /**
   * GET /api/configuracion/clave/:clave
   * Obtener configuración específica por clave
   */
  async getByClave(req, res) {
    try {
      const { clave } = req.params;
      const valor = await configuracionService.getByClave(clave);

      if (valor === null) {
        return ApiResponse.notFound(res, `Configuración '${clave}' no encontrada`);
      }

      return ApiResponse.success(res, { clave, valor }, 'Configuración obtenida');
    } catch (error) {
      logger.error('Error al obtener configuración:', error);
      return ApiResponse.serverError(res, 'Error al obtener configuración');
    }
  }

  /**
   * PUT /api/configuracion/:clave
   * Actualizar una configuración específica
   */
  async update(req, res) {
    try {
      const { clave } = req.params;
      const { valor } = req.body;

      const valorActualizado = await configuracionService.update(clave, valor);

      return ApiResponse.success(
        res, 
        { clave, valor: valorActualizado }, 
        'Configuración actualizada exitosamente'
      );
    } catch (error) {
      logger.error('Error al actualizar configuración:', error);
      if (error.message.includes('no encontrada')) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * PUT /api/configuracion/multiple
   * Actualizar múltiples configuraciones
   */
  async updateMultiple(req, res) {
    try {
      const { configuraciones } = req.body;

      if (!Array.isArray(configuraciones) || configuraciones.length === 0) {
        return ApiResponse.error(res, 'Debe proporcionar un array de configuraciones', 400);
      }

      const resultados = await configuracionService.updateMultiple(configuraciones);

      return ApiResponse.success(res, resultados, 'Configuraciones actualizadas exitosamente');
    } catch (error) {
      logger.error('Error al actualizar múltiples configuraciones:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * GET /api/configuracion/empresa
   * Obtener datos de la empresa
   */
  async getDatosEmpresa(req, res) {
    try {
      const datosEmpresa = await configuracionService.getDatosEmpresa();

      return ApiResponse.success(res, datosEmpresa, 'Datos de empresa obtenidos');
    } catch (error) {
      logger.error('Error al obtener datos de empresa:', error);
      return ApiResponse.serverError(res, 'Error al obtener datos de empresa');
    }
  }

  /**
   * GET /api/configuracion/iva
   * Obtener porcentaje de IVA configurado
   */
  async getIVA(req, res) {
    try {
      const iva = await configuracionService.getIVA();

      return ApiResponse.success(res, { iva }, 'IVA obtenido');
    } catch (error) {
      logger.error('Error al obtener IVA:', error);
      return ApiResponse.serverError(res, 'Error al obtener IVA');
    }
  }
}

module.exports = new ConfiguracionController();