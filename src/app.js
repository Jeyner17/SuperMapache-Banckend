const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const appConfig = require('./shared/config/app.config');
const logger = require('./shared/utils/logger');

// Importar rutas
const { authRoutes } = require('./modules/auth');
const { categoriaRoutes } = require('./modules/categorias');
const { productoRoutes } = require('./modules/productos');
const { inventarioRoutes } = require('./modules/inventario');
const { proveedorRoutes } = require('./modules/proveedores');
const { compraRoutes } = require('./modules/compras');
const { escaneoRoutes } = require('./modules/escaneo');
const { ventaRoutes } = require('./modules/ventas');
const { configuracionRoutes } = require('./modules/configuracion');


const app = express();

// Middlewares globales
app.use(helmet());
app.use(cors({
  origin: appConfig.frontend.url,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/uploads', express.static(appConfig.upload.path));

// RUTAS
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: `Bienvenido a ${appConfig.app.name} API`,
    version: '1.0.0',
    environment: appConfig.app.env
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Registrar rutas de módulos
app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/compras', compraRoutes);
app.use('/api/escaneo', escaneoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/configuracion', configuracionRoutes);


// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Error handler global
app.use((err, req, res, next) => {
  logger.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;