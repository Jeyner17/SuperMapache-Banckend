const proveedorService = require('../services/proveedor.service');
const ApiResponse = require('../../../shared/utils/response');
const logger = require('../../../shared/utils/logger');

class ProveedorController {
  /**
   * GET /api/proveedores
   * Obtener todos los proveedores
   */
  async getAll(req, res) {
    try {
      const filters = {
        activo: req.query.activo,
        tipo_proveedor: req.query.tipo_proveedor,
        search: req.query.search
      };

      const proveedores = await proveedorService.getAll(filters);

      return ApiResponse.success(res, proveedores, 'Proveedores obtenidos');
    } catch (error) {
      logger.error('Error al obtener proveedores:', error);
      return ApiResponse.serverError(res, 'Error al obtener proveedores');
    }
  }

  /**
   * GET /api/proveedores/:id
   * Obtener proveedor por ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const proveedor = await proveedorService.getById(id);

      return ApiResponse.success(res, proveedor, 'Proveedor obtenido');
    } catch (error) {
      logger.error('Error al obtener proveedor:', error);
      if (error.message === 'Proveedor no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.serverError(res, 'Error al obtener proveedor');
    }
  }

  /**
   * GET /api/proveedores/:id/estadisticas
   * Obtener estadísticas de un proveedor
   */
  async getEstadisticas(req, res) {
    try {
      const { id } = req.params;
      const estadisticas = await proveedorService.getEstadisticas(id);

      return ApiResponse.success(res, estadisticas, 'Estadísticas obtenidas');
    } catch (error) {
      logger.error('Error al obtener estadísticas:', error);
      return ApiResponse.serverError(res, 'Error al obtener estadísticas');
    }
  }

  /**
   * POST /api/proveedores
   * Crear nuevo proveedor
   */
  async create(req, res) {
    try {
      const proveedor = await proveedorService.create(req.body);

      return ApiResponse.created(res, proveedor, 'Proveedor creado exitosamente');
    } catch (error) {
      logger.error('Error al crear proveedor:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * PUT /api/proveedores/:id
   * Actualizar proveedor
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const proveedor = await proveedorService.update(id, req.body);

      return ApiResponse.success(res, proveedor, 'Proveedor actualizado exitosamente');
    } catch (error) {
      logger.error('Error al actualizar proveedor:', error);
      if (error.message === 'Proveedor no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * DELETE /api/proveedores/:id
   * Eliminar proveedor (soft delete)
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await proveedorService.delete(id);

      return ApiResponse.success(res, null, 'Proveedor eliminado exitosamente');
    } catch (error) {
      logger.error('Error al eliminar proveedor:', error);
      if (error.message === 'Proveedor no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = new ProveedorController();