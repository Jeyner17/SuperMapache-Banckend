const alertaService = require('../services/alerta.service');
const ApiResponse = require('../../../shared/utils/response');
const logger = require('../../../shared/utils/logger');

class AlertaController {

  async getAlertas(req, res) {
    try {
      const resultado = await alertaService.getAlertas(req.query);
      return ApiResponse.success(res, resultado);
    } catch (error) {
      logger.error('Error al obtener alertas:', error);
      return ApiResponse.serverError(res, 'Error al obtener alertas');
    }
  }

  async getNoLeidas(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const resultado = await alertaService.getNoLeidas(limit);
      return ApiResponse.success(res, resultado);
    } catch (error) {
      logger.error('Error al obtener alertas no leídas:', error);
      return ApiResponse.serverError(res, 'Error al obtener alertas');
    }
  }

  async getResumen(req, res) {
    try {
      const resumen = await alertaService.getResumen();
      return ApiResponse.success(res, resumen);
    } catch (error) {
      logger.error('Error al obtener resumen de alertas:', error);
      return ApiResponse.serverError(res, 'Error al obtener resumen');
    }
  }

  async marcarLeida(req, res) {
    try {
      const alerta = await alertaService.marcarLeida(req.params.id);
      return ApiResponse.success(res, alerta, 'Alerta marcada como leída');
    } catch (error) {
      logger.error('Error al marcar alerta leída:', error);
      if (error.message === 'Alerta no encontrada') return ApiResponse.notFound(res, error.message);
      return ApiResponse.serverError(res, 'Error al actualizar alerta');
    }
  }

  async marcarTodasLeidas(req, res) {
    try {
      const cantidad = await alertaService.marcarTodasLeidas();
      return ApiResponse.success(res, { cantidad }, `${cantidad} alertas marcadas como leídas`);
    } catch (error) {
      logger.error('Error al marcar todas leídas:', error);
      return ApiResponse.serverError(res, 'Error al actualizar alertas');
    }
  }

  async marcarResuelta(req, res) {
    try {
      const alerta = await alertaService.marcarResuelta(req.params.id, req.user.id);
      return ApiResponse.success(res, alerta, 'Alerta marcada como resuelta');
    } catch (error) {
      logger.error('Error al marcar alerta resuelta:', error);
      if (error.message === 'Alerta no encontrada') return ApiResponse.notFound(res, error.message);
      if (error.message === 'La alerta ya está resuelta') return ApiResponse.error(res, error.message, 400);
      return ApiResponse.serverError(res, 'Error al actualizar alerta');
    }
  }

  async generarAlertas(req, res) {
    try {
      const nuevas = await alertaService.generarAlertas();
      return ApiResponse.success(res, { generadas: nuevas.length, alertas: nuevas }, `${nuevas.length} alertas generadas`);
    } catch (error) {
      logger.error('Error al generar alertas:', error);
      return ApiResponse.serverError(res, 'Error al generar alertas');
    }
  }
}

module.exports = new AlertaController();
