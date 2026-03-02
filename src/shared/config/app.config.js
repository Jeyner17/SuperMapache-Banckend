require('dotenv').config();

module.exports = {
  app: {
    name: process.env.APP_NAME || 'SuperMercado Sistema',
    url: process.env.APP_URL || 'http://localhost:5000',
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  
  upload: {
    path: process.env.UPLOAD_PATH || './uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
  },
  
  logs: {
    level: process.env.LOG_LEVEL || 'info',
  }
};