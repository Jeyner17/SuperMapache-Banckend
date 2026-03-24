const { TurnoCaja, MovimientoCaja } = require('../models');
const { User } = require('../../auth/models');
const { Op } = require('sequelize');
const { sequelize } = require('../../../database/connection');
const logger = require('../../../shared/utils/logger');

class CajaService {
  /**
   * Generar número de turno usando ORM (sin SQL directo)
   */
  async generarNumeroTurno(transaction) {
    const year = new Date().getFullYear();
    const prefix = `CAJA-${year}-`;

    const turnos = await TurnoCaja.findAll({
      where: { numero_turno: { [Op.like]: `${prefix}%` } },
      attributes: ['numero_turno'],
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    let maxNumero = 0;
    for (const t of turnos) {
      const partes = t.numero_turno.split('-');
      const num = parseInt(partes[partes.length - 1], 10);
      if (!isNaN(num) && num > maxNumero) maxNumero = num;
    }

    return `${prefix}${(maxNumero + 1).toString().padStart(6, '0')}`;
  }

  /**
   * Obtener turno activo del usuario
   */
  async getTurnoActivo(usuarioId) {
    try {
      const turno = await TurnoCaja.findOne({
        where: { usuario_id: usuarioId, estado: 'abierta' },
        include: [
          { model: User, as: 'usuario', attributes: ['id', 'nombre', 'username'] }
        ],
        order: [['fecha_apertura', 'DESC']]
      });

      return turno;
    } catch (error) {
      logger.error('Error al obtener turno activo:', error);
      throw error;
    }
  }

  /**
   * Obtener cualquier turno abierto (para validaciones)
   */
  async getTurnoAbiertoGeneral() {
    try {
      return await TurnoCaja.findOne({
        where: { estado: 'abierta' },
        order: [['fecha_apertura', 'DESC']]
      });
    } catch (error) {
      logger.error('Error al buscar turno abierto:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los turnos con paginación
   */
  async getTurnos(filters = {}) {
    try {
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;
      const offset = (page - 1) * limit;

      const where = {};

      if (filters.estado) {
        where.estado = filters.estado;
      }

      if (filters.usuario_id) {
        where.usuario_id = filters.usuario_id;
      }

      if (filters.fecha_inicio && filters.fecha_fin) {
        where.fecha_apertura = {
          [Op.between]: [filters.fecha_inicio, filters.fecha_fin]
        };
      }

      const { count, rows } = await TurnoCaja.findAndCountAll({
        where,
        include: [
          { model: User, as: 'usuario', attributes: ['id', 'nombre', 'username'] }
        ],
        limit,
        offset,
        order: [['fecha_apertura', 'DESC']],
        distinct: true
      });

      return {
        turnos: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('Error al obtener turnos:', error);
      throw error;
    }
  }

  /**
   * Obtener turno por ID con sus movimientos
   */
  async getTurnoById(id) {
    try {
      const turno = await TurnoCaja.findByPk(id, {
        include: [
          { model: User, as: 'usuario', attributes: ['id', 'nombre', 'username'] },
          {
            model: MovimientoCaja,
            as: 'movimientos',
            include: [
              { model: User, as: 'usuario', attributes: ['id', 'nombre', 'username'] }
            ],
            order: [['created_at', 'ASC']]
          }
        ]
      });

      if (!turno) {
        throw new Error('Turno no encontrado');
      }

      return turno;
    } catch (error) {
      logger.error('Error al obtener turno:', error);
      throw error;
    }
  }

  /**
   * Abrir turno de caja
   */
  async abrirTurno(data, usuarioId) {
    const transaction = await sequelize.transaction();

    try {
      // Verificar que el usuario no tenga ya un turno abierto
      const turnoExistente = await TurnoCaja.findOne({
        where: { usuario_id: usuarioId, estado: 'abierta' },
        transaction
      });

      if (turnoExistente) {
        throw new Error(`Ya tienes un turno abierto: ${turnoExistente.numero_turno}`);
      }

      const numeroTurno = await this.generarNumeroTurno(transaction);
      const saldoInicial = parseFloat(data.saldo_inicial) || 0;

      const turno = await TurnoCaja.create({
        numero_turno: numeroTurno,
        usuario_id: usuarioId,
        fecha_apertura: new Date(),
        saldo_inicial,
        total_ventas_efectivo: 0,
        total_ventas_tarjeta: 0,
        total_ventas_transferencia: 0,
        total_ingresos: 0,
        total_egresos: 0,
        total_esperado: saldoInicial,
        estado: 'abierta',
        notas_apertura: data.notas || null
      }, { transaction });

      // Registrar movimiento de apertura
      await MovimientoCaja.create({
        turno_id: turno.id,
        tipo: 'apertura',
        descripcion: 'Apertura de caja',
        monto: saldoInicial,
        referencia_tipo: 'manual',
        referencia_id: null,
        usuario_id: usuarioId
      }, { transaction });

      await transaction.commit();

      logger.info(`Turno abierto: ${numeroTurno} - Usuario: ${usuarioId} - Saldo inicial: $${saldoInicial}`);

      return await this.getTurnoById(turno.id);
    } catch (error) {
      await transaction.rollback();
      logger.error('Error al abrir turno:', error);
      throw error;
    }
  }

  /**
   * Cerrar turno de caja con arqueo
   */
  async cerrarTurno(id, data, usuarioId) {
    const transaction = await sequelize.transaction();

    try {
      const turno = await TurnoCaja.findByPk(id, { transaction });

      if (!turno) {
        throw new Error('Turno no encontrado');
      }

      if (turno.estado === 'cerrada') {
        throw new Error('Este turno ya fue cerrado');
      }

      if (turno.usuario_id !== usuarioId) {
        // Solo el cajero dueño o un admin puede cerrar (verificado en middleware)
        throw new Error('No tienes permiso para cerrar este turno');
      }

      const totalReal = parseFloat(data.total_real);

      if (isNaN(totalReal) || totalReal < 0) {
        throw new Error('El total real contado debe ser un valor válido');
      }

      // Recalcular expected al momento del cierre
      const totalEsperado = parseFloat(turno.saldo_inicial)
        + parseFloat(turno.total_ventas_efectivo)
        + parseFloat(turno.total_ingresos)
        - parseFloat(turno.total_egresos);

      const diferencia = totalReal - totalEsperado;

      await turno.update({
        fecha_cierre: new Date(),
        total_real: totalReal,
        total_esperado: totalEsperado,
        diferencia,
        estado: 'cerrada',
        notas_cierre: data.notas || null
      }, { transaction });

      // Registrar movimiento de cierre
      await MovimientoCaja.create({
        turno_id: turno.id,
        tipo: 'cierre',
        descripcion: `Cierre de caja. Diferencia: $${diferencia.toFixed(2)}`,
        monto: totalReal,
        referencia_tipo: 'manual',
        referencia_id: null,
        usuario_id: usuarioId
      }, { transaction });

      await transaction.commit();

      logger.info(`Turno cerrado: ${turno.numero_turno} - Esperado: $${totalEsperado} - Real: $${totalReal} - Diferencia: $${diferencia}`);

      return await this.getTurnoById(id);
    } catch (error) {
      await transaction.rollback();
      logger.error('Error al cerrar turno:', error);
      throw error;
    }
  }

  /**
   * Registrar movimiento manual (ingreso o egreso)
   */
  async registrarMovimiento(data, usuarioId) {
    const transaction = await sequelize.transaction();

    try {
      const turno = await TurnoCaja.findOne({
        where: { usuario_id: usuarioId, estado: 'abierta' },
        transaction
      });

      if (!turno) {
        throw new Error('No tienes un turno de caja abierto');
      }

      const monto = parseFloat(data.monto);

      if (isNaN(monto) || monto <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }

      const tipo = data.tipo; // 'ingreso' | 'egreso'

      if (!['ingreso', 'egreso'].includes(tipo)) {
        throw new Error('El tipo debe ser ingreso o egreso');
      }

      await MovimientoCaja.create({
        turno_id: turno.id,
        tipo,
        descripcion: data.descripcion,
        monto,
        referencia_tipo: 'manual',
        referencia_id: null,
        usuario_id: usuarioId
      }, { transaction });

      // Actualizar totales del turno
      const updateData = {};
      if (tipo === 'ingreso') {
        updateData.total_ingresos = parseFloat(turno.total_ingresos) + monto;
      } else {
        updateData.total_egresos = parseFloat(turno.total_egresos) + monto;
      }

      // Recalcular total esperado
      const nuevoIngresos = updateData.total_ingresos !== undefined ? updateData.total_ingresos : parseFloat(turno.total_ingresos);
      const nuevoEgresos = updateData.total_egresos !== undefined ? updateData.total_egresos : parseFloat(turno.total_egresos);
      updateData.total_esperado = parseFloat(turno.saldo_inicial)
        + parseFloat(turno.total_ventas_efectivo)
        + nuevoIngresos
        - nuevoEgresos;

      await turno.update(updateData, { transaction });

      await transaction.commit();

      logger.info(`Movimiento ${tipo} registrado en turno ${turno.numero_turno}: $${monto}`);

      return await this.getTurnoById(turno.id);
    } catch (error) {
      await transaction.rollback();
      logger.error('Error al registrar movimiento:', error);
      throw error;
    }
  }

  /**
   * Registrar movimiento de venta (llamado desde venta.service)
   * Best-effort: si no hay turno abierto, solo loguea y no falla la venta
   */
  async registrarMovimientoVenta(ventaData, usuarioId) {
    try {
      const turno = await TurnoCaja.findOne({
        where: { usuario_id: usuarioId, estado: 'abierta' }
      });

      if (!turno) {
        logger.warn(`Venta ${ventaData.numero_venta} registrada sin turno de caja abierto (usuario: ${usuarioId})`);
        return null;
      }

      const monto = parseFloat(ventaData.total);
      const metodoPago = ventaData.metodo_pago;

      // Determinar tipo de movimiento según método de pago
      let tipo;
      if (metodoPago === 'efectivo') tipo = 'venta_efectivo';
      else if (metodoPago === 'tarjeta') tipo = 'venta_tarjeta';
      else if (metodoPago === 'transferencia') tipo = 'venta_transferencia';
      else tipo = 'venta_efectivo'; // mixto: simplificado como efectivo

      await MovimientoCaja.create({
        turno_id: turno.id,
        tipo,
        descripcion: `Venta: ${ventaData.numero_venta}`,
        monto,
        referencia_tipo: 'venta',
        referencia_id: ventaData.id,
        usuario_id: usuarioId
      });

      // Actualizar totales del turno
      const updateData = {};
      if (metodoPago === 'efectivo' || metodoPago === 'mixto') {
        updateData.total_ventas_efectivo = parseFloat(turno.total_ventas_efectivo) + monto;
      } else if (metodoPago === 'tarjeta') {
        updateData.total_ventas_tarjeta = parseFloat(turno.total_ventas_tarjeta) + monto;
      } else if (metodoPago === 'transferencia') {
        updateData.total_ventas_transferencia = parseFloat(turno.total_ventas_transferencia) + monto;
      }

      // Recalcular total esperado (solo ventas en efectivo afectan el dinero físico)
      const nuevoEfectivo = updateData.total_ventas_efectivo !== undefined
        ? updateData.total_ventas_efectivo
        : parseFloat(turno.total_ventas_efectivo);

      updateData.total_esperado = parseFloat(turno.saldo_inicial)
        + nuevoEfectivo
        + parseFloat(turno.total_ingresos)
        - parseFloat(turno.total_egresos);

      await turno.update(updateData);

      logger.info(`Movimiento de venta registrado en turno ${turno.numero_turno}: ${ventaData.numero_venta} - $${monto}`);

      return turno;
    } catch (error) {
      // No propagar el error — no debe afectar a la venta
      logger.error('Error al registrar movimiento de venta en caja (no crítico):', error);
      return null;
    }
  }

  /**
   * Obtener movimientos de un turno
   */
  async getMovimientos(turnoId) {
    try {
      const turno = await TurnoCaja.findByPk(turnoId);
      if (!turno) {
        throw new Error('Turno no encontrado');
      }

      const movimientos = await MovimientoCaja.findAll({
        where: { turno_id: turnoId },
        include: [
          { model: User, as: 'usuario', attributes: ['id', 'nombre', 'username'] }
        ],
        order: [['created_at', 'ASC']]
      });

      return movimientos;
    } catch (error) {
      logger.error('Error al obtener movimientos:', error);
      throw error;
    }
  }

  /**
   * Resumen del turno activo (para mostrar en POS)
   */
  async getResumenTurnoActivo(usuarioId) {
    try {
      const turno = await this.getTurnoActivo(usuarioId);

      if (!turno) {
        return null;
      }

      const totalVentas = parseFloat(turno.total_ventas_efectivo)
        + parseFloat(turno.total_ventas_tarjeta)
        + parseFloat(turno.total_ventas_transferencia);

      return {
        turno,
        resumen: {
          saldo_inicial: parseFloat(turno.saldo_inicial),
          total_ventas: totalVentas,
          total_ventas_efectivo: parseFloat(turno.total_ventas_efectivo),
          total_ventas_tarjeta: parseFloat(turno.total_ventas_tarjeta),
          total_ventas_transferencia: parseFloat(turno.total_ventas_transferencia),
          total_ingresos: parseFloat(turno.total_ingresos),
          total_egresos: parseFloat(turno.total_egresos),
          total_esperado: parseFloat(turno.total_esperado),
          tiempo_abierto: this._calcularTiempoAbierto(turno.fecha_apertura)
        }
      };
    } catch (error) {
      logger.error('Error al obtener resumen del turno activo:', error);
      throw error;
    }
  }

  _calcularTiempoAbierto(fechaApertura) {
    const ahora = new Date();
    const apertura = new Date(fechaApertura);
    const diffMs = ahora - apertura;
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHoras}h ${diffMinutos}m`;
  }
}

module.exports = new CajaService();
