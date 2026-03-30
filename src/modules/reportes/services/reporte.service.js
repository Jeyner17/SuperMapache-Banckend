const { QueryTypes } = require('sequelize');
const { sequelize }  = require('../../../database/connection');

// ── Helpers ───────────────────────────────────────────────────────────────────
const num  = v => parseFloat(v) || 0;
const int  = v => parseInt(v)   || 0;
const hoy  = () => new Date().toISOString().split('T')[0];
const hace30 = () => { const d = new Date(); d.setDate(d.getDate() - 29); return d.toISOString().split('T')[0]; };

// ── DASHBOARD KPIs ────────────────────────────────────────────────────────────
const getKPIs = async () => {
  const [[ventasHoy], [ventasAyer], [ventasMes], [gastosMes],
         [stockBajo], [alertas], [creditos], [turnoActivo]] = await Promise.all([

    sequelize.query(`SELECT COUNT(*) cant, COALESCE(SUM(total),0) total
      FROM ventas WHERE DATE(fecha_venta)=CURDATE() AND estado='completada'`,
      { type: QueryTypes.SELECT }),

    sequelize.query(`SELECT COUNT(*) cant, COALESCE(SUM(total),0) total
      FROM ventas WHERE DATE(fecha_venta)=DATE_SUB(CURDATE(),INTERVAL 1 DAY) AND estado='completada'`,
      { type: QueryTypes.SELECT }),

    sequelize.query(`SELECT COUNT(*) cant, COALESCE(SUM(total),0) total
      FROM ventas WHERE YEAR(fecha_venta)=YEAR(CURDATE()) AND MONTH(fecha_venta)=MONTH(CURDATE()) AND estado='completada'`,
      { type: QueryTypes.SELECT }),

    sequelize.query(`SELECT COALESCE(SUM(monto),0) total
      FROM gastos WHERE YEAR(fecha_gasto)=YEAR(CURDATE()) AND MONTH(fecha_gasto)=MONTH(CURDATE())`,
      { type: QueryTypes.SELECT }),

    sequelize.query(`SELECT COUNT(*) cant FROM productos WHERE stock_actual<=stock_minimo AND activo=1`,
      { type: QueryTypes.SELECT }),

    sequelize.query(`SELECT COUNT(*) cant FROM alertas WHERE leida=0 AND resuelta=0`,
      { type: QueryTypes.SELECT }),

    sequelize.query(`SELECT COALESCE(SUM(saldo_pendiente),0) total, COUNT(*) cant
      FROM creditos WHERE estado IN ('pendiente','parcial','vencido')`,
      { type: QueryTypes.SELECT }),

    sequelize.query(`SELECT COALESCE(SUM(saldo_inicial)+SUM(total_ingresos)-SUM(total_egresos),0) efectivo
      FROM turnos_caja WHERE estado='abierta'`,
      { type: QueryTypes.SELECT }),
  ]);

  const totalHoy  = num(ventasHoy.total);
  const totalAyer = num(ventasAyer.total);
  const cambio    = totalAyer > 0 ? +((totalHoy - totalAyer) / totalAyer * 100).toFixed(1) : null;

  return {
    ventas_hoy:          { total: totalHoy, cantidad: int(ventasHoy.cant), vs_ayer: cambio },
    ventas_mes:          { total: num(ventasMes.total), cantidad: int(ventasMes.cant) },
    gastos_mes:          num(gastosMes.total),
    ganancia_mes:        num(ventasMes.total) - num(gastosMes.total),
    stock_bajo:          int(stockBajo.cant),
    alertas_pendientes:  int(alertas.cant),
    creditos_pendientes: { total: num(creditos.total), cantidad: int(creditos.cant) },
    efectivo_caja:       num(turnoActivo.efectivo),
  };
};

// ── Ventas últimos N días (para gráfico) ─────────────────────────────────────
const getVentasUltimos7Dias = async () => {
  const rows = await sequelize.query(`
    SELECT DATE(fecha_venta) fecha, COUNT(*) cantidad, COALESCE(SUM(total),0) total
    FROM ventas
    WHERE fecha_venta >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND estado='completada'
    GROUP BY DATE(fecha_venta) ORDER BY fecha ASC`,
    { type: QueryTypes.SELECT });

  // Rellenar días sin ventas
  const map = Object.fromEntries(rows.map(r => [r.fecha, r]));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const k = d.toISOString().split('T')[0];
    const dia = d.toLocaleDateString('es', { weekday: 'short', day: 'numeric' });
    return { fecha: k, dia, total: num(map[k]?.total), cantidad: int(map[k]?.cantidad) };
  });
};

// ── Top productos hoy ─────────────────────────────────────────────────────────
const getTopProductosHoy = async (limit = 5) => {
  return sequelize.query(`
    SELECT p.nombre, SUM(vd.cantidad) unidades, COALESCE(SUM(vd.subtotal),0) total
    FROM ventas_detalles vd
    JOIN ventas v ON vd.venta_id=v.id
    JOIN productos p ON vd.producto_id=p.id
    WHERE DATE(v.fecha_venta)=CURDATE() AND v.estado='completada'
    GROUP BY p.id, p.nombre ORDER BY unidades DESC LIMIT :limit`,
    { replacements: { limit }, type: QueryTypes.SELECT });
};

