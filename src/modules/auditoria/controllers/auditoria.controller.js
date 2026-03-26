const auditoriaService = require('../services/auditoria.service');
const ApiResponse      = require('../../../shared/utils/response');

const getAuditorias = async (req, res) => {
  try {
    const result = await auditoriaService.getAuditorias(req.query);
    ApiResponse.success(res, result);
  } catch (err) {
    ApiResponse.serverError(res, err.message);
  }
};

const getModulos = async (req, res) => {
  try {
    const modulos = await auditoriaService.getModulos();
    ApiResponse.success(res, modulos);
  } catch (err) {
    ApiResponse.serverError(res, err.message);
  }
};

const getUsuarios = async (req, res) => {
  try {
    const usuarios = await auditoriaService.getUsuarios();
    ApiResponse.success(res, usuarios);
  } catch (err) {
    ApiResponse.serverError(res, err.message);
  }
};

module.exports = { getAuditorias, getModulos, getUsuarios };
