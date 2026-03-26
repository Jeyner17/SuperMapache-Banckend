const gastoService = require('../services/gasto.service');
const ApiResponse  = require('../../../shared/utils/response');

const getGastos = async (req, res) => {
  try {
    const result = await gastoService.getGastos(req.query);
    ApiResponse.success(res, result);
  } catch (err) {
    ApiResponse.serverError(res, err.message);
  }
};

const getResumen = async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const result = await gastoService.getResumen(mes, anio);
    ApiResponse.success(res, result);
  } catch (err) {
    ApiResponse.serverError(res, err.message);
  }
};

const getGastoById = async (req, res) => {
  try {
    const gasto = await gastoService.getGastoById(req.params.id);
    ApiResponse.success(res, gasto);
  } catch (err) {
    if (err.status === 404) return ApiResponse.notFound(res, err.message);
    ApiResponse.serverError(res, err.message);
  }
};

const crearGasto = async (req, res) => {
  try {
    const gasto = await gastoService.crearGasto(req.body, req.user.id);
    ApiResponse.created(res, gasto, 'Gasto registrado exitosamente');
  } catch (err) {
    ApiResponse.serverError(res, err.message);
  }
};

const actualizarGasto = async (req, res) => {
  try {
    const gasto = await gastoService.actualizarGasto(req.params.id, req.body);
    ApiResponse.success(res, gasto, 'Gasto actualizado exitosamente');
  } catch (err) {
    if (err.status === 404) return ApiResponse.notFound(res, err.message);
    ApiResponse.serverError(res, err.message);
  }
};

const eliminarGasto = async (req, res) => {
  try {
    await gastoService.eliminarGasto(req.params.id);
    ApiResponse.success(res, null, 'Gasto eliminado exitosamente');
  } catch (err) {
    if (err.status === 404) return ApiResponse.notFound(res, err.message);
    ApiResponse.serverError(res, err.message);
  }
};

module.exports = { getGastos, getResumen, getGastoById, crearGasto, actualizarGasto, eliminarGasto };
