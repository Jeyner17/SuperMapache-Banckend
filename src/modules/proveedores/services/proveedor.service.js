const { Proveedor } = require('../models');
const { Compra } = require('../../compras/models');
const { Op } = require('sequelize');
const logger = require('../../../shared/utils/logger');

class ProveedorService {
  /**
   * Obtener todos los proveedores
   */
  async getAll(filters = {}) {
    try {
      const where = {};

      // Filtros
      if (filters.activo !== undefined) {
        where.activo = filters.activo;
      }

      if (filters.tipo_proveedor) {
        where.tipo_proveedor = filters.tipo_proveedor;
      }

      if (filters.search) {
        where[Op.or] = [
          { razon_social: { [Op.like]: `%${filters.search}%` } },
          { nombre_comercial: { [Op.like]: `%${filters.search}%` } },
          { ruc: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const proveedores = await Proveedor.findAll({
        where,
        order: [['razon_social', 'ASC']]
      });

      return proveedores;
    } catch (error) {
      logger.error('Error al obtener proveedores:', error);
      throw error;
    }
  }

  /**
   * Obtener proveedor por ID
   */
  async getById(id) {
    try {
      const proveedor = await Proveedor.findByPk(id, {
        include: [
          {
            model: Compra,
            as: 'compras',
            limit: 10,
            order: [['fecha_compra', 'DESC']],
            attributes: ['id', 'numero_compra', 'fecha_compra', 'total', 'estado']
          }
        ]
      });

      if (!proveedor) {
        throw new Error('Proveedor no encontrado');
      }

      return proveedor;
    } catch (error) {
      logger.error('Error al obtener proveedor:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo proveedor
   */
  async create(data) {
    try {
      // Validar RUC único si se proporciona
      if (data.ruc) {
        const existente = await Proveedor.findOne({
          where: { ruc: data.ruc }
        });
        if (existente) {
          throw new Error('Ya existe un proveedor con este RUC');
        }
      }

      const proveedor = await Proveedor.create(data);
      
      logger.info(`Proveedor creado: ${proveedor.razon_social}`);
      
      return proveedor;
    } catch (error) {
      logger.error('Error al crear proveedor:', error);
      throw error;
    }
  }

  /**
   * Actualizar proveedor
   */
  async update(id, data) {
    try {
      const proveedor = await Proveedor.findByPk(id);

      if (!proveedor) {
        throw new Error('Proveedor no encontrado');
      }

      // Validar RUC único si se está cambiando
      if (data.ruc && data.ruc !== proveedor.ruc) {
        const existente = await Proveedor.findOne({
          where: { 
            ruc: data.ruc,
            id: { [Op.ne]: id }
          }
        });
        if (existente) {
          throw new Error('Ya existe un proveedor con este RUC');
        }
      }

      await proveedor.update(data);
      
      logger.info(`Proveedor actualizado: ${proveedor.razon_social}`);
      
      return proveedor;
    } catch (error) {
      logger.error('Error al actualizar proveedor:', error);
      throw error;
    }
  }

  /**
   * Eliminar proveedor (soft delete)
   */
  async delete(id) {
    try {
      const proveedor = await Proveedor.findByPk(id, {
        include: [
          {
            model: Compra,
            as: 'compras'
          }
        ]
      });

      if (!proveedor) {
        throw new Error('Proveedor no encontrado');
      }

      // Verificar si tiene compras
      if (proveedor.compras && proveedor.compras.length > 0) {
        throw new Error('No se puede eliminar un proveedor con compras registradas');
      }

      // Soft delete
      await proveedor.update({ activo: false });
      
      logger.info(`Proveedor eliminado: ${proveedor.razon_social}`);
      
      return true;
    } catch (error) {
      logger.error('Error al eliminar proveedor:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de un proveedor
   */
  async getEstadisticas(id) {
    try {
      const proveedor = await Proveedor.findByPk(id, {
        include: [
          {
            model: Compra,
            as: 'compras'
          }
        ]
      });

      if (!proveedor) {
        throw new Error('Proveedor no encontrado');
      }

      const totalCompras = proveedor.compras.length;
      const montoTotal = proveedor.compras.reduce((sum, compra) => {
        return sum + parseFloat(compra.total);
      }, 0);

      const comprasPendientes = proveedor.compras.filter(c => 
        c.estado === 'pendiente' || c.estado === 'confirmada'
      ).length;

      const deudaTotal = proveedor.compras
        .filter(c => c.estado_pago === 'pendiente' || c.estado_pago === 'parcial')
        .reduce((sum, compra) => {
          return sum + (parseFloat(compra.total) - parseFloat(compra.monto_pagado));
        }, 0);

      return {
        total_compras: totalCompras,
        monto_total: montoTotal,
        compras_pendientes: comprasPendientes,
        deuda_total: deudaTotal,
        promedio_compra: totalCompras > 0 ? montoTotal / totalCompras : 0
      };
    } catch (error) {
      logger.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
}

module.exports = new ProveedorService();