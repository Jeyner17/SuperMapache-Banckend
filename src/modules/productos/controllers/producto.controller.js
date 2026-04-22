const productoService = require('../services/producto.service');
const ApiResponse = require('../../../shared/utils/response');
const logger = require('../../../shared/utils/logger');

const buildImageUrl = (req) =>
  `${req.protocol}://${req.get('host')}/uploads/productos/${req.file.filename}`;

class ProductoController {
  /**
   * GET /api/productos
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
   */
  async create(req, res) {
    try {
      const { imagen: _ignored, ...rest } = req.body;
      const data = {
        ...rest,
        requiere_caducidad: rest.requiere_caducidad === 'true' || rest.requiere_caducidad === true,
        activo: rest.activo === 'true' || rest.activo === true,
      };

      if (req.file) {
        data.imagen = buildImageUrl(req);
      }

      const producto = await productoService.create(data);

      return ApiResponse.created(res, producto, 'Producto creado exitosamente');
    } catch (error) {
      logger.error('Error al crear producto:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * PUT /api/productos/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { imagen: imagenBody, ...rest } = req.body;
      const data = {
        ...rest,
        requiere_caducidad: rest.requiere_caducidad === 'true' || rest.requiere_caducidad === true,
        activo: rest.activo === 'true' || rest.activo === true,
      };

      if (req.file) {
        // Nueva imagen subida
        data.imagen = buildImageUrl(req);
      } else if (imagenBody === '' || imagenBody === 'null') {
        // Usuario eliminó la imagen
        data.imagen = null;
      }
      // Si ninguno aplica: no incluir imagen en el update

      const producto = await productoService.update(id, data);

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
   * GET /api/productos/:id/verificar-eliminacion
   */
  async verificarEliminacion(req, res) {
    try {
      const { id } = req.params;
      const resultado = await productoService.verificarEliminacion(id);
      return ApiResponse.success(res, resultado, 'Verificación completada');
    } catch (error) {
      logger.error('Error al verificar eliminación:', error);
      if (error.message === 'Producto no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.serverError(res, 'Error al verificar eliminación');
    }
  }

  /**
   * DELETE /api/productos/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await productoService.delete(id);
      return ApiResponse.success(res, { eliminado: true }, 'Producto eliminado exitosamente');
    } catch (error) {
      logger.error('Error al eliminar producto:', error);
      if (error.message === 'Producto no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.error(res, error.message, 400, error.razones || null);
    }
  }
}

module.exports = new ProductoController();
