const productoService = require('../services/producto.service');
const ApiResponse = require('../../../shared/utils/response');
const logger = require('../../../shared/utils/logger');

class ProductoController {
  /**
   * GET /api/productos
   * Obtener todos los productos con paginación
   */
  async getAll(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        activo: req.query.activo,
        categoria_id: req.query.categoria_id,
        requiere_caducidad: req.query.requiere_caducidad,
        search: req.query.search
      };

      const result = await productoService.getAll(filters);

      return ApiResponse.success(res, result, 'Productos obtenidos');
    } catch (error) {
      logger.error('Error al obtener productos:', error);
      return ApiResponse.serverError(res, 'Error al obtener productos');
    }
  }

  /**
   * GET /api/productos/:id
   * Obtener producto por ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const producto = await productoService.getById(id);

      return ApiResponse.success(res, producto, 'Producto obtenido');
    } catch (error) {
      logger.error('Error al obtener producto:', error);
      if (error.message === 'Producto no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.serverError(res, 'Error al obtener producto');
    }
  }

  /**
   * GET /api/productos/codigo/:codigoBarras
   * Buscar producto por código de barras
   */
  async getByCodigoBarras(req, res) {
    try {
      const { codigoBarras } = req.params;
      const producto = await productoService.getByCodigoBarras(codigoBarras);

      if (!producto) {
        return ApiResponse.notFound(res, 'Producto no encontrado');
      }

      return ApiResponse.success(res, producto, 'Producto encontrado');
    } catch (error) {
      logger.error('Error al buscar producto:', error);
      return ApiResponse.serverError(res, 'Error al buscar producto');
    }
  }

  /**
   * POST /api/productos
   * Crear nuevo producto
   */
  async create(req, res) {
    try {
      const producto = await productoService.create(req.body);

      return ApiResponse.created(res, producto, 'Producto creado exitosamente');
    } catch (error) {
      logger.error('Error al crear producto:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * PUT /api/productos/:id
   * Actualizar producto
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const producto = await productoService.update(id, req.body);

      return ApiResponse.success(res, producto, 'Producto actualizado exitosamente');
    } catch (error) {
      logger.error('Error al actualizar producto:', error);
      if (error.message === 'Producto no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * DELETE /api/productos/:id
   * Eliminar producto (soft delete)
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      logger.info(`Solicitud de eliminación de producto ID: ${id}`);
      
      const resultado = await productoService.delete(id);
      
      logger.info(`Producto eliminado exitosamente ID: ${id}`);

      return ApiResponse.success(res, { eliminado: true }, 'Producto eliminado exitosamente');
    } catch (error) {
      logger.error('Error al eliminar producto:', error);
      if (error.message === 'Producto no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = new ProductoController();