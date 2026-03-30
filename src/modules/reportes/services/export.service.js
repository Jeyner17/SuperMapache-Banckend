const ExcelJS = require('exceljs');

const ESTILOS = {
  headerFill:   { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } },
  headerFont:   { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
  totalFill:    { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4FD' } },
  totalFont:    { bold: true, size: 11 },
  moneyFormat:  '"$"#,##0.00',
  border: {
    top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
  },
};

const aplicarEstiloFila = (row, esHeader = false, esTotal = false) => {
  row.eachCell(cell => {
    cell.border = ESTILOS.border;
    if (esHeader) { cell.fill = ESTILOS.headerFill; cell.font = ESTILOS.headerFont; cell.alignment = { horizontal: 'center' }; }
    if (esTotal)  { cell.fill = ESTILOS.totalFill;  cell.font = ESTILOS.totalFont; }
  });
};

// ── Ventas por período ────────────────────────────────────────────────────────
const excelVentasPorPeriodo = async (datos, desde, hasta) => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'SuperMapache';
  const ws = wb.addWorksheet('Ventas por Período');

  ws.mergeCells('A1:E1');
  ws.getCell('A1').value = `SuperMapache — Reporte de Ventas del ${desde} al ${hasta}`;
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
  ws.getCell('A1').alignment = { horizontal: 'center' };

  ws.addRow([]);

  const header = ws.addRow(['Período', 'Fecha inicio', 'N° Ventas', 'Total ($)', 'Descuentos ($)']);
  aplicarEstiloFila(header, true);

  ws.columns = [
    { key: 'periodo', width: 20 },
    { key: 'fecha',   width: 15 },
    { key: 'cant',    width: 12 },
    { key: 'total',   width: 15 },
    { key: 'desc',    width: 15 },
  ];

  let sumTotal = 0, sumCant = 0;
  datos.forEach(r => {
    const row = ws.addRow([r.periodo, r.fecha_inicio, parseInt(r.cantidad), parseFloat(r.total), parseFloat(r.descuento)]);
    row.getCell(4).numFmt = ESTILOS.moneyFormat;
    row.getCell(5).numFmt = ESTILOS.moneyFormat;
    aplicarEstiloFila(row);
    sumTotal += parseFloat(r.total); sumCant += parseInt(r.cantidad);
  });

  const totRow = ws.addRow(['TOTAL', '', sumCant, sumTotal, '']);
  totRow.getCell(4).numFmt = ESTILOS.moneyFormat;
  aplicarEstiloFila(totRow, false, true);

  return wb;
};

// ── Productos más vendidos ────────────────────────────────────────────────────
const excelProductosMasVendidos = async (datos, desde, hasta) => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'SuperMapache';
  const ws = wb.addWorksheet('Top Productos');

  ws.mergeCells('A1:F1');
  ws.getCell('A1').value = `SuperMapache — Top Productos Vendidos del ${desde} al ${hasta}`;
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
  ws.getCell('A1').alignment = { horizontal: 'center' };
  ws.addRow([]);

  const header = ws.addRow(['#', 'Producto', 'Categoría', 'Código', 'Unidades', 'Total ($)']);
  aplicarEstiloFila(header, true);
  ws.columns = [{ width: 5 }, { width: 35 }, { width: 18 }, { width: 15 }, { width: 12 }, { width: 15 }];

  datos.forEach((r, i) => {
    const row = ws.addRow([i + 1, r.nombre, r.categoria || '—', r.codigo_barras, parseFloat(r.cantidad_vendida), parseFloat(r.total_vendido)]);
    row.getCell(6).numFmt = ESTILOS.moneyFormat;
    aplicarEstiloFila(row);
  });

  return wb;
};

// ── Ingresos vs Gastos ────────────────────────────────────────────────────────
const excelIngresosVsGastos = async (datos) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Financiero');

  ws.mergeCells('A1:D1');
  ws.getCell('A1').value = 'SuperMapache — Ingresos vs Gastos';
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
  ws.getCell('A1').alignment = { horizontal: 'center' };
  ws.addRow([]);

  const header = ws.addRow(['Mes', 'Ingresos ($)', 'Gastos ($)', 'Ganancia ($)']);
  aplicarEstiloFila(header, true);
  ws.columns = [{ width: 12 }, { width: 15 }, { width: 15 }, { width: 15 }];

  let sumI = 0, sumG = 0;
  datos.forEach(r => {
    const row = ws.addRow([r.mes, r.ingresos, r.gastos, r.ganancia]);
    [2, 3, 4].forEach(c => { row.getCell(c).numFmt = ESTILOS.moneyFormat; });
    if (r.ganancia < 0) row.getCell(4).font = { color: { argb: 'FFCC0000' } };
    aplicarEstiloFila(row);
    sumI += r.ingresos; sumG += r.gastos;
  });

  const tot = ws.addRow(['TOTAL', sumI, sumG, sumI - sumG]);
  [2, 3, 4].forEach(c => { tot.getCell(c).numFmt = ESTILOS.moneyFormat; });
  aplicarEstiloFila(tot, false, true);

  return wb;
};

// ── Stock bajo ────────────────────────────────────────────────────────────────
const excelStockBajo = async (datos) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Stock Bajo');

  ws.mergeCells('A1:E1');
  ws.getCell('A1').value = `SuperMapache — Productos con Stock Bajo (${new Date().toLocaleDateString('es')})`;
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
  ws.getCell('A1').alignment = { horizontal: 'center' };
  ws.addRow([]);

  const header = ws.addRow(['Código', 'Producto', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Faltante']);
  aplicarEstiloFila(header, true);
  ws.columns = [{ width: 15 }, { width: 35 }, { width: 18 }, { width: 13 }, { width: 13 }, { width: 11 }];

  datos.forEach(r => {
    const row = ws.addRow([r.codigo_barras, r.nombre, r.categoria || '—', r.stock_actual, r.stock_minimo, r.faltante]);
    if (r.stock_actual === 0) row.font = { color: { argb: 'FFCC0000' }, bold: true };
    aplicarEstiloFila(row);
  });

  return wb;
};

// ── Por vencer ────────────────────────────────────────────────────────────────
const excelPorVencer = async (datos) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Por Vencer');

  ws.mergeCells('A1:F1');
  ws.getCell('A1').value = 'SuperMapache — Productos Próximos a Vencer';
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
  ws.getCell('A1').alignment = { horizontal: 'center' };
  ws.addRow([]);

  const header = ws.addRow(['Producto', 'Código', 'Lote', 'Caducidad', 'Días restantes', 'Stock', 'Estado']);
  aplicarEstiloFila(header, true);
  ws.columns = [{ width: 30 }, { width: 15 }, { width: 12 }, { width: 13 }, { width: 15 }, { width: 9 }, { width: 12 }];

  datos.forEach(r => {
    const row = ws.addRow([r.nombre, r.codigo_barras, r.numero_lote, r.fecha_caducidad, r.dias_restantes, r.cantidad_actual, r.estado]);
    if (r.dias_restantes <= 0) row.font = { color: { argb: 'FFCC0000' }, bold: true };
    else if (r.dias_restantes <= 7) row.font = { color: { argb: 'FFCC6600' } };
    aplicarEstiloFila(row);
  });

  return wb;
};

// ── Enviar workbook como response ─────────────────────────────────────────────
const enviarExcel = async (res, wb, filename) => {
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
};

module.exports = {
  excelVentasPorPeriodo, excelProductosMasVendidos, excelIngresosVsGastos,
  excelStockBajo, excelPorVencer, enviarExcel,
};
