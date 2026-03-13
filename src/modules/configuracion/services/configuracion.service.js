const { Configuracion } = require('../models');
const { Op } = require('sequelize');
const logger = require('../../../shared/utils/logger');

class ConfiguracionService {
  /**
   * Obtener todas las configuraciones (agrupadas por categoría)
   */
  async getAll() {
    try {
      const configuraciones = await Configuracion.findAll({
        order: [['categoria', 'ASC'], ['clave', 'ASC']]
      });

      // Agrupar por categoría
      const agrupadas = configuraciones.reduce((acc, config) => {
        if (!acc[config.categoria]) {
          acc[config.categoria] = [];
        }
        
        acc[config.categoria].push({
          id: config.id,
          clave: config.clave,
          valor: this.parsearValor(config.valor, config.tipo),
          tipo: config.tipo,
          descripcion: config.descripcion
        });
        
        return acc;
      }, {});

      return agrupadas;
    } catch (error) {
      logger.error('Error al obtener configuraciones:', error);
      throw error;
    }
  }

  /**
   * Obtener configuraciones públicas (sin autenticación)
   */
  async getPublicas() {
    try {
      const configuraciones = await Configuracion.findAll({
        where: { es_publica: true }
      });

      const config = {};
      configuraciones.forEach(item => {
        config[item.clave] = this.parsearValor(item.valor, item.tipo);
      });

      return config;
    } catch (error) {
      logger.error('Error al obtener configuraciones públicas:', error);
      throw error;
    }
  }

  /**
   * Obtener configuración por clave
   */
  async getByClave(clave) {
    try {
      const config = await Configuracion.findOne({
        where: { clave }
      });

      if (!config) {
        return null;
      }

      return this.parsearValor(config.valor, config.tipo);
    } catch (error) {
      logger.error('Error al obtener configuración:', error);
      throw error;
    }
  }

  /**
   * Obtener múltiples configuraciones por claves
   */
  async getByClaves(claves) {
    try {
      const configuraciones = await Configuracion.findAll({
        where: {
          clave: { [Op.in]: claves }
        }
      });

      const config = {};
      configuraciones.forEach(item => {
        config[item.clave] = this.parsearValor(item.valor, item.tipo);
      });

      return config;
    } catch (error) {
      logger.error('Error al obtener configuraciones:', error);
      throw error;
    }
  }

  /**
   * Obtener configuraciones por categoría
   */
  async getByCategoria(categoria) {
    try {
      const configuraciones = await Configuracion.findAll({
        where: { categoria },
        order: [['clave', 'ASC']]
      });

      return configuraciones.map(config => ({
        id: config.id,
        clave: config.clave,
        valor: this.parsearValor(config.valor, config.tipo),
        tipo: config.tipo,
        descripcion: config.descripcion
      }));
    } catch (error) {
      logger.error('Error al obtener configuraciones por categoría:', error);
      throw error;
    }
  }

  /**
   * Actualizar configuración
   */
  async update(clave, nuevoValor) {
    try {
      const config = await Configuracion.findOne({
        where: { clave }
      });

      if (!config) {
        throw new Error(`Configuración '${clave}' no encontrada`);
      }

      // Validar y serializar valor según tipo
      const valorSerializado = this.serializarValor(nuevoValor, config.tipo);

      await config.update({
        valor: valorSerializado
      });

      logger.info(`Configuración actualizada: ${clave} = ${valorSerializado}`);

      return this.parsearValor(valorSerializado, config.tipo);
    } catch (error) {
      logger.error('Error al actualizar configuración:', error);
      throw error;
    }
  }

  /**
   * Actualizar múltiples configuraciones
   */
  async updateMultiple(configuraciones) {
    try {
      const resultados = [];

      for (const config of configuraciones) {
        const valorActualizado = await this.update(config.clave, config.valor);
        resultados.push({
          clave: config.clave,
          valor: valorActualizado
        });
      }

      return resultados;
    } catch (error) {
      logger.error('Error al actualizar múltiples configuraciones:', error);
      throw error;
    }
  }

  /**
   * Parsear valor según tipo
   */
  parsearValor(valor, tipo) {
    if (valor === null || valor === undefined) {
      return null;
    }

    switch (tipo) {
      case 'numero':
      case 'porcentaje':
        return parseFloat(valor);
      
      case 'boolean':
        return valor === 'true' || valor === true;
      
      case 'json':
        try {
          return JSON.parse(valor);
        } catch {
          return valor;
        }
      
      default:
        return valor;
    }
  }

  /**
   * Serializar valor para almacenar
   */
  serializarValor(valor, tipo) {
    if (valor === null || valor === undefined) {
      return null;
    }

    switch (tipo) {
      case 'numero':
      case 'porcentaje':
        return String(parseFloat(valor));
      
      case 'boolean':
        return String(Boolean(valor));
      
      case 'json':
        return typeof valor === 'string' ? valor : JSON.stringify(valor);
      
      default:
        return String(valor);
    }
  }

  /**
   * Helper: Obtener IVA configurado
   */
  async getIVA() {
    return await this.getByClave('impuesto_iva') || 12;
  }

  /**
   * Helper: Obtener datos de empresa
   */
  async getDatosEmpresa() {
    const claves = [
      'empresa_nombre',
      'empresa_razon_social',
      'empresa_ruc',
      'empresa_direccion',
      'empresa_ciudad',
      'empresa_pais',
      'empresa_telefono',
      'empresa_celular',
      'empresa_email',
      'empresa_sitio_web',
      'empresa_logo'
    ];

    return await this.getByClaves(claves);
  }
}

module.exports = new ConfiguracionService();