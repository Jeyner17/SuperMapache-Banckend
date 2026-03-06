const { Escaneo } = require('../models');
const { Producto } = require('../../productos/models');
const { Categoria } = require('../../categorias/models');
const inventarioService = require('../../inventario/services/inventario.service');
const { Op } = require('sequelize');
const logger = require('../../../shared/utils/logger');

class EscaneoService {
  /**
   * Escanear código de barras y buscar producto
   */
  async escanear(codigoBarras, usuarioId, modulo = 'verificacion', metadata = {}) {
    try {
      // Buscar producto por código de barras
      const producto = await Producto.findOne({
        where: { codigo_barras: codigoBarras },
        include: [
          {
            model: Categoria,
            as: 'categoria',
            attributes: ['id', 'nombre']
          }
        ]
      });

      let resultado = 'no_encontrado';
      let productoData = null;

      if (producto) {
        resultado = 'exitoso';
        
        // Obtener stock actual si existe el producto
        const stock = await inventarioService.getStockProducto(producto.id);
        
        productoData = {
          id: producto.id,
          nombre: producto.nombre,
          codigo_barras: producto.codigo_barras,
          sku: producto.sku,
          precio_venta: producto.precio_venta,
          precio_costo: producto.precio_costo,
          margen_ganancia: producto.margen_ganancia,
          categoria: producto.categoria,
          stock_actual: stock,
          stock_minimo: producto.stock_minimo,
          stock_maximo: producto.stock_maximo,
          requiere_caducidad: producto.requiere_caducidad,
          unidad_medida: producto.unidad_medida,
          imagen: producto.imagen,
          activo: producto.activo
        };
      }

      // Registrar escaneo
      const escaneo = await Escaneo.create({
        codigo_barras: codigoBarras,
        producto_id: producto ? producto.id : null,
        usuario_id: usuarioId,
        modulo,
        accion: metadata.accion || 'busqueda',
        resultado,
        metadata: {
          ...metadata,
          producto_encontrado: !!producto
        },
        ip_address: metadata.ip_address || null
      });

      logger.info(`Escaneo registrado: ${codigoBarras} - Módulo: ${modulo} - Resultado: ${resultado}`);

      return {
        escaneo_id: escaneo.id,
        resultado,
        producto: productoData,
        mensaje: producto 
          ? 'Producto encontrado' 
          : `No se encontró producto con código de barras: ${codigoBarras}`
      };
    } catch (error) {
      logger.error('Error al escanear código:', error);
      
      // Registrar escaneo con error
      await Escaneo.create({
        codigo_barras: codigoBarras,
        producto_id: null,
        usuario_id: usuarioId,
        modulo,
        accion: metadata.accion || 'busqueda',
        resultado: 'error',
        metadata: {
          ...metadata,
          error: error.message
        }
      });

      throw error;
    }
  }

  /**
   * Buscar productos por coincidencia parcial de código
   */
  async buscarPorCodigo(codigoParcial, limit = 10) {
    try {
      const productos = await Producto.findAll({
        where: {
          [Op.or]: [
            { codigo_barras: { [Op.like]: `%${codigoParcial}%` } },
            { sku: { [Op.like]: `%${codigoParcial}%` } }
          ],
          activo: true
        },
        include: [
          {
            model: Categoria,
            as: 'categoria',
            attributes: ['id', 'nombre']
          }
        ],
        limit,
        order: [['nombre', 'ASC']]
      });

      // Agregar stock a cada producto
      const productosConStock = await Promise.all(
        productos.map(async (producto) => {
          const stock = await inventarioService.getStockProducto(producto.id);
          return {
            ...producto.toJSON(),
            stock_actual: stock
          };
        })
      );

      return productosConStock;
    } catch (error) {
      logger.error('Error al buscar por código:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de escaneos
   */
  async getHistorial(filters = {}) {
    try {
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const offset = (page - 1) * limit;

      const where = {};

      if (filters.usuario_id) {
        where.usuario_id = filters.usuario_id;
      }

      if (filters.modulo) {
        where.modulo = filters.modulo;
      }

      if (filters.resultado) {
        where.resultado = filters.resultado;
      }

      if (filters.fecha_inicio && filters.fecha_fin) {
        where.created_at = {
          [Op.between]: [filters.fecha_inicio, filters.fecha_fin]
        };
      }

      if (filters.codigo_barras) {
        where.codigo_barras = { [Op.like]: `%${filters.codigo_barras}%` };
      }

      const { count, rows } = await Escaneo.findAndCountAll({
        where,
        include: [
          {
            model: Producto,
            as: 'producto',
            attributes: ['id', 'nombre', 'codigo_barras']
          },
          {
            model: User,
            as: 'usuario',
            attributes: ['id', 'nombre', 'username']
          }
        ],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      return {
        escaneos: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('Error al obtener historial:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de escaneos
   */
  async getEstadisticas(filters = {}) {
    try {
      const where = {};

      if (filters.usuario_id) {
        where.usuario_id = filters.usuario_id;
      }

      if (filters.fecha_inicio && filters.fecha_fin) {
        where.created_at = {
          [Op.between]: [filters.fecha_inicio, filters.fecha_fin]
        };
      }

      const [total, exitosos, noEncontrados, errores] = await Promise.all([
        Escaneo.count({ where }),
        Escaneo.count({ where: { ...where, resultado: 'exitoso' } }),
        Escaneo.count({ where: { ...where, resultado: 'no_encontrado' } }),
        Escaneo.count({ where: { ...where, resultado: 'error' } })
      ]);

      const porModulo = await Escaneo.findAll({
        where,
        attributes: [
          'modulo',
          [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']
        ],
        group: ['modulo']
      });

      return {
        total,
        exitosos,
        no_encontrados: noEncontrados,
        errores,
        tasa_exito: total > 0 ? ((exitosos / total) * 100).toFixed(2) : 0,
        por_modulo: porModulo.map(item => ({
          modulo: item.modulo,
          cantidad: parseInt(item.get('cantidad'))
        }))
      };
    } catch (error) {
      logger.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  /**
   * Verificar disponibilidad de producto
   */
  async verificarDisponibilidad(codigoBarras, usuarioId) {
    try {
      const resultado = await this.escanear(codigoBarras, usuarioId, 'verificacion', {
        accion: 'verificacion'
      });

      if (resultado.producto) {
        const producto = resultado.producto;
        let disponibilidad = 'disponible';
        let mensaje = 'Producto disponible en stock';

        if (producto.stock_actual <= 0) {
          disponibilidad = 'agotado';
          mensaje = 'Producto agotado';
        } else if (producto.stock_actual <= producto.stock_minimo) {
          disponibilidad = 'bajo';
          mensaje = 'Stock bajo - Considere reabastecer';
        } else if (producto.stock_actual >= producto.stock_maximo) {
          disponibilidad = 'exceso';
          mensaje = 'Stock en exceso';
        }

        return {
          ...resultado,
          disponibilidad,
          mensaje_stock: mensaje
        };
      }

      return resultado;
    } catch (error) {
      logger.error('Error al verificar disponibilidad:', error);
      throw error;
    }
  }
}

module.exports = new EscaneoService();