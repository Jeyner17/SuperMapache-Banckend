/**
 * Extrae la IP real del cliente desde la petición Express.
 * Orden de prioridad:
 *  1. X-Forwarded-For (cuando hay proxy/load balancer)
 *  2. req.socket.remoteAddress (Node 18+ — req.connection está deprecado)
 *  3. req.ip (Express, requiere trust proxy activado)
 */
const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || req.ip || null;
};

module.exports = getClientIp;
