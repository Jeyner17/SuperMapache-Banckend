const { Sequelize } = require('sequelize');
const config = require('../shared/config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Crear instancia de Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    timezone: dbConfig.timezone,
    define: dbConfig.define,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions || {}
  }
);

// Función para probar conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:', error.message);
    return false;
  }
};

// Función para sincronizar modelos (solo desarrollo)
const syncModels = async (options = {}) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync(options);
      console.log('✅ Modelos sincronizados con la base de datos');
    }
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:', error.message);
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncModels,
  Sequelize
};