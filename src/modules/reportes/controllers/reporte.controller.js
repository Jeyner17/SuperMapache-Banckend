const service    = require('../services/reporte.service');
const exportSvc  = require('../services/export.service');
const ApiResponse = require('../../../shared/utils/response');

const hoy    = () => new Date().toISOString().split('T')[0];
const hace30 = () => { const d = new Date(); d.setDate(d.getDate() - 29); return d.toISOString().split('T')[0]; };

// ── Dashboard ─────────────────────────────────────────────────────────────────
const getKPIs             = async (req, res) => { try { ApiResponse.success(res, await service.getKPIs()); } catch(e) { ApiResponse.serverError(res, e.message); } };
const getVentasSemana     = async (req, res) => { try { ApiResponse.success(res, await service.getVentasUltimos7Dias()); } catch(e) { ApiResponse.serverError(res, e.message); } };
const getTopProductosHoy  = async (req, res) => { try { ApiResponse.success(res, await service.getTopProductosHoy(req.query.limit || 5)); } catch(e) { ApiResponse.serverError(res, e.message); } };
const getUltimasVentas    = async (req, res) => { try { ApiResponse.success(res, await service.getUltimasVentas(req.query.limit || 8)); } catch(e) { ApiResponse.serverError(res, e.message); } };

// ── Reportes ──────────────────────────────────────────────────────────────────
const getVentasPorPeriodo = async (req, res) => {
  try {
    const { desde = hace30(), hasta = hoy(), agrupacion = 'dia' } = req.query;
    ApiResponse.success(res, await service.getVentasPorPeriodo(desde, hasta, agrupacion));
  } catch(e) { ApiResponse.serverError(res, e.message); }
};

const getProductosMasVendidos = async (req, res) => {
  try {
    const { desde = hace30(), hasta = hoy(), limit = 10 } = req.query;
    ApiResponse.success(res, await service.getProductosMasVendidos(desde, hasta, parseInt(limit)));
  } catch(e) { ApiResponse.serverError(res, e.message); }
};

const getVentasPorCategoria = async (req, res) => {
  try {
    const { desde = hace30(), hasta = hoy() } = req.query;
    ApiResponse.success(res, await service.getVentasPorCategoria(desde, hasta));
  } catch(e) { ApiResponse.serverError(res, e.message); }
};

const getVentasPorCajero = async (req, res) => {
  try {
    const { desde = hace30(), hasta = hoy() } = req.query;
    ApiResponse.success(res, await service.getVentasPorCajero(desde, hasta));
  } catch(e) { ApiResponse.serverError(res, e.message); }
};

const getIngresosVsGastos = async (req, res) => {
  try {
    ApiResponse.success(res, await service.getIngresosVsGastos(req.query.desde, req.query.hasta));
  } catch(e) { ApiResponse.serverError(res, e.message); }
};

const getStockBajo        = async (req, res) => { try { ApiResponse.success(res, await service.getStockBajo()); } catch(e) { ApiResponse.serverError(res, e.message); } };
const getValorInventario  = async (req, res) => { try { ApiResponse.success(res, await service.getValorInventario()); } catch(e) { ApiResponse.serverError(res, e.message); } };

const getPorVencer = async (req, res) => {
  try {
    ApiResponse.success(res, await service.getProductosPorVencer(req.query.dias || 21));
  } catch(e) { ApiResponse.serverError(res, e.message); }
};

const getRotacion = async (req, res) => {
  try {
    const { desde = hace30(), hasta = hoy() } = req.query;
    ApiResponse.success(res, await service.getRotacionInventario(desde, hasta));
  } catch(e) { ApiResponse.serverError(res, e.message); }
};

const getCartera = async (req, res) => {
  try { ApiResponse.success(res, await service.getCarteraCreditos()); } catch(e) { ApiResponse.serverError(res, e.message); }
};

// ── Exports ───────────────────────────────────────────────────────────────────
const exportarExcel = async (req, res) => {
  try {
    const { tipo, desde = hace30(), hasta = hoy(), agrupacion = 'dia' } = req.query;
    let wb, filename;

    switch (tipo) {
      case 'ventas': {
        const datos = await service.getVentasPorPeriodo(desde, hasta, agrupacion);
        wb = await exportSvc.excelVentasPorPeriodo(datos, desde, hasta);
        filename = `ventas_${desde}_${hasta}`;
        break;
      }
      case 'productos': {
        const datos = await service.getProductosMasVendidos(desde, hasta);
        wb = await exportSvc.excelProductosMasVendidos(datos, desde, hasta);
        filename = `top_productos_${desde}_${hasta}`;
        break;
      }
      case 'financiero': {
        const datos = await service.getIngresosVsGastos(desde, hasta);
        wb = await exportSvc.excelIngresosVsGastos(datos);
        filename = `financiero_${desde}_${hasta}`;
        break;
      }
      case 'stock_bajo': {
        const datos = await service.getStockBajo();
        wb = await exportSvc.excelStockBajo(datos);
        filename = `stock_bajo_${new Date().toISOString().split('T')[0]}`;
        break;
      }
      case 'por_vencer': {
        const datos = await service.getProductosPorVencer(req.query.dias || 21);
        wb = await exportSvc.excelPorVencer(datos);
        filename = `por_vencer_${new Date().toISOString().split('T')[0]}`;
        break;
      }
      default:
        return ApiResponse.error(res, 'Tipo de reporte no válido', 400);
    }

    await exportSvc.enviarExcel(res, wb, filename);
  } catch(e) {
    ApiResponse.serverError(res, e.message);
  }
};

module.exports = {
  getKPIs, getVentasSemana, getTopProductosHoy, getUltimasVentas,
  getVentasPorPeriodo, getProductosMasVendidos, getVentasPorCategoria,
  getVentasPorCajero, getIngresosVsGastos, getStockBajo, getPorVencer,
  getValorInventario, getRotacion, getCartera, exportarExcel,
};
