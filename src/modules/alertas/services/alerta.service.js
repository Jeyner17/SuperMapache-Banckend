const { Op } = require('sequelize');
const { Alerta } = require('../models');
const inventarioService = require('../../inventario/services/inventario.service');
const creditoService = require('../../creditos/services/credito.service');
const emailService = require('./email.service');
const logger = require('../../../shared/utils/logger');

const VENTANA_DUPLICADOS_MS = 24 * 60 * 60 * 1000; // 24 horas

class AlertaService {

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  async getAlertas(filters = {}) {
    try {
      const page  = parseInt(filters.page)  || 1;
      const limit = parseInt(filters.limit) || 20;
      const offset = (page - 1) * limit;
      const where = {};

      if (filters.tipo)      where.tipo      = filters.tipo;
      if (filters.prioridad) where.prioridad = filters.prioridad;
      if (filters.leida    !== undefined) where.leida    = filters.leida === 'true' || filters.leida === true;
      if (filters.resuelta !== undefined) where.resuelta = filters.resuelta === 'true' || filters.resuelta === true;

      const { count, rows } = await Alerta.findAndCountAll({
        where,
        limit,
        offset,
        order: [
          ['resuelta', 'ASC'],
          [Alerta.sequelize.literal(`FIELD(prioridad, 'critica', 'alta', 'media', 'baja')`), 'ASC'],
          ['created_at', 'DESC']
        ],
        distinct: true
      });

      return {
        alertas: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      logger.error('Error al obtener alertas:', error);
      throw error;
    }
  }

  async getNoLeidas(limit = 10) {
    try {
      const [alertas, total] = await Promise.all([
        Alerta.findAll({
          where: { leida: false, resuelta: false },
          order: [
            [Alerta.sequelize.literal(`FIELD(prioridad, 'critica', 'alta', 'media', 'baja')`), 'ASC'],
            ['created_at', 'DESC']
          ],
          limit
        }),
        Alerta.count({ where: { leida: false, resuelta: false } })
      ]);

      return { alertas, total };
    } catch (error) {
      logger.error('Error al obtener alertas no leídas:', error);
      throw error;
    }
  }

  async getResumen() {
    try {
      const [total, noLeidas, criticas, altas] = await Promise.all([
        Alerta.count({ where: { resuelta: false } }),
        Alerta.count({ where: { leida: false, resuelta: false } }),
        Alerta.count({ where: { prioridad: 'critica', resuelta: false } }),
        Alerta.count({ where: { prioridad: 'alta', resuelta: false } })
      ]);

      const porTipo = await Alerta.findAll({
        attributes: [
          'tipo',
          [Alerta.sequelize.fn('COUNT', Alerta.sequelize.col('id')), 'cantidad']
        ],
        where: { resuelta: false },
        group: ['tipo'],
        raw: true
      });

      return { total, no_leidas: noLeidas, criticas, altas, por_tipo: porTipo };
    } catch (error) {
      logger.error('Error al obtener resumen:', error);
      throw error;
    }
  }

  async marcarLeida(id) {
    try {
      const alerta = await Alerta.findByPk(id);
      if (!alerta) throw new Error('Alerta no encontrada');
      if (!alerta.leida) {
        await alerta.update({ leida: true, fecha_lectura: new Date() });
      }
      return alerta;
    } catch (error) {
      logger.error('Error al marcar alerta leída:', error);
      throw error;
    }
  }

  async marcarTodasLeidas() {
    try {
      const [cantidad] = await Alerta.update(
        { leida: true, fecha_lectura: new Date() },
        { where: { leida: false } }
      );
      return cantidad;
    } catch (error) {
      logger.error('Error al marcar todas las alertas leídas:', error);
      throw error;
    }
  }

  async marcarResuelta(id, usuarioId) {
    try {
      const alerta = await Alerta.findByPk(id);
      if (!alerta) throw new Error('Alerta no encontrada');
      if (alerta.resuelta) throw new Error('La alerta ya está resuelta');

      await alerta.update({
        resuelta: true,
        fecha_resolucion: new Date(),
        resuelta_por: usuarioId,
        leida: true,
        fecha_lectura: alerta.fecha_lectura || new Date()
      });
      return alerta;
    } catch (error) {
      logger.error('Error al marcar alerta resuelta:', error);
      throw error;
    }
  }

  // ─── GENERACIÓN ───────────────────────────────────────────────────────────

  /**
   * Genera alertas automáticas consultando inventario y créditos.
   * Evita duplicados: no crea una alerta si ya existe una no resuelta
   * del mismo tipo+referencia creada en las últimas 24 horas.
   */
  async generarAlertas() {
    try {
      const nuevasAlertas = [];
      const limiteAntigüedad = new Date(Date.now() - VENTANA_DUPLICADOS_MS);

      // ── 1. Alertas de inventario ─────────────────────────────────────────
      const invAlertas = await inventarioService.getAlertas();

      // 1a. Productos agotados
      for (const p of (invAlertas.agotados || [])) {
        const alerta = await this._crearSiNoDuplica({
          tipo: 'agotado',
          prioridad: 'critica',
          titulo: `Sin stock: ${p.nombre}`,
          mensaje: `El producto "${p.nombre}" está completamente agotado.`,
          referencia_tipo: 'producto',
          referencia_id: p.id,
          datos_extra: { stock_actual: 0, stock_minimo: p.stock_minimo }
        }, limiteAntigüedad);
        if (alerta) nuevasAlertas.push(alerta);
      }

      // 1b. Stock bajo
      for (const p of (invAlertas.stock_bajo || [])) {
        const prioridad = p.stock_actual <= (p.stock_minimo / 2) ? 'alta' : 'media';
        const alerta = await this._crearSiNoDuplica({
          tipo: 'stock_bajo',
          prioridad,
          titulo: `Stock bajo: ${p.nombre}`,
          mensaje: `"${p.nombre}" tiene ${p.stock_actual} ${p.unidad_medida || 'unid.'} (mínimo: ${p.stock_minimo}).`,
          referencia_tipo: 'producto',
          referencia_id: p.id,
          datos_extra: { stock_actual: p.stock_actual, stock_minimo: p.stock_minimo }
        }, limiteAntigüedad);
        if (alerta) nuevasAlertas.push(alerta);
      }

      // 1c. Lotes por vencer
      for (const lote of (invAlertas.por_vencer || [])) {
        const diasRestantes = Math.ceil(
          (new Date(lote.fecha_caducidad) - new Date()) / 86400000
        );
        const prioridad = diasRestantes <= 3 ? 'critica'
                        : diasRestantes <= 7 ? 'alta'
                        : 'media';
        const nombreProducto = lote.producto?.nombre || `Producto #${lote.producto_id}`;
        const alerta = await this._crearSiNoDuplica({
          tipo: 'por_vencer',
          prioridad,
          titulo: `Próximo a vencer: ${nombreProducto}`,
          mensaje: `Lote ${lote.numero_lote || lote.id} de "${nombreProducto}" vence en ${diasRestantes} día(s) (${new Date(lote.fecha_caducidad).toLocaleDateString('es-EC')}). Stock: ${lote.cantidad_actual}.`,
          referencia_tipo: 'lote',
          referencia_id: lote.id,
          datos_extra: {
            producto_id: lote.producto_id,
            fecha_caducidad: lote.fecha_caducidad,
            dias_restantes: diasRestantes,
            cantidad_actual: lote.cantidad_actual
          }
        }, limiteAntigüedad);
        if (alerta) nuevasAlertas.push(alerta);
      }

      // 1d. Lotes vencidos
      for (const lote of (invAlertas.vencidos || [])) {
        const diasVencido = Math.ceil(
          (new Date() - new Date(lote.fecha_caducidad)) / 86400000
        );
        const nombreProducto = lote.producto?.nombre || `Producto #${lote.producto_id}`;
        const alerta = await this._crearSiNoDuplica({
          tipo: 'vencido',
          prioridad: 'critica',
          titulo: `VENCIDO: ${nombreProducto}`,
          mensaje: `Lote ${lote.numero_lote || lote.id} de "${nombreProducto}" venció hace ${diasVencido} día(s). Stock disponible: ${lote.cantidad_actual}.`,
          referencia_tipo: 'lote',
          referencia_id: lote.id,
          datos_extra: {
            producto_id: lote.producto_id,
            fecha_caducidad: lote.fecha_caducidad,
            dias_vencido: diasVencido,
            cantidad_actual: lote.cantidad_actual
          }
        }, limiteAntigüedad);
        if (alerta) nuevasAlertas.push(alerta);
      }

      // ── 2. Alertas de créditos ────────────────────────────────────────────
      let creditosData = { por_vencer: [], vencidos: [] };
      try {
        creditosData = await creditoService.getCreditosParaAlertas();
      } catch (err) {
        logger.warn('No se pudieron obtener créditos para alertas:', err.message);
      }

      // 2a. Créditos próximos a vencer
      for (const credito of (creditosData.por_vencer || [])) {
        const diasRestantes = Math.ceil(
          (new Date(credito.fecha_vencimiento) - new Date()) / 86400000
        );
        const prioridad = diasRestantes <= 1 ? 'alta' : 'media';
        const nombreCliente = credito.cliente?.nombre || `Cliente #${credito.cliente_id}`;
        const alerta = await this._crearSiNoDuplica({
          tipo: 'credito_vencer',
          prioridad,
          titulo: `Crédito por vencer: ${nombreCliente}`,
          mensaje: `El crédito ${credito.numero_credito} de "${nombreCliente}" vence en ${diasRestantes} día(s). Pendiente: $${parseFloat(credito.saldo_pendiente).toFixed(2)}.`,
          referencia_tipo: 'credito',
          referencia_id: credito.id,
          datos_extra: {
            cliente_id: credito.cliente_id,
            numero_credito: credito.numero_credito,
            saldo_pendiente: credito.saldo_pendiente,
            dias_restantes: diasRestantes
          }
        }, limiteAntigüedad);
        if (alerta) nuevasAlertas.push(alerta);
      }

      // 2b. Créditos vencidos
      for (const credito of (creditosData.vencidos || [])) {
        const diasVencido = Math.ceil(
          (new Date() - new Date(credito.fecha_vencimiento)) / 86400000
        );
        const nombreCliente = credito.cliente?.nombre || `Cliente #${credito.cliente_id}`;
        const alerta = await this._crearSiNoDuplica({
          tipo: 'credito_vencido',
          prioridad: 'alta',
          titulo: `Crédito vencido: ${nombreCliente}`,
          mensaje: `El crédito ${credito.numero_credito} de "${nombreCliente}" venció hace ${diasVencido} día(s). Pendiente: $${parseFloat(credito.saldo_pendiente).toFixed(2)}.`,
          referencia_tipo: 'credito',
          referencia_id: credito.id,
          datos_extra: {
            cliente_id: credito.cliente_id,
            numero_credito: credito.numero_credito,
            saldo_pendiente: credito.saldo_pendiente,
            dias_vencido: diasVencido
          }
        }, limiteAntigüedad);
        if (alerta) nuevasAlertas.push(alerta);
      }

      logger.info(`Generación de alertas completada: ${nuevasAlertas.length} nuevas alertas`);

      // Enviar email (best-effort)
      if (nuevasAlertas.length > 0) {
        emailService.enviarResumenAlertas(nuevasAlertas).catch(err =>
          logger.error('Error al enviar email de alertas:', err)
        );
      }

      return nuevasAlertas;
    } catch (error) {
      logger.error('Error al generar alertas:', error);
      throw error;
    }
  }

  /**
   * Crea una alerta solo si no existe un duplicado no resuelto en las últimas 24h.
   * @private
   */
  async _crearSiNoDuplica(data, limiteAntigüedad) {
    const where = {
      tipo: data.tipo,
      resuelta: false,
      created_at: { [Op.gte]: limiteAntigüedad }
    };
    if (data.referencia_tipo) where.referencia_tipo = data.referencia_tipo;
    if (data.referencia_id)   where.referencia_id   = data.referencia_id;

    const yaExiste = await Alerta.findOne({ where });
    if (yaExiste) return null;

    return await Alerta.create(data);
  }
}

module.exports = new AlertaService();
