const { Op } = require('sequelize');
const { Auditoria } = require('../models');
const logger = require('../../../shared/utils/logger');

// Mapa de paths de la API a nombres de módulo legibles
const MODULO_MAP = {
  auth:           'Autenticación',
  categorias:     'Categorías',
  productos:      'Productos',
  inventario:     'Inventario',
  proveedores:    'Proveedores',
  compras:        'Compras',
  escaneo:        'Escaneo',
  ventas:         'Ventas',
  configuracion:  'Configuración',
  caja:           'Caja',
  creditos:       'Créditos',
  alertas:        'Alertas',
  gastos:         'Gastos',
  auditoria:      'Auditoría',
};

const ACCION_MAP = {
  POST:   'crear',
  PUT:    'actualizar',
  PATCH:  'actualizar',
  DELETE: 'eliminar',
};

// ── Registro manual (llamado explícitamente desde servicios/controllers) ──────
const registrar = async (data) => {
  try {
    await Auditoria.create({
      usuario_id:     data.usuario_id     || null,
      usuario_nombre: data.usuario_nombre || null,
      usuario_rol:    data.usuario_rol    || null,
      accion:         data.accion,
      modulo:         data.modulo,
      descripcion:    data.descripcion    || null,
      referencia_tipo: data.referencia_tipo || null,
      referencia_id:  data.referencia_id  || null,
      datos_extra:    data.datos_extra    || null,
      ip:             data.ip             || null,
      user_agent:     data.user_agent     || null,
    });
  } catch (err) {
    // Nunca fallar la operación principal
    logger.error('Error al registrar auditoría:', err);
  }
};

// ── Registro automático desde middleware ──────────────────────────────────────
const registrarDesdeRequest = async (req, statusCode, responseBody) => {
  try {
    if (!req.user) return;

    // Parsear el path: /api/gastos/5/algo → ['gastos','5','algo']
    const parts = req.path.replace(/^\/api\//, '').split('/').filter(Boolean);
    const moduloKey   = parts[0] || 'sistema';
    const refId       = parts[1] && !isNaN(parts[1]) ? parseInt(parts[1]) : (responseBody?.data?.id || null);
    const modulo      = MODULO_MAP[moduloKey] || moduloKey;
    const accion      = ACCION_MAP[req.method] || req.method.toLowerCase();
    const descripcion = responseBody?.message || `${accion} en ${modulo}`;

    await Auditoria.create({
      usuario_id:      req.user.id,
      usuario_nombre:  req.user.username || req.user.nombre,
      usuario_rol:     req.user.rol,
      accion,
      modulo,
      descripcion,
      referencia_tipo: moduloKey,
      referencia_id:   refId,
      datos_extra:     null,
      ip:              require('../../../shared/utils/getClientIp')(req),
      user_agent:      req.get('User-Agent'),
    });
  } catch (err) {
    logger.error('Error al registrar auditoría automática:', err);
  }
};

// ── Consultas ─────────────────────────────────────────────────────────────────
const getAuditorias = async (filters = {}) => {
  const { page = 1, limit = 50, accion, modulo, usuario_id, fecha_desde, fecha_hasta, busqueda } = filters;
  const offset = (page - 1) * limit;
  const where = {};

  if (accion)      where.accion  = accion;
  if (modulo)      where.modulo  = modulo;
  if (usuario_id)  where.usuario_id = usuario_id;

  if (fecha_desde || fecha_hasta) {
    where.created_at = {};
    if (fecha_desde) where.created_at[Op.gte] = new Date(fecha_desde);
    if (fecha_hasta) {
      const fin = new Date(fecha_hasta);
      fin.setHours(23, 59, 59, 999);
      where.created_at[Op.lte] = fin;
    }
  }

  if (busqueda) {
    where[Op.or] = [
      { descripcion:     { [Op.like]: `%${busqueda}%` } },
      { usuario_nombre:  { [Op.like]: `%${busqueda}%` } },
      { modulo:          { [Op.like]: `%${busqueda}%` } },
    ];
  }

  const { count, rows } = await Auditoria.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit:  parseInt(limit),
    offset: parseInt(offset)
  });

  return {
    registros: rows,
    pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / limit) }
  };
};

const getModulos = async () => {
  const rows = await Auditoria.findAll({
    attributes: [[require('sequelize').fn('DISTINCT', require('sequelize').col('modulo')), 'modulo']],
    raw: true
  });
  return rows.map(r => r.modulo).filter(Boolean).sort();
};

const getUsuarios = async () => {
  const rows = await Auditoria.findAll({
    attributes: [
      [require('sequelize').fn('DISTINCT', require('sequelize').col('usuario_nombre')), 'usuario_nombre'],
      'usuario_id'
    ],
    where: { usuario_id: { [Op.not]: null } },
    raw: true
  });
  return rows.filter(r => r.usuario_nombre);
};

module.exports = { registrar, registrarDesdeRequest, getAuditorias, getModulos, getUsuarios };
