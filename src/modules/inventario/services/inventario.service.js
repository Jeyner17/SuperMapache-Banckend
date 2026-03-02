const { InventarioLote, MovimientoInventario } = require('../models');
const { Producto } = require('../../productos/models');
const { Categoria } = require('../../categorias/models');
const { Op } = require('sequelize');
const { sequelize } = require('../../../database/connection');
const logger = require('../../../shared/utils/logger');
const DateHelper = require('../../../shared/utils/date.helper');

class InventarioService {
  /**
   * Obtener stock total de un producto (suma de todos sus lotes)
   */
  async getStockProducto(productoId) {
    try {
      const lotes = await InventarioLote.findAll({
        where: {
          producto_id: productoId,
          estado: ['disponible', 'por_vencer']
        }
      });

      const stockTotal = lotes.reduce((sum, lote) => {
        return sum + parseFloat(lote.cantidad_actual);
      }, 0);

      return stockTotal;
    } catch (error) {
      logger.error('Error al obtener stock:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los lotes con filtros
   */
  async getAllLotes(filters = {}) {
    try {
      const where = {};
      const whereProducto = {};

      // Filtros
      if (filters.estado) {
        where.estado = filters.estado;
      }

      if (filters.producto_id) {
        where.producto_id = filters.producto_id;
      }

      if (filters.categoria_id) {
        whereProducto.categoria_id = filters.categoria_id;
      }

      if (filters.search) {
        whereProducto[Op.or] = [
          { nombre: { [Op.like]: `%${filters.search}%` } },
          { codigo_barras: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      // Solo lotes con stock disponible
      if (filters.solo_disponibles) {
        where.cantidad_actual = { [Op.gt]: 0 };
      }

      const lotes = await InventarioLote.findAll({
        where,
        include: [
          {
            model: Producto,
            as: 'producto',
            where: Object.keys(whereProducto).length > 0 ? whereProducto : undefined,
            include: [
              {
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre', 'color']
              }
            ]
          }
        ],
        order: [
          ['fecha_ingreso', 'ASC'], // FIFO: primero los más antiguos
          ['fecha_caducidad', 'ASC']
        ]
      });

      return lotes;
    } catch (error) {
      logger.error('Error al obtener lotes:', error);
      throw error;
    }
  }

  /**
   * Obtener resumen de inventario por producto
   */
  async getResumenInventario(filters = {}) {
    try {
      const whereProducto = { activo: true };

      if (filters.categoria_id) {
        whereProducto.categoria_id = filters.categoria_id;
      }

      if (filters.search) {
        whereProducto[Op.or] = [
          { nombre: { [Op.like]: `%${filters.search}%` } },
          { codigo_barras: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const productos = await Producto.findAll({
        where: whereProducto,
        include: [
          {
            model: Categoria,
            as: 'categoria',
            attributes: ['id', 'nombre', 'color']
          },
          {
            model: InventarioLote,
            as: 'lotes',
            where: {
              estado: ['disponible', 'por_vencer']
            },
            required: false
          }
        ],
        order: [['nombre', 'ASC']]
      });

      // Calcular stock total por producto
      const resumen = productos.map(producto => {
        const stockTotal = producto.lotes.reduce((sum, lote) => {
          return sum + parseFloat(lote.cantidad_actual);
        }, 0);

        // Determinar estado del stock
        let estadoStock = 'normal';
        if (stockTotal === 0) {
          estadoStock = 'agotado';
        } else if (stockTotal <= producto.stock_minimo) {
          estadoStock = 'bajo';
        } else if (stockTotal >= producto.stock_maximo) {
          estadoStock = 'exceso';
        }

        // Verificar si hay lotes por vencer
        const lotePorVencer = producto.lotes.some(lote => lote.estado === 'por_vencer');

        return {
          id: producto.id,
          nombre: producto.nombre,
          codigo_barras: producto.codigo_barras,
          categoria: producto.categoria,
          stock_actual: stockTotal,
          stock_minimo: producto.stock_minimo,
          stock_maximo: producto.stock_maximo,
          unidad_medida: producto.unidad_medida,
          estado_stock: estadoStock,
          tiene_lotes_por_vencer: lotePorVencer,
          cantidad_lotes: producto.lotes.length,
          precio_venta: producto.precio_venta,
          requiere_caducidad: producto.requiere_caducidad
        };
      });

      return resumen;
    } catch (error) {
      logger.error('Error al obtener resumen:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo lote (entrada de inventario)
   */
  async crearLote(data, usuarioId) {
    const transaction = await sequelize.transaction();

    try {
      // Validar que el producto existe
      const producto = await Producto.findByPk(data.producto_id);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      // Validar fecha de caducidad si el producto la requiere
      if (producto.requiere_caducidad && !data.fecha_caducidad) {
        throw new Error('Este producto requiere fecha de caducidad');
      }

      // Crear lote
      const lote = await InventarioLote.create({
        ...data,
        cantidad_actual: data.cantidad_inicial,
        estado: 'disponible'
      }, { transaction });

      // Registrar movimiento
      await MovimientoInventario.create({
        lote_id: lote.id,
        producto_id: data.producto_id,
        tipo_movimiento: 'entrada',
        cantidad: data.cantidad_inicial,
        cantidad_anterior: 0,
        cantidad_nueva: data.cantidad_inicial,
        motivo: data.motivo || 'Entrada de inventario',
        referencia_tipo: data.referencia_tipo || 'manual',
        referencia_id: data.referencia_id,
        usuario_id: usuarioId,
        notas: data.notas
      }, { transaction });

      await transaction.commit();

      logger.info(`Lote creado: ${lote.numero_lote} - Producto: ${producto.nombre}`);

      return await this.getLoteById(lote.id);
    } catch (error) {
      await transaction.rollback();
      logger.error('Error al crear lote:', error);
      throw error;
    }
  }

  /**
   * Descontar stock (FIFO automático)
   */
  async descontarStock(productoId, cantidad, usuarioId, motivo, referenciaData = {}) {
    const transaction = await sequelize.transaction();

    try {
      // Obtener lotes disponibles ordenados por FIFO
      const lotes = await InventarioLote.findAll({
        where: {
          producto_id: productoId,
          cantidad_actual: { [Op.gt]: 0 },
          estado: ['disponible', 'por_vencer']
        },
        order: [
          ['fecha_ingreso', 'ASC'],
          ['fecha_caducidad', 'ASC']
        ],
        transaction
      });

      if (lotes.length === 0) {
        throw new Error('No hay stock disponible');
      }

      // Calcular stock total
      const stockTotal = lotes.reduce((sum, lote) => sum + parseFloat(lote.cantidad_actual), 0);

      if (stockTotal < cantidad) {
        throw new Error(`Stock insuficiente. Disponible: ${stockTotal}, Solicitado: ${cantidad}`);
      }

      let cantidadRestante = cantidad;
      const movimientos = [];

      // Descontar de los lotes (FIFO)
      for (const lote of lotes) {
        if (cantidadRestante <= 0) break;

        const cantidadActual = parseFloat(lote.cantidad_actual);
        const cantidadADescontar = Math.min(cantidadActual, cantidadRestante);
        const nuevaCantidad = cantidadActual - cantidadADescontar;

        // Actualizar lote
        await lote.update({
          cantidad_actual: nuevaCantidad,
          estado: nuevaCantidad === 0 ? 'agotado' : lote.estado
        }, { transaction });

        // Registrar movimiento
        const movimiento = await MovimientoInventario.create({
          lote_id: lote.id,
          producto_id: productoId,
          tipo_movimiento: 'salida',
          cantidad: cantidadADescontar,
          cantidad_anterior: cantidadActual,
          cantidad_nueva: nuevaCantidad,
          motivo,
          referencia_tipo: referenciaData.tipo,
          referencia_id: referenciaData.id,
          usuario_id: usuarioId
        }, { transaction });

        movimientos.push(movimiento);
        cantidadRestante -= cantidadADescontar;
      }

      await transaction.commit();

      logger.info(`Stock descontado: Producto ${productoId}, Cantidad: ${cantidad}`);

      return movimientos;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error al descontar stock:', error);
      throw error;
    }
  }

  /**
   * Ajustar stock de un lote
   */
  async ajustarStock(loteId, nuevaCantidad, usuarioId, motivo, notas) {
    const transaction = await sequelize.transaction();

    try {
      const lote = await InventarioLote.findByPk(loteId, { transaction });

      if (!lote) {
        throw new Error('Lote no encontrado');
      }

      const cantidadAnterior = parseFloat(lote.cantidad_actual);
      const diferencia = nuevaCantidad - cantidadAnterior;
      const tipoMovimiento = diferencia > 0 ? 'entrada' : diferencia < 0 ? 'salida' : 'ajuste';

      // Actualizar lote
      await lote.update({
        cantidad_actual: nuevaCantidad,
        estado: nuevaCantidad === 0 ? 'agotado' : 'disponible'
      }, { transaction });

      // Registrar movimiento
      await MovimientoInventario.create({
        lote_id: loteId,
        producto_id: lote.producto_id,
        tipo_movimiento: tipoMovimiento,
        cantidad: Math.abs(diferencia),
        cantidad_anterior: cantidadAnterior,
        cantidad_nueva: nuevaCantidad,
        motivo: motivo || 'Ajuste de inventario',
        referencia_tipo: 'ajuste',
        usuario_id: usuarioId,
        notas
      }, { transaction });

      await transaction.commit();

      logger.info(`Stock ajustado: Lote ${loteId}, Nueva cantidad: ${nuevaCantidad}`);

      return await this.getLoteById(loteId);
    } catch (error) {
      await transaction.rollback();
      logger.error('Error al ajustar stock:', error);
      throw error;
    }
  }

  /**
   * Obtener lote por ID
   */
  async getLoteById(id) {
    try {
      const lote = await InventarioLote.findByPk(id, {
        include: [
          {
            model: Producto,
            as: 'producto',
            include: [
              {
                model: Categoria,
                as: 'categoria'
              }
            ]
          },
          {
            model: MovimientoInventario,
            as: 'movimientos',
            limit: 10,
            order: [['created_at', 'DESC']],
            include: [
              {
                model: Producto,
                as: 'producto',
                attributes: ['id', 'nombre']
              }
            ]
          }
        ]
      });

      if (!lote) {
        throw new Error('Lote no encontrado');
      }

      return lote;
    } catch (error) {
      logger.error('Error al obtener lote:', error);
      throw error;
    }
  }

  /**
   * Obtener movimientos de inventario con filtros
   */
  async getMovimientos(filters = {}) {
    try {
      const where = {};

      if (filters.producto_id) {
        where.producto_id = filters.producto_id;
      }

      if (filters.lote_id) {
        where.lote_id = filters.lote_id;
      }

      if (filters.tipo_movimiento) {
        where.tipo_movimiento = filters.tipo_movimiento;
      }

      if (filters.fecha_inicio && filters.fecha_fin) {
        where.created_at = {
          [Op.between]: [filters.fecha_inicio, filters.fecha_fin]
        };
      }

      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const offset = (page - 1) * limit;

      const { count, rows } = await MovimientoInventario.findAndCountAll({
        where,
        include: [
          {
            model: Producto,
            as: 'producto',
            attributes: ['id', 'nombre', 'codigo_barras']
          },
          {
            model: InventarioLote,
            as: 'lote',
            attributes: ['id', 'numero_lote']
          }
        ],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      return {
        movimientos: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('Error al obtener movimientos:', error);
      throw error;
    }
  }

  /**
   * Verificar y actualizar estados de lotes (cron job)
   */
  async verificarEstadosLotes() {
    try {
      const lotes = await InventarioLote.findAll({
        where: {
          estado: ['disponible', 'por_vencer'],
          fecha_caducidad: { [Op.ne]: null }
        },
        include: [
          {
            model: Producto,
            as: 'producto',
            attributes: ['id', 'nombre', 'dias_alerta_caducidad']
          }
        ]
      });

      const ahora = new Date();
      const lotesActualizados = [];

      for (const lote of lotes) {
        const diasParaCaducar = DateHelper.daysBetween(ahora, lote.fecha_caducidad);
        const diasAlerta = lote.producto.dias_alerta_caducidad || 21;

        let nuevoEstado = lote.estado;

        // Vencido
        if (ahora > new Date(lote.fecha_caducidad)) {
          nuevoEstado = 'vencido';
        }
        // Por vencer
        else if (diasParaCaducar <= diasAlerta) {
          nuevoEstado = 'por_vencer';
        }
        // Disponible
        else {
          nuevoEstado = 'disponible';
        }

        if (nuevoEstado !== lote.estado) {
          await lote.update({ estado: nuevoEstado });
          lotesActualizados.push({
            lote_id: lote.id,
            producto: lote.producto.nombre,
            estado_anterior: lote.estado,
            estado_nuevo: nuevoEstado,
            dias_para_caducar: diasParaCaducar
          });
        }
      }

      logger.info(`Verificación de lotes completada. ${lotesActualizados.length} lotes actualizados`);

      return lotesActualizados;
    } catch (error) {
      logger.error('Error al verificar estados:', error);
      throw error;
    }
  }

  /**
   * Obtener alertas de inventario
   */
  async getAlertas() {
    try {
      const alertas = {
        stock_bajo: [],
        por_vencer: [],
        vencidos: [],
        agotados: []
      };

      // Productos con stock bajo
      const resumen = await this.getResumenInventario();
      alertas.stock_bajo = resumen.filter(p => p.estado_stock === 'bajo');
      alertas.agotados = resumen.filter(p => p.estado_stock === 'agotado');

      // Lotes por vencer
      const lotesPorVencer = await InventarioLote.findAll({
        where: { estado: 'por_vencer' },
        include: [
          {
            model: Producto,
            as: 'producto'
          }
        ],
        order: [['fecha_caducidad', 'ASC']]
      });
      alertas.por_vencer = lotesPorVencer;

      // Lotes vencidos
      const lotesVencidos = await InventarioLote.findAll({
        where: { estado: 'vencido' },
        include: [
          {
            model: Producto,
            as: 'producto'
          }
        ],
        order: [['fecha_caducidad', 'ASC']]
      });
      alertas.vencidos = lotesVencidos;

      return alertas;
    } catch (error) {
      logger.error('Error al obtener alertas:', error);
      throw error;
    }
  }
}

module.exports = new InventarioService();