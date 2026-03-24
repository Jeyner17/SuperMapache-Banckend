const cajaService = require('../services/caja.service');
const ApiResponse = require('../../../shared/utils/response');
const logger = require('../../../shared/utils/logger');

class CajaController {
  /**
   * GET /api/caja/turno-activo
   */
  async getTurnoActivo(req, res) {
    try {
      const resumen = await cajaService.getResumenTurnoActivo(req.user.id);

      if (!resumen) {
        return ApiResponse.success(res, null, 'No hay turno abierto');
      }

      return ApiResponse.success(res, resumen, 'Turno activo obtenido');
    } catch (error) {
      logger.error('Error al obtener turno activo:', error);
      return ApiResponse.serverError(res, 'Error al obtener turno activo');
    }
  }

  /**
   * GET /api/caja/turnos
   */
  async getTurnos(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        estado: req.query.estado,
        usuario_id: req.query.usuario_id,
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin
      };

      const result = await cajaService.getTurnos(filters);

      return ApiResponse.success(res, result, 'Turnos obtenidos');
    } catch (error) {
      logger.error('Error al obtener turnos:', error);
      return ApiResponse.serverError(res, 'Error al obtener turnos');
    }
  }

  /**
   * GET /api/caja/turnos/:id
   */
  async getTurnoById(req, res) {
    try {
      const turno = await cajaService.getTurnoById(req.params.id);

      return ApiResponse.success(res, turno, 'Turno obtenido');
    } catch (error) {
      logger.error('Error al obtener turno:', error);
      if (error.message === 'Turno no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.serverError(res, 'Error al obtener turno');
    }
  }

  /**
   * GET /api/caja/turnos/:id/movimientos
   */
  async getMovimientos(req, res) {
    try {
      const movimientos = await cajaService.getMovimientos(req.params.id);

      return ApiResponse.success(res, movimientos, 'Movimientos obtenidos');
    } catch (error) {
      logger.error('Error al obtener movimientos:', error);
      if (error.message === 'Turno no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.serverError(res, 'Error al obtener movimientos');
    }
  }

  /**
   * POST /api/caja/abrir
   */
  async abrirTurno(req, res) {
    try {
      const turno = await cajaService.abrirTurno(req.body, req.user.id);

      return ApiResponse.created(res, turno, 'Turno abierto exitosamente');
    } catch (error) {
      logger.error('Error al abrir turno:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * POST /api/caja/cerrar
   */
  async cerrarTurno(req, res) {
    try {
      // Buscar el turno activo del usuario si no se pasa ID
      const { turno_id, total_real, notas } = req.body;

      let id = turno_id;

      if (!id) {
        const turnoActivo = await cajaService.getTurnoActivo(req.user.id);
        if (!turnoActivo) {
          return ApiResponse.error(res, 'No tienes un turno de caja abierto', 400);
        }
        id = turnoActivo.id;
      }

      const turno = await cajaService.cerrarTurno(id, { total_real, notas }, req.user.id);

      return ApiResponse.success(res, turno, 'Turno cerrado exitosamente');
    } catch (error) {
      logger.error('Error al cerrar turno:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  /**
   * POST /api/caja/movimientos
   */
  async registrarMovimiento(req, res) {
    try {
      const turno = await cajaService.registrarMovimiento(req.body, req.user.id);

      return ApiResponse.created(res, turno, 'Movimiento registrado exitosamente');
    } catch (error) {
      logger.error('Error al registrar movimiento:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = new CajaController();
