const ventaService = require('../services/venta.service');
const ApiResponse = require('../../../shared/utils/response');
const logger = require('../../../shared/utils/logger');

class VentaController {
  /**
   * GET /api/ventas
   * Obtener todas las ventas con paginación
   */
  async getAll(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        estado: req.query.estado,
        metodo_pago: req.query.metodo_pago,
        usuario_id: req.query.usuario_id,
        search: req.query.search,
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin
      };

      const result = await ventaService.getAll(filters);

      return ApiResponse.success(res, result, 'Ventas obtenidas');
    } catch (error) {
      logger.error('Error al obtener ventas:', error);
      return ApiResponse.serverError(res, 'Error al obtener ventas');
    }
  }

  /**
   * GET /api/ventas/estadisticas
   * Obtener estadísticas de ventas
   */
  async getEstadisticas(req, res) {
    try {
      const filters = {
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin
      };

      const estadisticas = await ventaService.getEstadisticas(filters);

      return ApiResponse.success(res, estadisticas, 'Estadísticas obtenidas');
    } catch (error) {
      logger.error('Error al obtener estadísticas:', error);
      return ApiResponse.serverError(res, 'Error al obtener estadísticas');
    }
  }

  /**
   * GET /api/ventas/productos-mas-vendidos
   * Obtener productos más vendidos
   */
  async getProductosMasVendidos(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin
      };

      const productos = await ventaService.getProductosMasVendidos(limit, filters);

      return ApiResponse.success(res, productos, 'Productos más vendidos obtenidos');
    } catch (error) {
      logger.error('Error al obtener productos más vendidos:', error);
      return ApiResponse.serverError(res, 'Error al obtener productos más vendidos');
    }
  }

  /**
   * GET /api/ventas/:id
   * Obtener venta por ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const venta = await ventaService.getById(id);

      return ApiResponse.success(res, venta, 'Venta obtenida');
    } catch (error) {
      logger.error('Error al obtener venta:', error);
      if (error.message === 'Venta no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.serverError(res, 'Error al obtener venta');
    }
  }

  /**
   * POST /api/ventas
   * Crear nueva venta
   */
  async create(req, res) {
    try {
      const usuarioId = req.user.id;
      const venta = await ventaService.crearVenta(req.body, usuarioId);

      return ApiResponse.created(res, venta, 'Venta creada exitosamente');
    } catch (error) {
      logger.error('Error al crear venta:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * POST /api/ventas/:id/cancelar
   * Cancelar venta
   */
  async cancelar(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const usuarioId = req.user.id;

      if (!motivo) {
        return ApiResponse.error(res, 'El motivo de cancelación es requerido', 400);
      }

      const venta = await ventaService.cancelarVenta(id, motivo, usuarioId);

      return ApiResponse.success(res, venta, 'Venta cancelada exitosamente');
    } catch (error) {
      logger.error('Error al cancelar venta:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = new VentaController();