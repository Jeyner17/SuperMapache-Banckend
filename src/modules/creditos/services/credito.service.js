const { ClienteCredito, Credito, PagoCredito } = require('../models');
const { User } = require('../../auth/models');
const cajaService = require('../../caja/services/caja.service');
const { Op } = require('sequelize');
const { sequelize } = require('../../../database/connection');
const logger = require('../../../shared/utils/logger');

class CreditoService {
  /**
   * Generar número de crédito usando ORM
   */
  async generarNumeroCredito(transaction) {
    const year = new Date().getFullYear();
    const prefix = `CRED-${year}-`;

    const creditos = await Credito.findAll({
      where: { numero_credito: { [Op.like]: `${prefix}%` } },
      attributes: ['numero_credito'],
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    let maxNumero = 0;
    for (const c of creditos) {
      const partes = c.numero_credito.split('-');
      const num = parseInt(partes[partes.length - 1], 10);
      if (!isNaN(num) && num > maxNumero) maxNumero = num;
    }

    return `${prefix}${(maxNumero + 1).toString().padStart(6, '0')}`;
  }

  // ─── CLIENTES ────────────────────────────────────────────────────────────────

  async getClientes(filters = {}) {
    try {
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const offset = (page - 1) * limit;

      const where = {};

      if (filters.activo !== undefined) {
        where.activo = ['true', '1', true, 1].includes(filters.activo);
      }

      if (filters.search) {
        where[Op.or] = [
          { nombre: { [Op.like]: `%${filters.search}%` } },
          { cedula: { [Op.like]: `%${filters.search}%` } },
          { telefono: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const { count, rows } = await ClienteCredito.findAndCountAll({
        where,
        limit,
        offset,
        order: [['nombre', 'ASC']],
        distinct: true
      });

      return {
        clientes: rows,
        pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) }
      };
    } catch (error) {
      logger.error('Error al obtener clientes:', error);
      throw error;
    }
  }

  async getClienteById(id) {
    try {
      const cliente = await ClienteCredito.findByPk(id, {
        include: [
          {
            model: Credito,
            as: 'creditos',
            include: [
              { model: User, as: 'usuario', attributes: ['id', 'nombre', 'username'] }
            ],
            order: [['fecha_credito', 'DESC']]
          }
        ]
      });

      if (!cliente) throw new Error('Cliente no encontrado');

      return cliente;
    } catch (error) {
      logger.error('Error al obtener cliente:', error);
      throw error;
    }
  }

  async crearCliente(data) {
    try {
      // Verificar cédula única si se proporciona
      if (data.cedula) {
        const existente = await ClienteCredito.findOne({ where: { cedula: data.cedula } });
        if (existente) throw new Error(`Ya existe un cliente con la cédula ${data.cedula}`);
      }

      const cliente = await ClienteCredito.create({
        nombre: data.nombre,
        cedula: data.cedula || null,
        telefono: data.telefono || null,
        email: data.email || null,
        direccion: data.direccion || null,
        limite_credito: parseFloat(data.limite_credito) || 0,
        activo: true,
        notas: data.notas || null
      });

      logger.info(`Cliente de crédito creado: ${cliente.nombre}`);
      return cliente;
    } catch (error) {
      logger.error('Error al crear cliente:', error);
      throw error;
    }
  }

  async actualizarCliente(id, data) {
    try {
      const cliente = await ClienteCredito.findByPk(id);
      if (!cliente) throw new Error('Cliente no encontrado');

      if (data.cedula && data.cedula !== cliente.cedula) {
        const existente = await ClienteCredito.findOne({ where: { cedula: data.cedula } });
        if (existente) throw new Error(`Ya existe un cliente con la cédula ${data.cedula}`);
      }

      await cliente.update({
        nombre: data.nombre ?? cliente.nombre,
        cedula: data.cedula ?? cliente.cedula,
        telefono: data.telefono ?? cliente.telefono,
        email: data.email ?? cliente.email,
        direccion: data.direccion ?? cliente.direccion,
        limite_credito: data.limite_credito !== undefined ? parseFloat(data.limite_credito) : cliente.limite_credito,
        activo: data.activo !== undefined ? data.activo : cliente.activo,
        notas: data.notas ?? cliente.notas
      });

      return cliente;
    } catch (error) {
      logger.error('Error al actualizar cliente:', error);
      throw error;
    }
  }

  // ─── CRÉDITOS ────────────────────────────────────────────────────────────────

  async getCreditos(filters = {}) {
    try {
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;
      const offset = (page - 1) * limit;

      const where = {};

      if (filters.estado) where.estado = filters.estado;
      if (filters.cliente_id) where.cliente_id = filters.cliente_id;

      if (filters.vencidos === 'true' || filters.vencidos === true) {
        where.fecha_vencimiento = { [Op.lt]: new Date() };
        where.estado = { [Op.in]: ['pendiente', 'parcial'] };
      }

      if (filters.search) {
        where[Op.or] = [
          { numero_credito: { [Op.like]: `%${filters.search}%` } },
          { '$cliente.nombre$': { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const { count, rows } = await Credito.findAndCountAll({
        where,
        include: [
          { model: ClienteCredito, as: 'cliente' },
          { model: User, as: 'usuario', attributes: ['id', 'nombre', 'username'] }
        ],
        limit,
        offset,
        order: [['fecha_vencimiento', 'ASC']],
        distinct: true
      });

      return {
        creditos: rows,
        pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) }
      };
    } catch (error) {
      logger.error('Error al obtener créditos:', error);
      throw error;
    }
  }

  async getCreditoById(id) {
    try {
      const credito = await Credito.findByPk(id, {
        include: [
          { model: ClienteCredito, as: 'cliente' },
          { model: User, as: 'usuario', attributes: ['id', 'nombre', 'username'] },
          {
            model: PagoCredito,
            as: 'pagos',
            include: [
              { model: User, as: 'usuario', attributes: ['id', 'nombre', 'username'] }
            ],
            order: [['fecha_pago', 'DESC']]
          }
        ]
      });

      if (!credito) throw new Error('Crédito no encontrado');

      return credito;
    } catch (error) {
      logger.error('Error al obtener crédito:', error);
      throw error;
    }
  }

  /**
   * Crear crédito manualmente (desde el módulo de créditos)
   */
  async crearCredito(data, usuarioId) {
    const transaction = await sequelize.transaction();

    try {
      const cliente = await ClienteCredito.findByPk(data.cliente_id, { transaction });
      if (!cliente) throw new Error('Cliente no encontrado');
      if (!cliente.activo) throw new Error('El cliente está inactivo');

      const monto = parseFloat(data.monto_total);
      if (isNaN(monto) || monto <= 0) throw new Error('El monto debe ser mayor a 0');

      // Verificar límite de crédito
      if (parseFloat(cliente.limite_credito) > 0) {
        const saldoActual = parseFloat(cliente.saldo_pendiente);
        if (saldoActual + monto > parseFloat(cliente.limite_credito)) {
          throw new Error(`Excede el límite de crédito del cliente ($${cliente.limite_credito})`);
        }
      }

      const diasPlazo = parseInt(data.dias_plazo) || 30;
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + diasPlazo);

      const numeroCredito = await this.generarNumeroCredito(transaction);

      const credito = await Credito.create({
        numero_credito: numeroCredito,
        cliente_id: data.cliente_id,
        venta_id: data.venta_id || null,
        usuario_id: usuarioId,
        monto_total: monto,
        monto_pagado: 0,
        saldo_pendiente: monto,
        fecha_credito: new Date(),
        fecha_vencimiento: fechaVencimiento,
        dias_plazo: diasPlazo,
        estado: 'pendiente',
        notas: data.notas || null
      }, { transaction });

      // Actualizar saldo del cliente
      await cliente.update(
        { saldo_pendiente: parseFloat(cliente.saldo_pendiente) + monto },
        { transaction }
      );

      await transaction.commit();

      logger.info(`Crédito creado: ${numeroCredito} - Cliente: ${cliente.nombre} - Monto: $${monto}`);

      return await this.getCreditoById(credito.id);
    } catch (error) {
      await transaction.rollback();
      logger.error('Error al crear crédito:', error);
      throw error;
    }
  }

  /**
   * Crear crédito automáticamente desde venta (llamado por venta.service)
   */
  async crearCreditoDesdeVenta(ventaData, clienteId, diasPlazo, usuarioId) {
    const transaction = await sequelize.transaction();

    try {
      const cliente = await ClienteCredito.findByPk(clienteId, { transaction });
      if (!cliente) throw new Error('Cliente no encontrado');

      const monto = parseFloat(ventaData.total);
      const diasCredito = parseInt(diasPlazo) || 30;
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + diasCredito);

      const numeroCredito = await this.generarNumeroCredito(transaction);

      const credito = await Credito.create({
        numero_credito: numeroCredito,
        cliente_id: clienteId,
        venta_id: ventaData.id,
        usuario_id: usuarioId,
        monto_total: monto,
        monto_pagado: 0,
        saldo_pendiente: monto,
        fecha_credito: new Date(),
        fecha_vencimiento: fechaVencimiento,
        dias_plazo: diasCredito,
        estado: 'pendiente',
        notas: `Venta: ${ventaData.numero_venta}`
      }, { transaction });

      // Actualizar saldo del cliente
      await cliente.update(
        { saldo_pendiente: parseFloat(cliente.saldo_pendiente) + monto },
        { transaction }
      );

      await transaction.commit();

      logger.info(`Crédito auto-creado desde venta ${ventaData.numero_venta}: ${numeroCredito}`);

      return credito;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error al crear crédito desde venta:', error);
      throw error;
    }
  }

  /**
   * Registrar abono a un crédito
   */
  async registrarPago(creditoId, data, usuarioId) {
    const transaction = await sequelize.transaction();

    try {
      const credito = await Credito.findByPk(creditoId, {
        include: [{ model: ClienteCredito, as: 'cliente' }],
        transaction
      });

      if (!credito) throw new Error('Crédito no encontrado');
      if (credito.estado === 'pagado') throw new Error('Este crédito ya está completamente pagado');

      const monto = parseFloat(data.monto);
      if (isNaN(monto) || monto <= 0) throw new Error('El monto debe ser mayor a 0');

      const saldoActual = parseFloat(credito.saldo_pendiente);
      if (monto > saldoActual) {
        throw new Error(`El monto excede el saldo pendiente ($${saldoActual.toFixed(2)})`);
      }

      // Registrar pago
      const pago = await PagoCredito.create({
        credito_id: creditoId,
        usuario_id: usuarioId,
        monto,
        fecha_pago: data.fecha_pago || new Date(),
        metodo_pago: data.metodo_pago || 'efectivo',
        notas: data.notas || null
      }, { transaction });

      // Actualizar saldos del crédito
      const nuevoMontoPagado = parseFloat(credito.monto_pagado) + monto;
      const nuevoSaldo = parseFloat(credito.monto_total) - nuevoMontoPagado;
      const nuevoEstado = nuevoSaldo <= 0 ? 'pagado' : 'parcial';

      await credito.update({
        monto_pagado: nuevoMontoPagado,
        saldo_pendiente: nuevoSaldo,
        estado: nuevoEstado
      }, { transaction });

      // Actualizar saldo del cliente
      const nuevoSaldoCliente = parseFloat(credito.cliente.saldo_pendiente) - monto;
      await credito.cliente.update(
        { saldo_pendiente: Math.max(0, nuevoSaldoCliente) },
        { transaction }
      );

      await transaction.commit();

      // Registrar en caja si hay turno abierto (best-effort)
      await cajaService.registrarMovimientoVenta({
        id: pago.id,
        numero_venta: `PAGO-CRED-${credito.numero_credito}`,
        total: monto,
        metodo_pago: data.metodo_pago || 'efectivo'
      }, usuarioId);

      logger.info(`Pago registrado en crédito ${credito.numero_credito}: $${monto} - Estado: ${nuevoEstado}`);

      return await this.getCreditoById(creditoId);
    } catch (error) {
      await transaction.rollback();
      logger.error('Error al registrar pago:', error);
      throw error;
    }
  }

  /**
   * Marcar créditos vencidos (llamado por cron job)
   */
  async actualizarVencidos() {
    try {
      const [cantidad] = await Credito.update(
        { estado: 'vencido' },
        {
          where: {
            estado: { [Op.in]: ['pendiente', 'parcial'] },
            fecha_vencimiento: { [Op.lt]: new Date() }
          }
        }
      );

      if (cantidad > 0) {
        logger.info(`${cantidad} créditos marcados como vencidos`);
      }

      return cantidad;
    } catch (error) {
      logger.error('Error al actualizar vencidos:', error);
      throw error;
    }
  }

  /**
   * Créditos para generación de alertas (llamado por alerta.service)
   */
  async getCreditosParaAlertas() {
    try {
      const ahora = new Date();
      const en7Dias = new Date(Date.now() + 7 * 86400000);

      const [porVencer, vencidos] = await Promise.all([
        Credito.findAll({
          where: {
            estado: { [Op.in]: ['pendiente', 'parcial'] },
            fecha_vencimiento: { [Op.between]: [ahora, en7Dias] }
          },
          include: [{ model: ClienteCredito, as: 'cliente', attributes: ['id', 'nombre'] }]
        }),
        Credito.findAll({
          where: {
            estado: { [Op.in]: ['pendiente', 'parcial'] },
            fecha_vencimiento: { [Op.lt]: ahora }
          },
          include: [{ model: ClienteCredito, as: 'cliente', attributes: ['id', 'nombre'] }]
        })
      ]);

      return { por_vencer: porVencer, vencidos };
    } catch (error) {
      logger.error('Error al obtener créditos para alertas:', error);
      throw error;
    }
  }

  /**
   * Resumen de cartera para dashboard
   */
  async getResumen() {
    try {
      const [totalPendiente, totalVencido, totalClientes] = await Promise.all([
        Credito.sum('saldo_pendiente', {
          where: { estado: { [Op.in]: ['pendiente', 'parcial'] } }
        }),
        Credito.sum('saldo_pendiente', { where: { estado: 'vencido' } }),
        ClienteCredito.count({ where: { activo: true } })
      ]);

      const creditosPorEstado = await Credito.findAll({
        attributes: [
          'estado',
          [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
          [sequelize.fn('SUM', sequelize.col('saldo_pendiente')), 'total']
        ],
        group: ['estado']
      });

      return {
        total_pendiente: totalPendiente || 0,
        total_vencido: totalVencido || 0,
        total_clientes_activos: totalClientes,
        por_estado: creditosPorEstado
      };
    } catch (error) {
      logger.error('Error al obtener resumen:', error);
      throw error;
    }
  }
}

module.exports = new CreditoService();
