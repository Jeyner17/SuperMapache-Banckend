module.exports = {
  // Estados de compras
  COMPRA_PENDIENTE: 'pendiente',
  COMPRA_EN_RECEPCION: 'en_recepcion',
  COMPRA_RECIBIDA: 'recibida',
  COMPRA_ANULADA: 'anulada',
  
  // Estados de lotes de inventario
  LOTE_DISPONIBLE: 'disponible',
  LOTE_POR_VENCER: 'por_vencer',
  LOTE_VENCIDO: 'vencido',
  LOTE_AGOTADO: 'agotado',
  
  // Estados de alertas
  ALERTA_PENDIENTE: 'pendiente',
  ALERTA_LEIDA: 'leida',
  ALERTA_RESUELTA: 'resuelta',
  
  // Prioridades de alertas
  PRIORIDAD_BAJA: 'baja',
  PRIORIDAD_MEDIA: 'media',
  PRIORIDAD_ALTA: 'alta',
  PRIORIDAD_CRITICA: 'critica',
  
  // Estados de créditos
  CREDITO_ACTIVO: 'activo',
  CREDITO_PAGADO: 'pagado',
  CREDITO_VENCIDO: 'vencido',
  CREDITO_CANCELADO: 'cancelado',
  
  // Estados de caja
  CAJA_ABIERTA: 'abierta',
  CAJA_CERRADA: 'cerrada',
};