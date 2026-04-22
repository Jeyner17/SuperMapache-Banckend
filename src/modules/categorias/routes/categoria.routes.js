const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoria.controller');
const { createCategoriaValidator, updateCategoriaValidator } = require('../validators/categoria.validator');
const { verifyToken, checkPermission } = require('../../../shared/middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * GET /api/categorias
 * Obtener todas las categorías
 */
router.get('/', categoriaController.getAll);

/**
 * GET /api/categorias/:id
 * Obtener categoría por ID
 */
router.get('/:id', categoriaController.getById);

/**
 * POST /api/categorias
 * Crear nueva categoría (solo admin y supervisor)
 */
router.post(
  '/',
  checkPermission('gestionar_inventario'),
  createCategoriaValidator,
  categoriaController.create
);

/**
 * PUT /api/categorias/:id
 * Actualizar categoría (solo admin y supervisor)
 */
router.put(
  '/:id',
  checkPermission('gestionar_inventario'),
  updateCategoriaValidator,
  categoriaController.update
);

/**
 * DELETE /api/categorias/:id
 * Eliminar categoría (admin y supervisor)
 */
router.delete(
  '/:id',
  checkPermission('gestionar_inventario'),
  categoriaController.delete
);

module.exports = router;