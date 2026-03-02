/**
 * Utilidad para estandarizar respuestas HTTP
 */

class ApiResponse {
  static success(res, data = null, message = 'Operación exitosa', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res, message = 'Error en la operación', statusCode = 400, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  static created(res, data = null, message = 'Registro creado exitosamente') {
    return this.success(res, data, message, 201);
  }

  static notFound(res, message = 'Registro no encontrado') {
    return this.error(res, message, 404);
  }

  static unauthorized(res, message = 'No autorizado') {
    return this.error(res, message, 401);
  }

  static forbidden(res, message = 'No tiene permisos suficientes') {
    return this.error(res, message, 403);
  }

  static serverError(res, message = 'Error interno del servidor', error = null) {
    console.error('Server Error:', error);
    return this.error(res, message, 500, error?.message);
  }

  static validationError(res, errors) {
    return this.error(res, 'Error de validación', 422, errors);
  }
}

module.exports = ApiResponse;