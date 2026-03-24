const cron = require('node-cron');
const alertaService = require('../../modules/alertas/services/alerta.service');
const logger = require('../utils/logger');

/**
 * Generar alertas automáticas diariamente a las 8:05 AM
 * (5 min después del job de inventario para que los estados de lotes estén actualizados)
 */
const generarAlertasCron = () => {
  cron.schedule('5 8 * * *', async () => {
    try {
      logger.info('Iniciando generación automática de alertas...');
      const nuevas = await alertaService.generarAlertas();
      logger.info(`Alertas generadas: ${nuevas.length}`);
    } catch (error) {
      logger.error('Error en cron job de alertas:', error);
    }
  });

  logger.info('Cron job de alertas configurado (8:05 AM diario)');
};

module.exports = { generarAlertasCron };
