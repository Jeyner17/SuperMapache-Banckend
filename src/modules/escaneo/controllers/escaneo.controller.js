const escaneoService = require('../services/escaneo.service');
const ApiResponse = require('../../../shared/utils/response');
const logger = require('../../../shared/utils/logger');

class EscaneoController {
  /**
   * POST /api/escaneo/scan
   * Escanear código de barras
   */
  async escanear(req, res) {
    try {
      const { codigo_barras, modulo, metadata } = req.body;
      const usuarioId = req.user.id;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const resultado = await escaneoService.escanear(
        codigo_barras,
        usuarioId,
        modulo,
        {
          ...metadata,
          ip_address: ipAddress
        }
      );

      return ApiResponse.success(res, resultado, 'Escaneo realizado');
    } catch (error) {
      logger.error('Error al escanear:', error);
      return ApiResponse.serverError(res, 'Error al procesar escaneo');
    }
  }

  /**
   * GET /api/escaneo/buscar/:codigo
   * Buscar productos por código parcial
   */
  async buscarPorCodigo(req, res) {
    try {
      const { codigo } = req.params;
      const { limit } = req.query;

      const productos = await escaneoService.buscarPorCodigo(codigo, limit);

      return ApiResponse.success(res, productos, 'Productos encontrados');
    } catch (error) {
      logger.error('Error al buscar productos:', error);
      return ApiResponse.serverError(res, 'Error al buscar productos');
    }
  }

  /**
   * POST /api/escaneo/verificar
   * Verificar disponibilidad de producto
   */
  async verificarDisponibilidad(req, res) {
    try {
      const { codigo_barras } = req.body;
      const usuarioId = req.user.id;

      const resultado = await escaneoService.verificarDisponibilidad(
        codigo_barras,
        usuarioId
      );

      return ApiResponse.success(res, resultado, 'Verificación completada');
    } catch (error) {
      logger.error('Error al verificar disponibilidad:', error);
      return ApiResponse.serverError(res, 'Error al verificar disponibilidad');
    }
  }

  /**
   * GET /api/escaneo/historial
   * Obtener historial de escaneos
   */
  async getHistorial(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        usuario_id: req.query.usuario_id,
        modulo: req.query.modulo,
        resultado: req.query.resultado,
        codigo_barras: req.query.codigo_barras,
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin
      };

      const resultado = await escaneoService.getHistorial(filters);

      return ApiResponse.success(res, resultado, 'Historial obtenido');
    } catch (error) {
      logger.error('Error al obtener historial:', error);
      return ApiResponse.serverError(res, 'Error al obtener historial');
    }
  }

  /**
   * GET /api/escaneo/estadisticas
   * Obtener estadísticas de escaneos
   */
  async getEstadisticas(req, res) {
    try {
      const filters = {
        usuario_id: req.query.usuario_id,
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin
      };

      const estadisticas = await escaneoService.getEstadisticas(filters);

      return ApiResponse.success(res, estadisticas, 'Estadísticas obtenidas');
    } catch (error) {
      logger.error('Error al obtener estadísticas:', error);
      return ApiResponse.serverError(res, 'Error al obtener estadísticas');
    }
  }
}

module.exports = new EscaneoController();