const categoriaService = require('../services/categoria.service');
const ApiResponse = require('../../../shared/utils/response');
const logger = require('../../../shared/utils/logger');

class CategoriaController {
  /**
   * GET /api/categorias
   * Obtener todas las categorías
   */
  async getAll(req, res) {
    try {
      const filters = {
        activo: req.query.activo,
        search: req.query.search
      };

      const categorias = await categoriaService.getAll(filters);

      return ApiResponse.success(res, categorias, 'Categorías obtenidas');
    } catch (error) {
      logger.error('Error al obtener categorías:', error);
      return ApiResponse.serverError(res, 'Error al obtener categorías');
    }
  }

  /**
   * GET /api/categorias/:id
   * Obtener categoría por ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const categoria = await categoriaService.getById(id);

      return ApiResponse.success(res, categoria, 'Categoría obtenida');
    } catch (error) {
      logger.error('Error al obtener categoría:', error);
      if (error.message === 'Categoría no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.serverError(res, 'Error al obtener categoría');
    }
  }

  /**
   * POST /api/categorias
   * Crear nueva categoría
   */
  async create(req, res) {
    try {
      const categoria = await categoriaService.create(req.body);

      return ApiResponse.created(res, categoria, 'Categoría creada exitosamente');
    } catch (error) {
      logger.error('Error al crear categoría:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * PUT /api/categorias/:id
   * Actualizar categoría
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const categoria = await categoriaService.update(id, req.body);

      return ApiResponse.success(res, categoria, 'Categoría actualizada exitosamente');
    } catch (error) {
      logger.error('Error al actualizar categoría:', error);
      if (error.message === 'Categoría no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * DELETE /api/categorias/:id
   * Eliminar categoría (soft delete)
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await categoriaService.delete(id);

      return ApiResponse.success(res, null, 'Categoría eliminada exitosamente');
    } catch (error) {
      logger.error('Error al eliminar categoría:', error);
      if (error.message === 'Categoría no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = new CategoriaController();