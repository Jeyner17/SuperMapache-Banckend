const inventarioService = require('../services/inventario.service');
const ApiResponse = require('../../../shared/utils/response');
const logger = require('../../../shared/utils/logger');

class InventarioController {
  /**
   * GET /api/inventario/lotes
   * Obtener todos los lotes
   */
  async getAllLotes(req, res) {
    try {
      const filters = {
        estado: req.query.estado,
        producto_id: req.query.producto_id,
        categoria_id: req.query.categoria_id,
        search: req.query.search,
        solo_disponibles: req.query.solo_disponibles === 'true'
      };

      const lotes = await inventarioService.getAllLotes(filters);

      return ApiResponse.success(res, lotes, 'Lotes obtenidos');
    } catch (error) {
      logger.error('Error al obtener lotes:', error);
      return ApiResponse.serverError(res, 'Error al obtener lotes');
    }
  }

  /**
   * GET /api/inventario/resumen
   * Obtener resumen de inventario por producto
   */
  async getResumen(req, res) {
    try {
      const filters = {
        categoria_id: req.query.categoria_id,
        search: req.query.search
      };

      const resumen = await inventarioService.getResumenInventario(filters);

      return ApiResponse.success(res, resumen, 'Resumen obtenido');
    } catch (error) {
      logger.error('Error al obtener resumen:', error);
      return ApiResponse.serverError(res, 'Error al obtener resumen');
    }
  }

  /**
   * GET /api/inventario/producto/:productoId/stock
   * Obtener stock de un producto
   */
  async getStockProducto(req, res) {
    try {
      const { productoId } = req.params;
      const stock = await inventarioService.getStockProducto(productoId);

      return ApiResponse.success(res, { stock }, 'Stock obtenido');
    } catch (error) {
      logger.error('Error al obtener stock:', error);
      return ApiResponse.serverError(res, 'Error al obtener stock');
    }
  }

  /**
   * GET /api/inventario/lotes/:id
   * Obtener lote por ID
   */
  async getLoteById(req, res) {
    try {
      const { id } = req.params;
      const lote = await inventarioService.getLoteById(id);

      return ApiResponse.success(res, lote, 'Lote obtenido');
    } catch (error) {
      logger.error('Error al obtener lote:', error);
      if (error.message === 'Lote no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.serverError(res, 'Error al obtener lote');
    }
  }

  /**
   * POST /api/inventario/lotes
   * Crear nuevo lote (entrada de inventario)
   */
  async crearLote(req, res) {
    try {
      const usuarioId = req.user.id;
      const lote = await inventarioService.crearLote(req.body, usuarioId);

      return ApiResponse.created(res, lote, 'Lote creado exitosamente');
    } catch (error) {
      logger.error('Error al crear lote:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * POST /api/inventario/descontar
   * Descontar stock (FIFO automático)
   */
  async descontarStock(req, res) {
    try {
      const { producto_id, cantidad, motivo, referencia } = req.body;
      const usuarioId = req.user.id;

      const movimientos = await inventarioService.descontarStock(
        producto_id,
        cantidad,
        usuarioId,
        motivo,
        referencia
      );

      return ApiResponse.success(res, movimientos, 'Stock descontado exitosamente');
    } catch (error) {
      logger.error('Error al descontar stock:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * PUT /api/inventario/lotes/:id/ajustar
   * Ajustar stock de un lote
   */
  async ajustarStock(req, res) {
    try {
      const { id } = req.params;
      const { nueva_cantidad, motivo, notas } = req.body;
      const usuarioId = req.user.id;

      const lote = await inventarioService.ajustarStock(
        id,
        nueva_cantidad,
        usuarioId,
        motivo,
        notas
      );

      return ApiResponse.success(res, lote, 'Stock ajustado exitosamente');
    } catch (error) {
      logger.error('Error al ajustar stock:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * GET /api/inventario/movimientos
   * Obtener movimientos de inventario
   */
  async getMovimientos(req, res) {
    try {
      const filters = {
        producto_id: req.query.producto_id,
        lote_id: req.query.lote_id,
        tipo_movimiento: req.query.tipo_movimiento,
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin,
        page: req.query.page,
        limit: req.query.limit
      };

      const result = await inventarioService.getMovimientos(filters);

      return ApiResponse.success(res, result, 'Movimientos obtenidos');
    } catch (error) {
      logger.error('Error al obtener movimientos:', error);
      return ApiResponse.serverError(res, 'Error al obtener movimientos');
    }
  }

  /**
   * GET /api/inventario/alertas
   * Obtener alertas de inventario
   */
  async getAlertas(req, res) {
    try {
      const alertas = await inventarioService.getAlertas();

      return ApiResponse.success(res, alertas, 'Alertas obtenidas');
    } catch (error) {
      logger.error('Error al obtener alertas:', error);
      return ApiResponse.serverError(res, 'Error al obtener alertas');
    }
  }

  /**
   * POST /api/inventario/verificar-estados
   * Verificar y actualizar estados de lotes (cron job manual)
   */
  async verificarEstados(req, res) {
    try {
      const lotesActualizados = await inventarioService.verificarEstadosLotes();

      return ApiResponse.success(
        res,
        lotesActualizados,
        `${lotesActualizados.length} lotes actualizados`
      );
    } catch (error) {
      logger.error('Error al verificar estados:', error);
      return ApiResponse.serverError(res, 'Error al verificar estados');
    }
  }
}

module.exports = new InventarioController();