const nodemailer = require('nodemailer');
const logger = require('../../../shared/utils/logger');

class EmailService {
  constructor() {
    this.configured = !!(
      process.env.EMAIL_HOST &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS &&
      process.env.EMAIL_ADMIN_TO
    );

    if (this.configured) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
  }

  /**
   * Envía un resumen de las nuevas alertas generadas.
   * @param {Array} alertas - Array de objetos Alerta recién creados
   */
  async enviarResumenAlertas(alertas) {
    if (!this.configured) {
      logger.info('Email no configurado, omitiendo envío de alertas');
      return;
    }

    if (!alertas || alertas.length === 0) return;

    try {
      const criticas = alertas.filter(a => a.prioridad === 'critica');
      const altas    = alertas.filter(a => a.prioridad === 'alta');
      const medias   = alertas.filter(a => a.prioridad === 'media');
      const bajas    = alertas.filter(a => a.prioridad === 'baja');

      const asunto = criticas.length > 0
        ? `🚨 [SuperMapache] ${criticas.length} alertas CRÍTICAS — ${new Date().toLocaleDateString('es-EC')}`
        : `⚠️ [SuperMapache] ${alertas.length} alertas nuevas — ${new Date().toLocaleDateString('es-EC')}`;

      const filaAlerta = (a) => {
        const icono = { critica: '🚨', alta: '⚠️', media: '📋', baja: 'ℹ️' }[a.prioridad] || '📋';
        return `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${icono} <b>${a.prioridad.toUpperCase()}</b></td>
          <td style="padding:8px;border-bottom:1px solid #eee">${a.titulo}</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${a.mensaje}</td>
        </tr>`;
      };

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto">
          <h2 style="background:#1a56db;color:white;padding:16px;margin:0">SuperMapache — Resumen de Alertas</h2>
          <p style="padding:12px;background:#f9fafb">${new Date().toLocaleString('es-EC')} — Se generaron <b>${alertas.length}</b> alertas nuevas.</p>

          ${criticas.length > 0 ? `<h3 style="color:#dc2626;padding:0 12px">🚨 Críticas (${criticas.length})</h3>` : ''}
          ${altas.length > 0   ? `<h3 style="color:#d97706;padding:0 12px">⚠️ Altas (${altas.length})</h3>` : ''}

          <table style="width:100%;border-collapse:collapse;margin:8px 0">
            <thead>
              <tr style="background:#f3f4f6">
                <th style="padding:8px;text-align:left">Prioridad</th>
                <th style="padding:8px;text-align:left">Título</th>
                <th style="padding:8px;text-align:left">Detalle</th>
              </tr>
            </thead>
            <tbody>
              ${[...criticas, ...altas, ...medias, ...bajas].map(filaAlerta).join('')}
            </tbody>
          </table>

          <p style="padding:12px;color:#6b7280;font-size:12px">
            Este es un mensaje automático de SuperMapache. Accede al sistema para ver y gestionar las alertas.
          </p>
        </div>
      `;

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || `SuperMapache <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_ADMIN_TO,
        subject: asunto,
        html
      });

      logger.info(`Email de alertas enviado a ${process.env.EMAIL_ADMIN_TO} (${alertas.length} alertas)`);
    } catch (error) {
      logger.error('Error al enviar email de alertas:', error);
      // No propagamos el error — el email es best-effort
    }
  }
}

module.exports = new EmailService();
