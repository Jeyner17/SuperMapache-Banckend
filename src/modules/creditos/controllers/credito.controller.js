const creditoService = require('../services/credito.service');
const ApiResponse = require('../../../shared/utils/response');
const logger = require('../../../shared/utils/logger');

class CreditoController {
  // ─── CLIENTES ────────────────────────────────────────────────────────────────

  async getClientes(req, res) {
    try {
      const result = await creditoService.getClientes({
        page: req.query.page,
        limit: req.query.limit,
        activo: req.query.activo,
        search: req.query.search
      });
      return ApiResponse.success(res, result, 'Clientes obtenidos');
    } catch (error) {
      logger.error('Error al obtener clientes:', error);
      return ApiResponse.serverError(res, 'Error al obtener clientes');
    }
  }

  async getClienteById(req, res) {
    try {
      const cliente = await creditoService.getClienteById(req.params.id);
      return ApiResponse.success(res, cliente, 'Cliente obtenido');
    } catch (error) {
      logger.error('Error al obtener cliente:', error);
      if (error.message === 'Cliente no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.serverError(res, 'Error al obtener cliente');
    }
  }

  async crearCliente(req, res) {
    try {
      const cliente = await creditoService.crearCliente(req.body);
      return ApiResponse.created(res, cliente, 'Cliente creado exitosamente');
    } catch (error) {
      logger.error('Error al crear cliente:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async actualizarCliente(req, res) {
    try {
      const cliente = await creditoService.actualizarCliente(req.params.id, req.body);
      return ApiResponse.success(res, cliente, 'Cliente actualizado exitosamente');
    } catch (error) {
      logger.error('Error al actualizar cliente:', error);
      if (error.message === 'Cliente no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.error(res, error.message, 400);
    }
  }

  // ─── CRÉDITOS ────────────────────────────────────────────────────────────────

  async getCreditos(req, res) {
    try {
      const result = await creditoService.getCreditos({
        page: req.query.page,
        limit: req.query.limit,
        estado: req.query.estado,
        cliente_id: req.query.cliente_id,
        vencidos: req.query.vencidos,
        search: req.query.search
      });
      return ApiResponse.success(res, result, 'Créditos obtenidos');
    } catch (error) {
      logger.error('Error al obtener créditos:', error);
      return ApiResponse.serverError(res, 'Error al obtener créditos');
    }
  }

  async getCreditoById(req, res) {
    try {
      const credito = await creditoService.getCreditoById(req.params.id);
      return ApiResponse.success(res, credito, 'Crédito obtenido');
    } catch (error) {
      logger.error('Error al obtener crédito:', error);
      if (error.message === 'Crédito no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.serverError(res, 'Error al obtener crédito');
    }
  }

  async crearCredito(req, res) {
    try {
      const credito = await creditoService.crearCredito(req.body, req.user.id);
      return ApiResponse.created(res, credito, 'Crédito creado exitosamente');
    } catch (error) {
      logger.error('Error al crear crédito:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async registrarPago(req, res) {
    try {
      const credito = await creditoService.registrarPago(req.params.id, req.body, req.user.id);
      return ApiResponse.success(res, credito, 'Pago registrado exitosamente');
    } catch (error) {
      logger.error('Error al registrar pago:', error);
      if (error.message === 'Crédito no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async getResumen(req, res) {
    try {
      const resumen = await creditoService.getResumen();
      return ApiResponse.success(res, resumen, 'Resumen obtenido');
    } catch (error) {
      logger.error('Error al obtener resumen:', error);
      return ApiResponse.serverError(res, 'Error al obtener resumen');
    }
  }
}

module.exports = new CreditoController();
