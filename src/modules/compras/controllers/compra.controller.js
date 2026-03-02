const compraService = require('../services/compra.service');
const ApiResponse = require('../../../shared/utils/response');
const logger = require('../../../shared/utils/logger');

class CompraController {
  /**
   * GET /api/compras
   * Obtener todas las compras con paginación
   */
  async getAll(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        estado: req.query.estado,
        proveedor_id: req.query.proveedor_id,
        estado_pago: req.query.estado_pago,
        search: req.query.search,
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin
      };

      const result = await compraService.getAll(filters);

      return ApiResponse.success(res, result, 'Compras obtenidas');
    } catch (error) {
      logger.error('Error al obtener compras:', error);
      return ApiResponse.serverError(res, 'Error al obtener compras');
    }
  }

  /**
   * GET /api/compras/resumen
   * Obtener resumen de compras
   */
  async getResumen(req, res) {
    try {
      const filters = {
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin
      };

      const resumen = await compraService.getResumen(filters);

      return ApiResponse.success(res, resumen, 'Resumen obtenido');
    } catch (error) {
      logger.error('Error al obtener resumen:', error);
      return ApiResponse.serverError(res, 'Error al obtener resumen');
    }
  }

  /**
   * GET /api/compras/:id
   * Obtener compra por ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const compra = await compraService.getById(id);

      return ApiResponse.success(res, compra, 'Compra obtenida');
    } catch (error) {
      logger.error('Error al obtener compra:', error);
      if (error.message === 'Compra no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.serverError(res, 'Error al obtener compra');
    }
  }

  /**
   * POST /api/compras
   * Crear nueva compra
   */
  async create(req, res) {
    try {
      const usuarioId = req.user.id;
      const compra = await compraService.create(req.body, usuarioId);

      return ApiResponse.created(res, compra, 'Compra creada exitosamente');
    } catch (error) {
      logger.error('Error al crear compra:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * POST /api/compras/:id/recibir
   * Recibir mercancía de la compra
   */
  async recibir(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.user.id;
      const compra = await compraService.recibirCompra(id, req.body, usuarioId);

      return ApiResponse.success(res, compra, 'Mercancía recibida exitosamente');
    } catch (error) {
      logger.error('Error al recibir compra:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * POST /api/compras/:id/cancelar
   * Cancelar compra
   */
  async cancelar(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const usuarioId = req.user.id;

      if (!motivo) {
        return ApiResponse.error(res, 'El motivo de cancelación es requerido', 400);
      }

      const compra = await compraService.cancelar(id, motivo, usuarioId);

      return ApiResponse.success(res, compra, 'Compra cancelada exitosamente');
    } catch (error) {
      logger.error('Error al cancelar compra:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * POST /api/compras/:id/pagar
   * Registrar pago de compra
   */
  async registrarPago(req, res) {
    try {
      const { id } = req.params;
      const { monto } = req.body;
      const usuarioId = req.user.id;

      if (!monto || parseFloat(monto) <= 0) {
        return ApiResponse.error(res, 'El monto debe ser mayor a 0', 400);
      }

      const compra = await compraService.registrarPago(id, monto, usuarioId);

      return ApiResponse.success(res, compra, 'Pago registrado exitosamente');
    } catch (error) {
      logger.error('Error al registrar pago:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = new CompraController();