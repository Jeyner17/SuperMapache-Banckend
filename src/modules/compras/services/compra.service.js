const { Compra, CompraDetalle } = require('../models');
const { Proveedor } = require('../../proveedores/models');
const { Producto } = require('../../productos/models');
const { User } = require('../../auth/models');
const inventarioService = require('../../inventario/services/inventario.service');
const { Op } = require('sequelize');
const { sequelize } = require('../../../database/connection');
const logger = require('../../../shared/utils/logger');

class CompraService {
  /**
   * Generar número de compra
   */
  async generarNumeroCompra() {
    const year = new Date().getFullYear();
    const prefix = `COMP-${year}-`;
    
    const ultimaCompra = await Compra.findOne({
      where: {
        numero_compra: {
          [Op.like]: `${prefix}%`
        }
      },
      order: [['numero_compra', 'DESC']]
    });

    let numero = 1;
    if (ultimaCompra) {
      const ultimoNumero = parseInt(ultimaCompra.numero_compra.split('-')[2]);
      numero = ultimoNumero + 1;
    }

    return `${prefix}${numero.toString().padStart(6, '0')}`;
  }

  /**
   * Obtener todas las compras con paginación
   */
  async getAll(filters = {}) {
    try {
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;
      const offset = (page - 1) * limit;

      const where = {};

      // Filtros
      if (filters.estado) {
        where.estado = filters.estado;
      }

      if (filters.proveedor_id) {
        where.proveedor_id = filters.proveedor_id;
      }

      if (filters.estado_pago) {
        where.estado_pago = filters.estado_pago;
      }

      if (filters.search) {
        where[Op.or] = [
          { numero_compra: { [Op.like]: `%${filters.search}%` } },
          { numero_factura: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      if (filters.fecha_inicio && filters.fecha_fin) {
        where.fecha_compra = {
          [Op.between]: [filters.fecha_inicio, filters.fecha_fin]
        };
      }

      const { count, rows } = await Compra.findAndCountAll({
        where,
        include: [
          {
            model: Proveedor,
            as: 'proveedor',
            attributes: ['id', 'razon_social', 'nombre_comercial']
          },
          {
            model: User,
            as: 'usuario',
            attributes: ['id', 'nombre', 'username']
          }
        ],
        limit,
        offset,
        order: [['fecha_compra', 'DESC']],
        distinct: true
      });

      return {
        compras: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('Error al obtener compras:', error);
      throw error;
    }
  }

  /**
   * Obtener compra por ID
   */
  async getById(id) {
    try {
      const compra = await Compra.findByPk(id, {
        include: [
          {
            model: Proveedor,
            as: 'proveedor'
          },
          {
            model: User,
            as: 'usuario',
            attributes: ['id', 'nombre', 'username']
          },
          {
            model: CompraDetalle,
            as: 'detalles',
            include: [
              {
                model: Producto,
                as: 'producto',
                attributes: ['id', 'nombre', 'codigo_barras', 'unidad_medida']
              }
            ]
          }
        ]
      });

      if (!compra) {
        throw new Error('Compra no encontrada');
      }

      return compra;
    } catch (error) {
      logger.error('Error al obtener compra:', error);
      throw error;
    }
  }

  /**
   * Crear nueva compra
   */
  async create(data, usuarioId) {
    const transaction = await sequelize.transaction();

    try {
      // Validar que el proveedor existe
      const proveedor = await Proveedor.findByPk(data.proveedor_id);
      if (!proveedor) {
        throw new Error('Proveedor no encontrado');
      }

      // Validar que hay productos
      if (!data.productos || data.productos.length === 0) {
        throw new Error('Debe agregar al menos un producto');
      }

      // Generar número de compra
      const numeroCompra = await this.generarNumeroCompra();

      // Calcular totales
      let subtotal = 0;
      let impuestos = 0;
      const descuento = parseFloat(data.descuento) || 0;

      const detalles = [];

      for (const item of data.productos) {
        const producto = await Producto.findByPk(item.producto_id);
        if (!producto) {
          throw new Error(`Producto con ID ${item.producto_id} no encontrado`);
        }

        const cantidad = parseFloat(item.cantidad);
        const precioUnitario = parseFloat(item.precio_unitario);
        const subtotalItem = cantidad * precioUnitario;
        const impuestoItem = subtotalItem * 0.12; // IVA 12%
        const totalItem = subtotalItem + impuestoItem;

        subtotal += subtotalItem;
        impuestos += impuestoItem;

        detalles.push({
          producto_id: item.producto_id,
          cantidad_pedida: cantidad,
          cantidad_recibida: 0,
          precio_unitario: precioUnitario,
          subtotal: subtotalItem,
          impuesto: impuestoItem,
          descuento: 0,
          total: totalItem,
          numero_lote_proveedor: item.numero_lote_proveedor,
          fecha_caducidad: item.fecha_caducidad
        });
      }

      const total = subtotal + impuestos - descuento;

      // Calcular fecha de vencimiento si es a crédito
      let fechaVencimiento = null;
      if (data.tipo_pago === 'credito') {
        const diasCredito = data.dias_credito || proveedor.dias_credito || 0;
        fechaVencimiento = new Date();
        fechaVencimiento.setDate(fechaVencimiento.getDate() + diasCredito);
      }

      // Crear compra
      const compra = await Compra.create({
        numero_compra: numeroCompra,
        proveedor_id: data.proveedor_id,
        fecha_compra: data.fecha_compra || new Date(),
        fecha_entrega_estimada: data.fecha_entrega_estimada,
        numero_factura: data.numero_factura,
        subtotal,
        impuestos,
        descuento,
        total,
        estado: 'pendiente',
        tipo_pago: data.tipo_pago || 'contado',
        dias_credito: data.dias_credito || 0,
        fecha_vencimiento_pago: fechaVencimiento,
        estado_pago: data.tipo_pago === 'credito' ? 'pendiente' : 'pagado',
        monto_pagado: data.tipo_pago === 'contado' ? total : 0,
        usuario_id: usuarioId,
        notas: data.notas
      }, { transaction });

      // Crear detalles
      for (const detalle of detalles) {
        await CompraDetalle.create({
          compra_id: compra.id,
          ...detalle
        }, { transaction });
      }

      await transaction.commit();

      logger.info(`Compra creada: ${numeroCompra}`);

      return await this.getById(compra.id);
    } catch (error) {
      await transaction.rollback();
      logger.error('Error al crear compra:', error);
      throw error;
    }
  }

  /**
   * Recibir compra (crear lotes en inventario)
   */
  async recibirCompra(id, datosRecepcion, usuarioId) {
    const transaction = await sequelize.transaction();

    try {
      const compra = await Compra.findByPk(id, {
        include: [
          {
            model: CompraDetalle,
            as: 'detalles',
            include: [
              {
                model: Producto,
                as: 'producto'
              }
            ]
          }
        ],
        transaction
      });

      if (!compra) {
        throw new Error('Compra no encontrada');
      }

      if (compra.estado === 'recibida') {
        throw new Error('Esta compra ya fue recibida');
      }

      if (compra.estado === 'cancelada') {
        throw new Error('No se puede recibir una compra cancelada');
      }

      let totalRecibido = 0;
      let totalPedido = 0;

      // Procesar cada producto recibido
      for (const item of datosRecepcion.productos) {
        const detalle = compra.detalles.find(d => d.id === item.detalle_id);
        
        if (!detalle) {
          throw new Error(`Detalle ${item.detalle_id} no encontrado`);
        }

        const cantidadRecibida = parseFloat(item.cantidad_recibida);
        
        if (cantidadRecibida < 0) {
          throw new Error('La cantidad recibida no puede ser negativa');
        }

        if (cantidadRecibida > parseFloat(detalle.cantidad_pedida)) {
          throw new Error(`La cantidad recibida no puede ser mayor a la pedida`);
        }

        // Crear lote en inventario si se recibió cantidad
        if (cantidadRecibida > 0) {
          const numeroLote = item.numero_lote_proveedor || detalle.numero_lote_proveedor || 
                            `${compra.numero_compra}-${detalle.producto_id}`;

          const lote = await inventarioService.crearLote({
            producto_id: detalle.producto_id,
            numero_lote: numeroLote,
            cantidad_inicial: cantidadRecibida,
            fecha_ingreso: datosRecepcion.fecha_recepcion || new Date(),
            fecha_caducidad: item.fecha_caducidad || detalle.fecha_caducidad,
            proveedor_id: compra.proveedor_id,
            ubicacion: item.ubicacion,
            notas: `Compra: ${compra.numero_compra}`,
            motivo: `Compra a proveedor - ${compra.numero_compra}`,
            referencia_tipo: 'compra',
            referencia_id: compra.id
          }, usuarioId);

          // Actualizar detalle con lote generado
          await detalle.update({
            cantidad_recibida: cantidadRecibida,
            lote_generado_id: lote.id,
            numero_lote_proveedor: numeroLote,
            fecha_caducidad: item.fecha_caducidad || detalle.fecha_caducidad
          }, { transaction });
        }

        totalRecibido += cantidadRecibida;
        totalPedido += parseFloat(detalle.cantidad_pedida);
      }

      // Determinar estado de la compra
      let nuevoEstado = 'recibida';
      if (totalRecibido === 0) {
        nuevoEstado = 'pendiente';
      } else if (totalRecibido < totalPedido) {
        nuevoEstado = 'parcial';
      }

      // Actualizar compra
      await compra.update({
        estado: nuevoEstado,
        fecha_entrega_real: datosRecepcion.fecha_recepcion || new Date(),
        notas: compra.notas + (datosRecepcion.notas ? `\n\nRecepción: ${datosRecepcion.notas}` : '')
      }, { transaction });

      await transaction.commit();

      logger.info(`Compra recibida: ${compra.numero_compra} - Estado: ${nuevoEstado}`);

      return await this.getById(id);
    } catch (error) {
      await transaction.rollback();
      logger.error('Error al recibir compra:', error);
      throw error;
    }
  }

  /**
   * Cancelar compra
   */
  async cancelar(id, motivo, usuarioId) {
    try {
      const compra = await Compra.findByPk(id);

      if (!compra) {
        throw new Error('Compra no encontrada');
      }

      if (compra.estado === 'recibida') {
        throw new Error('No se puede cancelar una compra ya recibida');
      }

      await compra.update({
        estado: 'cancelada',
        notas: compra.notas + `\n\nCANCELADA: ${motivo}`
      });

      logger.info(`Compra cancelada: ${compra.numero_compra}`);

      return compra;
    } catch (error) {
      logger.error('Error al cancelar compra:', error);
      throw error;
    }
  }

  /**
   * Registrar pago
   */
  async registrarPago(id, montoPago, usuarioId) {
    try {
      const compra = await Compra.findByPk(id);

      if (!compra) {
        throw new Error('Compra no encontrada');
      }

      if (compra.estado === 'cancelada') {
        throw new Error('No se puede registrar pago en una compra cancelada');
      }

      const nuevoMontoPagado = parseFloat(compra.monto_pagado) + parseFloat(montoPago);
      const total = parseFloat(compra.total);

      let estadoPago = 'pendiente';
      if (nuevoMontoPagado >= total) {
        estadoPago = 'pagado';
      } else if (nuevoMontoPagado > 0) {
        estadoPago = 'parcial';
      }

      await compra.update({
        monto_pagado: nuevoMontoPagado,
        estado_pago: estadoPago
      });

      logger.info(`Pago registrado en compra ${compra.numero_compra}: $${montoPago}`);

      return compra;
    } catch (error) {
      logger.error('Error al registrar pago:', error);
      throw error;
    }
  }

  /**
   * Obtener resumen de compras
   */
  async getResumen(filters = {}) {
    try {
      const where = {};

      if (filters.fecha_inicio && filters.fecha_fin) {
        where.fecha_compra = {
          [Op.between]: [filters.fecha_inicio, filters.fecha_fin]
        };
      }

      const compras = await Compra.findAll({
        where,
        attributes: [
          'estado',
          'estado_pago',
          [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
          [sequelize.fn('SUM', sequelize.col('total')), 'monto_total']
        ],
        group: ['estado', 'estado_pago']
      });

      return compras;
    } catch (error) {
      logger.error('Error al obtener resumen:', error);
      throw error;
    }
  }
}

module.exports = new CompraService();