const { Producto } = require('../models');
const { Categoria } = require('../../categorias/models');
const { InventarioLote } = require('../../inventario/models');
const { VentaDetalle } = require('../../ventas/models');
const { Op } = require('sequelize');
const logger = require('../../../shared/utils/logger');

class ProductoService {
  /**
   * Obtener todos los productos con paginación
   */
  async getAll(filters = {}) {
    try {
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;
      const offset = (page - 1) * limit;

      const where = {};

      // Filtros
      if (filters.activo !== undefined) {
        where.activo = ['true', '1', true, 1].includes(filters.activo);
      } else {
        where.activo = true; // Por defecto solo productos activos
      }

      if (filters.categoria_id) {
        where.categoria_id = filters.categoria_id;
      }

      if (filters.requiere_caducidad !== undefined) {
        where.requiere_caducidad = filters.requiere_caducidad;
      }

      if (filters.search) {
        where[Op.or] = [
          { nombre: { [Op.like]: `%${filters.search}%` } },
          { codigo_barras: { [Op.like]: `%${filters.search}%` } },
          { sku: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const { count, rows } = await Producto.findAndCountAll({
        where,
        include: [
          {
            model: Categoria,
            as: 'categoria',
            attributes: ['id', 'nombre', 'color', 'icono']
          }
        ],
        limit,
        offset,
        order: [['nombre', 'ASC']],
        distinct: true
      });

      return {
        productos: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('Error al obtener productos:', error);
      throw error;
    }
  }

  /**
   * Obtener producto por ID
   */
  async getById(id) {
    try {
      const producto = await Producto.findByPk(id, {
        include: [
          {
            model: Categoria,
            as: 'categoria',
            include: [
              {
                model: Categoria,
                as: 'categoriaPadre',
                attributes: ['id', 'nombre']
              }
            ]
          }
        ]
      });

      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      return producto;
    } catch (error) {
      logger.error('Error al obtener producto:', error);
      throw error;
    }
  }

  /**
   * Buscar producto por código de barras
   */
  async getByCodigoBarras(codigoBarras) {
    try {
      const producto = await Producto.findOne({
        where: { codigo_barras: codigoBarras, activo: true },
        include: [
          {
            model: Categoria,
            as: 'categoria',
            attributes: ['id', 'nombre']
          }
        ]
      });

      return producto;
    } catch (error) {
      logger.error('Error al buscar producto por código:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo producto
   */
  async create(data) {
    try {
      // Validar que la categoría existe
      const categoria = await Categoria.findByPk(data.categoria_id);
      if (!categoria) {
        throw new Error('La categoría no existe');
      }

      // Validar código de barras único
      if (data.codigo_barras) {
        const existente = await Producto.findOne({
          where: { codigo_barras: data.codigo_barras }
        });
        if (existente) {
          throw new Error('El código de barras ya está registrado');
        }
      }

      // Validar SKU único
      if (data.sku) {
        const existente = await Producto.findOne({
          where: { sku: data.sku }
        });
        if (existente) {
          throw new Error('El SKU ya está registrado');
        }
      }

      const producto = await Producto.create(data);
      
      logger.info(`Producto creado: ${producto.nombre}`);
      
      return producto;
    } catch (error) {
      logger.error('Error al crear producto:', error);
      throw error;
    }
  }

  /**
   * Actualizar producto
   */
  async update(id, data) {
    try {
      const producto = await Producto.findByPk(id);

      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      // Validar categoría si se está cambiando
      if (data.categoria_id) {
        const categoria = await Categoria.findByPk(data.categoria_id);
        if (!categoria) {
          throw new Error('La categoría no existe');
        }
      }

      // Validar código de barras único
      if (data.codigo_barras && data.codigo_barras !== producto.codigo_barras) {
        const existente = await Producto.findOne({
          where: { 
            codigo_barras: data.codigo_barras,
            id: { [Op.ne]: id }
          }
        });
        if (existente) {
          throw new Error('El código de barras ya está registrado');
        }
      }

      await producto.update(data);
      
      logger.info(`Producto actualizado: ${producto.nombre}`);
      
      return producto;
    } catch (error) {
      logger.error('Error al actualizar producto:', error);
      throw error;
    }
  }

  /**
   * Verificar si un producto puede eliminarse
   */
  async verificarEliminacion(id) {
    try {
      const producto = await Producto.findByPk(id);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      const stockTotal = (await InventarioLote.sum('cantidad_actual', {
        where: { producto_id: id, cantidad_actual: { [Op.gt]: 0 } }
      })) || 0;

      const totalVentas = await VentaDetalle.count({
        where: { producto_id: id }
      });

      return {
        puedeEliminar: stockTotal === 0 && totalVentas === 0,
        tieneStock: stockTotal > 0,
        stockTotal,
        tieneVentas: totalVentas > 0,
        totalVentas
      };
    } catch (error) {
      logger.error('Error al verificar eliminación:', error);
      throw error;
    }
  }

  /**
   * Eliminar producto (hard delete con validaciones)
   */
  async delete(id) {
    try {
      const producto = await Producto.findByPk(id);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      const verificacion = await this.verificarEliminacion(id);
      if (!verificacion.puedeEliminar) {
        const error = new Error('No se puede eliminar el producto');
        error.razones = [];
        if (verificacion.tieneStock) {
          error.razones.push(`Tiene ${verificacion.stockTotal} unidades en inventario`);
        }
        if (verificacion.tieneVentas) {
          error.razones.push(`Tiene ${verificacion.totalVentas} ventas registradas`);
        }
        throw error;
      }

      await producto.destroy();
      logger.info(`Producto eliminado: ${producto.nombre}`);
      return true;
    } catch (error) {
      logger.error('Error al eliminar producto:', error);
      throw error;
    }
  }
}

module.exports = new ProductoService();