const auditoriaService = require('../services/auditoria.service');
const logger           = require('../../../shared/utils/logger');
const getClientIp      = require('../../../shared/utils/getClientIp');

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

const auditoriaMiddleware = (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  // ⚠ Capturar ANTES de next() — req.url es mutado por los routers anidados
  // req.originalUrl siempre conserva la URL completa original
  const originalUrl = req.originalUrl; // ej: /api/inventario/lotes/5/ajustar
  const method      = req.method;
  const ip          = getClientIp(req);
  const userAgent   = req.get('User-Agent');

  let responseBody = null;
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    responseBody = body;
    return originalJson(body);
  };

  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      setImmediate(() => {
        // Parsear /api/inventario/lotes/5 → ['inventario','lotes','5']
        const parts     = originalUrl.replace(/^\/api\//, '').split('/').filter(Boolean);
        const moduloKey = parts[0] || 'sistema';
        const modulo    = MODULO_MAP[moduloKey] || moduloKey;
        const accion    = ACCION_MAP[method] || method.toLowerCase();

        // Buscar el primer segmento numérico como referencia_id
        const refId = parts.slice(1).find(p => !isNaN(p) && p !== '')
          ? parseInt(parts.slice(1).find(p => !isNaN(p)))
          : (responseBody?.data?.id || null);

        const descripcion = responseBody?.message || `${accion} en ${modulo}`;

        auditoriaService.registrar({
          usuario_id:      req.user.id,
          usuario_nombre:  req.user.username || req.user.nombre,
          usuario_rol:     req.user.rol,
          accion,
          modulo,
          descripcion,
          referencia_tipo: moduloKey,
          referencia_id:   refId,
          datos_extra:     null,
          ip,
          user_agent:      userAgent,
        }).catch(err => logger.error('Auditoría middleware error:', err));
      });
    }
  });

  next();
};

module.exports = auditoriaMiddleware;
