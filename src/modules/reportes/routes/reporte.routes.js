const express = require('express');
const router  = express.Router();
const { verifyToken, checkRole } = require('../../../shared/middleware/auth.middleware');
const ctrl = require('../controllers/reporte.controller');

// Dashboard — cualquier usuario autenticado
router.get('/dashboard/kpis',           verifyToken, ctrl.getKPIs);
router.get('/dashboard/ventas-semana',  verifyToken, ctrl.getVentasSemana);
router.get('/dashboard/top-productos',  verifyToken, ctrl.getTopProductosHoy);
router.get('/dashboard/ultimas-ventas', verifyToken, ctrl.getUltimasVentas);

// Reportes — solo admin
router.get('/ventas',              verifyToken, checkRole('admin'), ctrl.getVentasPorPeriodo);
router.get('/productos-vendidos',  verifyToken, checkRole('admin'), ctrl.getProductosMasVendidos);
router.get('/ventas-categoria',    verifyToken, checkRole('admin'), ctrl.getVentasPorCategoria);
router.get('/ventas-cajero',       verifyToken, checkRole('admin'), ctrl.getVentasPorCajero);
router.get('/ingresos-gastos',     verifyToken, checkRole('admin'), ctrl.getIngresosVsGastos);
router.get('/stock-bajo',          verifyToken, ctrl.getStockBajo);
router.get('/por-vencer',          verifyToken, ctrl.getPorVencer);
router.get('/valor-inventario',    verifyToken, checkRole('admin'), ctrl.getValorInventario);
router.get('/rotacion',            verifyToken, checkRole('admin'), ctrl.getRotacion);
router.get('/cartera-creditos',    verifyToken, checkRole('admin'), ctrl.getCartera);

// Exportar Excel
router.get('/exportar/excel', verifyToken, checkRole('admin'), ctrl.exportarExcel);

module.exports = router;
