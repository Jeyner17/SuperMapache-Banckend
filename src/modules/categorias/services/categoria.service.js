const { Categoria } = require('../models');
const { Producto } = require('../../productos/models');
const { Op } = require('sequelize');
const logger = require('../../../shared/utils/logger');

class CategoriaService {
  /**
   * Obtener todas las categorías
   */
  async getAll(filters = {}) {
    try {
      const where = {};

      if (filters.activo !== undefined) {
        where.activo = filters.activo;
      }

      if (filters.search) {
        where.nombre = {
          [Op.like]: `%${filters.search}%`
        };
      }

      const categorias = await Categoria.findAll({
        where,
        include: [
          {
            model: Producto,
            as: 'productos',
            attributes: ['id'],
            required: false
          }
        ],
        order: [['nombre', 'ASC']]
      });

      return categorias;
    } catch (error) {
      logger.error('Error al obtener categorías:', error);
      throw error;
    }
  }

  /**
   * Obtener categoría por ID
   */
  async getById(id) {
    try {
      const categoria = await Categoria.findByPk(id, {
        include: [
          {
            model: Producto,
            as: 'productos',
            attributes: ['id', 'nombre', 'precio_venta']
          }
        ]
      });

      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }

      return categoria;
    } catch (error) {
      logger.error('Error al obtener categoría:', error);
      throw error;
    }
  }

  /**
   * Crear nueva categoría
   */
  async create(data) {
    try {
      const categoria = await Categoria.create(data);
      
      logger.info(`Categoría creada: ${categoria.nombre}`);
      
      return categoria;
    } catch (error) {
      logger.error('Error al crear categoría:', error);
      throw error;
    }
  }

  /**
   * Actualizar categoría
   */
  async update(id, data) {
    try {
      const categoria = await Categoria.findByPk(id);

      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }

      await categoria.update(data);
      
      logger.info(`Categoría actualizada: ${categoria.nombre}`);
      
      return categoria;
    } catch (error) {
      logger.error('Error al actualizar categoría:', error);
      throw error;
    }
  }

  /**
   * Eliminar categoría (soft delete)
   */
  async delete(id) {
    try {
      const categoria = await Categoria.findByPk(id, {
        include: [
          {
            model: Producto,
            as: 'productos'
          }
        ]
      });

      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }

      // Verificar si tiene productos activos
      const productosActivos = categoria.productos?.filter(p => p.activo) || [];
      if (productosActivos.length > 0) {
        throw new Error('No se puede eliminar una categoría con productos asociados');
      }

      await categoria.destroy();

      logger.info(`Categoría eliminada: ${categoria.nombre}`);
      
      return true;
    } catch (error) {
      logger.error('Error al eliminar categoría:', error);
      throw error;
    }
  }
}

module.exports = new CategoriaService();