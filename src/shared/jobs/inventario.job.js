const cron = require('node-cron');
const inventarioService = require('../../modules/inventario/services/inventario.service');
const logger = require('../utils/logger');

/**
 * Verificar estados de lotes diariamente a las 8:00 AM
 */
const verificarEstadosLotesCron = () => {
  // Ejecutar todos los días a las 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    try {
      logger.info('Iniciando verificación automática de estados de lotes...');
      
      const lotesActualizados = await inventarioService.verificarEstadosLotes();
      
      logger.info(`Verificación completada: ${lotesActualizados.length} lotes actualizados`);
      
      // Aquí podrías enviar notificaciones si hay lotes críticos
      
    } catch (error) {
      logger.error('Error en cron job de verificación de lotes:', error);
    }
  });

  logger.info('Cron job de inventario configurado (8:00 AM diario)');
};

module.exports = {
  verificarEstadosLotesCron
};