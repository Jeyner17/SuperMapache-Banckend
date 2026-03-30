const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
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
const { cajaRoutes } = require('./modules/caja');
const { creditoRoutes } = require('./modules/creditos');
const { alertaRoutes }                   = require('./modules/alertas');
const { gastoRoutes }                         = require('./modules/gastos');
const { auditoriaRoutes, auditoriaMiddleware } = require('./modules/auditoria');
const { reporteRoutes }                        = require('./modules/reportes');


const app = express();

// Confiar en el primer proxy (necesario para que req.ip devuelva la IP real)
app.set('trust proxy', 1);

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

// Middleware de auditoría automática (debe ir antes de las rutas)
app.use('/api', auditoriaMiddleware);

// Archivos estáticos — cross-origin necesario porque frontend y backend están en puertos distintos
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.resolve(__dirname, '../uploads')));

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
app.use('/api/caja', cajaRoutes);
app.use('/api/creditos', creditoRoutes);
app.use('/api/alertas',    alertaRoutes);
app.use('/api/gastos',     gastoRoutes);
app.use('/api/auditoria',  auditoriaRoutes);
app.use('/api/reportes',   reporteRoutes);


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