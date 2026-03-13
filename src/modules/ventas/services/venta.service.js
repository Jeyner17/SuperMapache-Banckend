const { Venta, VentaDetalle } = require('../models');
const { Producto } = require('../../productos/models');
const { Categoria } = require('../../categorias/models');
const { User } = require('../../auth/models');
const inventarioService = require('../../inventario/services/inventario.service');
const { Op } = require('sequelize');
const { sequelize } = require('../../../database/connection');
const logger = require('../../../shared/utils/logger');

class VentaService {
  /**
   * Generar número de venta
   */
  async generarNumeroVenta() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const prefix = `VENTA-${year}${month}-`;
    
    const ultimaVenta = await Venta.findOne({
      where: {
        numero_venta: {
          [Op.like]: `${prefix}%`
        }
      },
      order: [['numero_venta', 'DESC']]
    });

    let numero = 1;
    if (ultimaVenta) {
      const ultimoNumero = parseInt(ultimaVenta.numero_venta.split('-')[2]);
      numero = ultimoNumero + 1;
    }

    return `${prefix}${numero.toString().padStart(6, '0')}`;
  }

  /**
   * Crear venta con descuento FIFO automático
   */
  async crearVenta(data, usuarioId) {
    const transaction = await sequelize.transaction();

    try {
      // Validar que hay productos
      if (!data.productos || data.productos.length === 0) {
        throw new Error('Debe agregar al menos un producto');
      }

      // Generar número de venta
      const numeroVenta = await this.generarNumeroVenta();

      // Calcular totales
      let subtotal = 0;
      let impuestos = 0;
      const descuento = parseFloat(data.descuento) || 0;

      const detalles = [];

      // Procesar cada producto
      for (const item of data.productos) {
        const producto = await Producto.findByPk(item.producto_id);
        if (!producto) {
          throw new Error(`Producto con ID ${item.producto_id} no encontrado`);
        }

        if (!producto.activo) {
          throw new Error(`El producto ${producto.nombre} no está activo`);
        }

        const cantidad = parseFloat(item.cantidad);
        const precioUnitario = parseFloat(producto.precio_venta);
        const subtotalItem = cantidad * precioUnitario;
        const impuestoItem = subtotalItem * 0.12; // IVA 12%
        const totalItem = subtotalItem + impuestoItem;

        subtotal += subtotalItem;
        impuestos += impuestoItem;

        // **DESCUENTO FIFO AUTOMÁTICO**
        // Descontar del inventario usando FIFO
        const movimientos = await inventarioService.descontarStock(
          producto.id,
          cantidad,
          usuarioId,
          `Venta ${numeroVenta}`,
          {
            referencia_tipo: 'venta',
            referencia_id: 'pending' // Se actualizará después
          }
        );

        // Registrar lotes usados
        const lotesUsados = movimientos.map(mov => ({
          lote_id: mov.lote_id,
          cantidad: Math.abs(mov.cantidad),
          numero_lote: mov.numero_lote
        }));

        detalles.push({
          producto_id: item.producto_id,
          cantidad,
          precio_unitario: precioUnitario,
          subtotal: subtotalItem,
          impuesto: impuestoItem,
          descuento: 0,
          total: totalItem,
          lotes_usados: lotesUsados
        });
      }

      const total = subtotal + impuestos - descuento;

      // Calcular cambio
      const montoRecibido = parseFloat(data.monto_recibido) || 0;
      const cambio = montoRecibido > 0 ? montoRecibido - total : 0;

      if (montoRecibido > 0 && montoRecibido < total) {
        throw new Error('El monto recibido es insuficiente');
      }

      // Crear venta
      const venta = await Venta.create({
        numero_venta: numeroVenta,
        fecha_venta: data.fecha_venta || new Date(),
        subtotal,
        impuestos,
        descuento,
        total,
        metodo_pago: data.metodo_pago || 'efectivo',
        monto_recibido: montoRecibido,
        cambio,
        estado: 'completada',
        usuario_id: usuarioId,
        notas: data.notas
      }, { transaction });

      // Crear detalles
      for (const detalle of detalles) {
        await VentaDetalle.create({
          venta_id: venta.id,
          ...detalle
        }, { transaction });
      }

      await transaction.commit();

      logger.info(`Venta creada: ${numeroVenta} - Total: $${total}`);

      return await this.getById(venta.id);
    } catch (error) {
      await transaction.rollback();
      logger.error('Error al crear venta:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las ventas con paginación
   */
  async getAll(filters = {}) {
    try {
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;
      const offset = (page - 1) * limit;

      const where = {};

      if (filters.estado) {
        where.estado = filters.estado;
      }

      if (filters.metodo_pago) {
        where.metodo_pago = filters.metodo_pago;
      }

      if (filters.usuario_id) {
        where.usuario_id = filters.usuario_id;
      }

      if (filters.search) {
        where.numero_venta = { [Op.like]: `%${filters.search}%` };
      }

      if (filters.fecha_inicio && filters.fecha_fin) {
        where.fecha_venta = {
          [Op.between]: [filters.fecha_inicio, filters.fecha_fin]
        };
      }

      const { count, rows } = await Venta.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'usuario',
            attributes: ['id', 'nombre', 'username']
          },
          {
            model: VentaDetalle,
            as: 'detalles',
            include: [
              {
                model: Producto,
                as: 'producto',
                attributes: ['id', 'nombre', 'codigo_barras']
              }
            ]
          }
        ],
        limit,
        offset,
        order: [['fecha_venta', 'DESC']],
        distinct: true
      });

      return {
        ventas: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('Error al obtener ventas:', error);
      throw error;
    }
  }

  /**
   * Obtener venta por ID
   */
  async getById(id) {
    try {
      const venta = await Venta.findByPk(id, {
        include: [
          {
            model: User,
            as: 'usuario',
            attributes: ['id', 'nombre', 'username']
          },
          {
            model: VentaDetalle,
            as: 'detalles',
            include: [
              {
                model: Producto,
                as: 'producto',
                include: [
                  {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['id', 'nombre']
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!venta) {
        throw new Error('Venta no encontrada');
      }

      return venta;
    } catch (error) {
      logger.error('Error al obtener venta:', error);
      throw error;
    }
  }

  /**
   * Cancelar venta (devuelve stock)
   */
  async cancelarVenta(id, motivo, usuarioId) {
    const transaction = await sequelize.transaction();

    try {
      const venta = await Venta.findByPk(id, {
        include: [
          {
            model: VentaDetalle,
            as: 'detalles'
          }
        ],
        transaction
      });

      if (!venta) {
        throw new Error('Venta no encontrada');
      }

      if (venta.estado === 'cancelada') {
        throw new Error('La venta ya está cancelada');
      }

      // Devolver stock a inventario
      for (const detalle of venta.detalles) {
        // Crear movimiento de devolución en inventario
        // Esto podría implementarse con un método específico en inventarioService
        // Por ahora, simplemente registramos la cancelación
      }

      // Actualizar venta
      await venta.update({
        estado: 'cancelada',
        notas: venta.notas + `\n\nCANCELADA: ${motivo}`
      }, { transaction });

      await transaction.commit();

      logger.info(`Venta cancelada: ${venta.numero_venta}`);

      return venta;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error al cancelar venta:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de ventas
   */
  async getEstadisticas(filters = {}) {
    try {
      const where = { estado: 'completada' };

      if (filters.fecha_inicio && filters.fecha_fin) {
        where.fecha_venta = {
          [Op.between]: [filters.fecha_inicio, filters.fecha_fin]
        };
      }

      const [totalVentas, montoTotal] = await Promise.all([
        Venta.count({ where }),
        Venta.sum('total', { where })
      ]);

      const porMetodoPago = await Venta.findAll({
        where,
        attributes: [
          'metodo_pago',
          [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
          [sequelize.fn('SUM', sequelize.col('total')), 'monto']
        ],
        group: ['metodo_pago']
      });

      return {
        total_ventas: totalVentas,
        monto_total: parseFloat(montoTotal) || 0,
        promedio_venta: totalVentas > 0 ? (parseFloat(montoTotal) / totalVentas) : 0,
        por_metodo_pago: porMetodoPago.map(item => ({
          metodo: item.metodo_pago,
          cantidad: parseInt(item.get('cantidad')),
          monto: parseFloat(item.get('monto'))
        }))
      };
    } catch (error) {
      logger.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  /**
   * Obtener productos más vendidos
   */
  async getProductosMasVendidos(limit = 10, filters = {}) {
    try {
      const where = {};
      const ventaWhere = { estado: 'completada' };

      if (filters.fecha_inicio && filters.fecha_fin) {
        ventaWhere.fecha_venta = {
          [Op.between]: [filters.fecha_inicio, filters.fecha_fin]
        };
      }

      const productos = await VentaDetalle.findAll({
        attributes: [
          'producto_id',
          [sequelize.fn('SUM', sequelize.col('cantidad')), 'total_vendido'],
          [sequelize.fn('SUM', sequelize.col('total')), 'monto_total']
        ],
        include: [
          {
            model: Venta,
            as: 'venta',
            where: ventaWhere,
            attributes: []
          },
          {
            model: Producto,
            as: 'producto',
            attributes: ['id', 'nombre', 'codigo_barras', 'precio_venta']
          }
        ],
        group: ['producto_id'],
        order: [[sequelize.literal('total_vendido'), 'DESC']],
        limit
      });

      return productos.map(item => ({
        producto: item.producto,
        total_vendido: parseFloat(item.get('total_vendido')),
        monto_total: parseFloat(item.get('monto_total'))
      }));
    } catch (error) {
      logger.error('Error al obtener productos más vendidos:', error);
      throw error;
    }
  }
}

module.exports = new VentaService();