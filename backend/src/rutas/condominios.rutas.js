// =============================================================================
// SUMA — Rutas de Condominios
// Endpoints CRUD para la entidad raíz del sistema.
// =============================================================================

import { Router } from 'express';
import * as controlador from '../controladores/condominios.controlador.js';
// import { verificarAutenticacion } from '../middlewares/autenticacion.js';
// import { validar } from '../middlewares/validacion.js';

const router = Router();

/**
 * GET /api/v1/condominios
 * Lista todos los condominios activos.
 */
router.get('/', controlador.listar);

/**
 * GET /api/v1/condominios/:id
 * Obtiene un condominio por su ID.
 */
router.get('/:id', controlador.obtenerPorId);

/**
 * POST /api/v1/condominios
 * Crea un nuevo condominio.
 */
router.post('/', controlador.crear);

/**
 * PUT /api/v1/condominios/:id
 * Actualiza un condominio existente.
 */
router.put('/:id', controlador.actualizar);

/**
 * DELETE /api/v1/condominios/:id
 * Desactiva un condominio (eliminación lógica).
 */
router.delete('/:id', controlador.desactivar);

/**
 * GET /api/v1/condominios/:id/unidades
 * Lista las unidades vecinales de un condominio específico.
 */
router.get('/:id/unidades', controlador.listarUnidades);

export default router;
