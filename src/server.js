const fs = require('fs');
const path = require('path');
const app = require('./app');
const { testConnection, syncModels } = require('./database/connection');
const appConfig = require('./shared/config/app.config');
const logger = require('./shared/utils/logger');
const { verificarEstadosLotesCron } = require('./shared/jobs/inventario.job');

// Garantizar que las carpetas de uploads existan al arrancar
const UPLOADS_ROOT = path.resolve(__dirname, '../uploads');
['productos'].forEach((subdir) => {
  const dir = path.join(UPLOADS_ROOT, subdir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`📁 Carpeta creada: ${dir}`);
  }
});

const PORT = appConfig.app.port;

// Función para iniciar servidor
const startServer = async () => {
  try {
    // 1. Probar conexión a base de datos
    logger.info('🔌 Probando conexión a MySQL...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      logger.error('❌ No se pudo conectar a MySQL. Verifica tu configuración.');
      process.exit(1);
    }

    // 2. Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      logger.info('🔄 Sincronizando modelos...');
      // await syncModels({ alter: true }); // Descomentar cuando tengas modelos
    }

    // 3. Iniciar cron jobs
    logger.info('⏰ Configurando cron jobs...');
    verificarEstadosLotesCron();

    // 4. Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor corriendo en ${appConfig.app.url}`);
      logger.info(`📝 Entorno: ${appConfig.app.env}`);
      logger.info(`💾 Base de datos: ${process.env.DB_NAME}`);
      console.log('\n✅ Sistema listo para recibir peticiones\n');
    });

  } catch (error) {
    logger.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM recibido. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('👋 SIGINT recibido. Cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();