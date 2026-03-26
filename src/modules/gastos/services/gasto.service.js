const { Op } = require('sequelize');
const { sequelize } = require('../../../database/connection');
const { Gasto } = require('../models');
const User = require('../../auth/models/User');
const logger = require('../../../shared/utils/logger');

const INCLUDE_BASE = [
  { model: User, as: 'usuario', attributes: ['id', 'nombre', 'username'] }
];

// ── Número correlativo ────────────────────────────────────────────────────────
const generarNumeroGasto = async (transaction) => {
  const ahora = new Date();
  const yyyy = ahora.getFullYear();
  const mm = String(ahora.getMonth() + 1).padStart(2, '0');
  const prefijo = `GASTO-${yyyy}${mm}-`;

  const ultimo = await Gasto.findAll({
    where: { numero_gasto: { [Op.like]: `${prefijo}%` } },
    order: [['numero_gasto', 'DESC']],
    limit: 1,
    lock: transaction.LOCK.UPDATE,
    transaction
  });

  let siguiente = 1;
  if (ultimo.length > 0) {
    const partes = ultimo[0].numero_gasto.split('-');
    siguiente = parseInt(partes[partes.length - 1]) + 1;
  }

  return `${prefijo}${String(siguiente).padStart(6, '0')}`;
};

// ── Listar ────────────────────────────────────────────────────────────────────
const getGastos = async (filters = {}) => {
  const { page = 1, limit = 20, categoria, metodo_pago, fecha_desde, fecha_hasta, busqueda } = filters;
  const offset = (page - 1) * limit;
  const where = {};

  if (categoria)    where.categoria   = categoria;
  if (metodo_pago)  where.metodo_pago = metodo_pago;
  if (fecha_desde || fecha_hasta) {
    where.fecha_gasto = {};
    if (fecha_desde) where.fecha_gasto[Op.gte] = fecha_desde;
    if (fecha_hasta) where.fecha_gasto[Op.lte] = fecha_hasta;
  }
  if (busqueda) {
    where[Op.or] = [
      { descripcion:   { [Op.like]: `%${busqueda}%` } },
      { numero_gasto:  { [Op.like]: `%${busqueda}%` } },
      { comprobante:   { [Op.like]: `%${busqueda}%` } }
    ];
  }

  const { count, rows } = await Gasto.findAndCountAll({
    where,
    include: INCLUDE_BASE,
    order: [['fecha_gasto', 'DESC'], ['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  return {
    gastos: rows,
    pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / limit) }
  };
};

// ── Resumen ───────────────────────────────────────────────────────────────────
const getResumen = async (mes, anio) => {
  const ahora = new Date();
  const y = anio || ahora.getFullYear();
  const m = mes   || ahora.getMonth() + 1;
  const inicio = `${y}-${String(m).padStart(2, '0')}-01`;
  const fin    = new Date(y, m, 0).toISOString().split('T')[0]; // último día del mes

  const gastos = await Gasto.findAll({
    where: { fecha_gasto: { [Op.between]: [inicio, fin] } },
    attributes: ['categoria', 'monto', 'metodo_pago']
  });

  const totalMes = gastos.reduce((s, g) => s + parseFloat(g.monto), 0);

  const porCategoria = {};
  const porMetodo    = {};
  for (const g of gastos) {
    porCategoria[g.categoria] = (porCategoria[g.categoria] || 0) + parseFloat(g.monto);
    porMetodo[g.metodo_pago]  = (porMetodo[g.metodo_pago]  || 0) + parseFloat(g.monto);
  }

  return { total_mes: totalMes, por_categoria: porCategoria, por_metodo: porMetodo, cantidad: gastos.length };
};

// ── CRUD ──────────────────────────────────────────────────────────────────────
const getGastoById = async (id) => {
  const gasto = await Gasto.findByPk(id, { include: INCLUDE_BASE });
  if (!gasto) throw { status: 404, message: 'Gasto no encontrado' };
  return gasto;
};

const crearGasto = async (data, usuarioId) => {
  const transaction = await sequelize.transaction();
  try {
    const numero_gasto = await generarNumeroGasto(transaction);
    const gasto = await Gasto.create({ ...data, numero_gasto, usuario_id: usuarioId }, { transaction });
    await transaction.commit();
    logger.info(`Gasto creado: ${numero_gasto} — $${data.monto}`);
    return await getGastoById(gasto.id);
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

const actualizarGasto = async (id, data) => {
  const gasto = await getGastoById(id);
  // No permitir cambiar numero_gasto ni usuario_id
  const { numero_gasto: _n, usuario_id: _u, ...campos } = data;
  await gasto.update(campos);
  return await getGastoById(id);
};

const eliminarGasto = async (id) => {
  const gasto = await getGastoById(id);
  await gasto.destroy();
  logger.info(`Gasto eliminado: ${gasto.numero_gasto}`);
};

module.exports = { getGastos, getResumen, getGastoById, crearGasto, actualizarGasto, eliminarGasto };