// ── Últimas ventas ────────────────────────────────────────────────────────────
const getUltimasVentas = async (limit = 8) => {
  return sequelize.query(`
    SELECT v.numero_venta, v.total, v.metodo_pago, v.fecha_venta,
           u.nombre cajero
    FROM ventas v
    LEFT JOIN usuarios u ON v.usuario_id=u.id
    WHERE v.estado='completada'
    ORDER BY v.fecha_venta DESC LIMIT :limit`,
    { replacements: { limit }, type: QueryTypes.SELECT });
};

// ── REPORTES ──────────────────────────────────────────────────────────────────

const getVentasPorPeriodo = async (desde = hace30(), hasta = hoy(), agrupacion = 'dia') => {
  const fmt = agrupacion === 'mes' ? `DATE_FORMAT(fecha_venta,'%Y-%m')`
            : agrupacion === 'semana' ? `YEARWEEK(fecha_venta,1)`
            : `DATE(fecha_venta)`;
  return sequelize.query(`
    SELECT ${fmt} periodo, DATE(MIN(fecha_venta)) fecha_inicio,
           COUNT(*) cantidad, COALESCE(SUM(total),0) total,
           COALESCE(SUM(subtotal),0) subtotal, COALESCE(SUM(impuestos),0) impuestos,
           COALESCE(SUM(descuento),0) descuento
    FROM ventas
    WHERE fecha_venta BETWEEN :desde AND CONCAT(:hasta,' 23:59:59') AND estado='completada'
    GROUP BY ${fmt} ORDER BY fecha_inicio ASC`,
    { replacements: { desde, hasta }, type: QueryTypes.SELECT });
};

const getProductosMasVendidos = async (desde = hace30(), hasta = hoy(), limit = 10) => {
  return sequelize.query(`
    SELECT p.id, p.nombre, p.codigo_barras, cat.nombre categoria,
           SUM(vd.cantidad) cantidad_vendida,
           COALESCE(SUM(vd.subtotal),0) total_vendido,
           COUNT(DISTINCT v.id) num_ventas,
           AVG(vd.precio_unitario) precio_promedio
    FROM ventas_detalles vd
    JOIN ventas v ON vd.venta_id=v.id
    JOIN productos p ON vd.producto_id=p.id
    LEFT JOIN categorias cat ON p.categoria_id=cat.id
    WHERE v.fecha_venta BETWEEN :desde AND CONCAT(:hasta,' 23:59:59') AND v.estado='completada'
    GROUP BY p.id, p.nombre, p.codigo_barras, cat.nombre
    ORDER BY cantidad_vendida DESC LIMIT :limit`,
    { replacements: { desde, hasta, limit }, type: QueryTypes.SELECT });
};

const getVentasPorCategoria = async (desde = hace30(), hasta = hoy()) => {
  return sequelize.query(`
    SELECT COALESCE(cat.nombre,'Sin categoría') categoria,
           SUM(vd.cantidad) cantidad, COALESCE(SUM(vd.subtotal),0) total,
           COUNT(DISTINCT v.id) num_ventas
    FROM ventas_detalles vd
    JOIN ventas v ON vd.venta_id=v.id
    JOIN productos p ON vd.producto_id=p.id
    LEFT JOIN categorias cat ON p.categoria_id=cat.id
    WHERE v.fecha_venta BETWEEN :desde AND CONCAT(:hasta,' 23:59:59') AND v.estado='completada'
    GROUP BY cat.id, cat.nombre ORDER BY total DESC`,
    { replacements: { desde, hasta }, type: QueryTypes.SELECT });
};

const getVentasPorCajero = async (desde = hace30(), hasta = hoy()) => {
  return sequelize.query(`
    SELECT u.nombre cajero, u.username,
           COUNT(v.id) cantidad, COALESCE(SUM(v.total),0) total,
           AVG(v.total) ticket_promedio
    FROM ventas v
    JOIN usuarios u ON v.usuario_id=u.id
    WHERE v.fecha_venta BETWEEN :desde AND CONCAT(:hasta,' 23:59:59') AND v.estado='completada'
    GROUP BY u.id, u.nombre, u.username ORDER BY total DESC`,
    { replacements: { desde, hasta }, type: QueryTypes.SELECT });
};

