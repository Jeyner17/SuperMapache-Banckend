/**
 * Utilidades para manejo de fechas
 */

class DateHelper {
  /**
   * Obtiene la fecha actual en formato MySQL
   */
  static now() {
    return new Date();
  }

  /**
   * Formatea fecha a DD/MM/YYYY
   */
  static formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Formatea fecha a YYYY-MM-DD (MySQL)
   */
  static toMySQLDate(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  /**
   * Calcula diferencia en días entre dos fechas
   */
  static daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Agrega días a una fecha
   */
  static addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Verifica si una fecha ya pasó
   */
  static isPast(date) {
    return new Date(date) < new Date();
  }

  /**
   * Verifica si una fecha está dentro de X días
   */
  static isWithinDays(date, days) {
    const targetDate = new Date(date);
    const futureDate = this.addDays(new Date(), days);
    return targetDate <= futureDate && targetDate >= new Date();
  }
}

module.exports = DateHelper;