const getIngresosVsGastos = async (desde, hasta) => {
  const mesesAtras = 6;
  const d = desde || (() => { const x = new Date(); x.setMonth(x.getMonth() - mesesAtras + 1); x.setDate(1); return x.toISOString().split('T')[0]; })();
  const h = hasta || hoy();

  const [ingresos, gastos] = await Promise.all([
    sequelize.query(`
      SELECT DATE_FORMAT(fecha_venta,'%Y-%m') mes, COALESCE(SUM(total),0) total
      FROM ventas WHERE fecha_venta BETWEEN :d AND CONCAT(:h,' 23:59:59') AND estado='completada'
      GROUP BY mes ORDER BY mes`,
      { replacements: { d, h }, type: QueryTypes.SELECT }),
    sequelize.query(`
      SELECT DATE_FORMAT(fecha_gasto,'%Y-%m') mes, COALESCE(SUM(monto),0) total
      FROM gastos WHERE fecha_gasto BETWEEN :d AND :h
      GROUP BY mes ORDER BY mes`,
      { replacements: { d, h }, type: QueryTypes.SELECT }),
  ]);

  const meses = [...new Set([...ingresos.map(r => r.mes), ...gastos.map(r => r.mes)])].sort();
  const iMap  = Object.fromEntries(ingresos.map(r => [r.mes, num(r.total)]));
  const gMap  = Object.fromEntries(gastos.map(r => [r.mes, num(r.total)]));

  return meses.map(mes => ({
    mes,
    label: mes,
    ingresos:  iMap[mes] || 0,
    gastos:    gMap[mes] || 0,
    ganancia: (iMap[mes] || 0) - (gMap[mes] || 0),
  }));
};

const getStockBajo = async () => {
  return sequelize.query(`
    SELECT p.id, p.nombre, p.codigo_barras, p.stock_actual, p.stock_minimo,
           cat.nombre categoria,
           (p.stock_minimo - p.stock_actual) faltante
    FROM productos p
    LEFT JOIN categorias cat ON p.categoria_id=cat.id
    WHERE p.stock_actual <= p.stock_minimo AND p.activo=1
    ORDER BY faltante DESC`,
    { type: QueryTypes.SELECT });
};

const getProductosPorVencer = async (dias = 21) => {
  return sequelize.query(`
    SELECT p.nombre, p.codigo_barras, il.numero_lote,
           il.fecha_caducidad, il.cantidad_actual,
           DATEDIFF(il.fecha_caducidad, CURDATE()) dias_restantes,
           il.estado
    FROM inventario_lotes il
    JOIN productos p ON il.producto_id=p.id
    WHERE il.fecha_caducidad IS NOT NULL
      AND il.fecha_caducidad <= DATE_ADD(CURDATE(), INTERVAL :dias DAY)
      AND il.estado NOT IN ('agotado')
      AND il.cantidad_actual > 0
    ORDER BY il.fecha_caducidad ASC`,
    { replacements: { dias }, type: QueryTypes.SELECT });
};

const getValorInventario = async () => {
  return sequelize.query(`
    SELECT cat.nombre categoria,
           SUM(il.cantidad_actual) unidades,
           COALESCE(SUM(il.cantidad_actual * p.precio_compra),0) valor_costo,
           COALESCE(SUM(il.cantidad_actual * p.precio_venta),0) valor_venta
    FROM inventario_lotes il
    JOIN productos p ON il.producto_id=p.id
    LEFT JOIN categorias cat ON p.categoria_id=cat.id
    WHERE il.estado='disponible'
    GROUP BY cat.id, cat.nombre
    ORDER BY valor_venta DESC`,
    { type: QueryTypes.SELECT });
};

const getRotacionInventario = async (desde = hace30(), hasta = hoy()) => {
  return sequelize.query(`
    SELECT p.nombre, p.codigo_barras,
           p.stock_actual,
           COALESCE(SUM(vd.cantidad),0) vendido_periodo,
           CASE WHEN p.stock_actual > 0
                THEN ROUND(COALESCE(SUM(vd.cantidad),0) / p.stock_actual, 2)
                ELSE NULL END rotacion
    FROM productos p
    LEFT JOIN ventas_detalles vd ON vd.producto_id=p.id
    LEFT JOIN ventas v ON vd.venta_id=v.id
      AND v.fecha_venta BETWEEN :desde AND CONCAT(:hasta,' 23:59:59')
      AND v.estado='completada'
    WHERE p.activo=1
    GROUP BY p.id, p.nombre, p.codigo_barras, p.stock_actual
    ORDER BY rotacion DESC
    LIMIT 50`,
    { replacements: { desde, hasta }, type: QueryTypes.SELECT });
};

const getCarteraCreditos = async () => {
  return sequelize.query(`
    SELECT cc.nombre, cc.cedula, cc.telefono,
           COUNT(c.id) num_creditos,
           COALESCE(SUM(c.monto_total),0) total_otorgado,
           COALESCE(SUM(c.saldo_pendiente),0) saldo_pendiente,
           MAX(c.fecha_vencimiento) proxima_vencimiento
    FROM clientes_credito cc
    JOIN creditos c ON c.cliente_id=cc.id
    WHERE c.estado IN ('pendiente','parcial','vencido')
    GROUP BY cc.id, cc.nombre, cc.cedula, cc.telefono
    ORDER BY saldo_pendiente DESC`,
    { type: QueryTypes.SELECT });
};

module.exports = {
  getKPIs, getVentasUltimos7Dias, getTopProductosHoy, getUltimasVentas,
  getVentasPorPeriodo, getProductosMasVendidos, getVentasPorCategoria,
  getVentasPorCajero, getIngresosVsGastos, getStockBajo,
  getProductosPorVencer, getValorInventario, getRotacionInventario, getCarteraCreditos,
};
