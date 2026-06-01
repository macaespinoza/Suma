// =============================================================================
// SUMA — Rutas de Unidades Vecinales
// Endpoints CRUD para unidades (departamentos, casas) dentro de condominios.
// =============================================================================

import { Router } from 'express';
import * as controlador from '../controladores/unidades.controlador.js';
// import { verificarAutenticacion } from '../middlewares/autenticacion.js';
import { validar } from '../middlewares/validacion.js';
import { esquemaCrearUnidad, esquemaActualizarUnidad, esquemaCrearUnidadesLote } from '../validaciones/unidades.validacion.js';

const router = Router();

/**
 * GET /api/v1/unidades/:id
 * Obtiene una unidad vecinal por su ID.
 */
router.get('/:id', controlador.obtenerPorId);

/**
 * POST /api/v1/unidades/lote
 * Crea múltiples unidades vecinales en lote.
 */
router.post('/lote', validar(esquemaCrearUnidadesLote, 'body'), controlador.crearLote);

/**
 * POST /api/v1/unidades
 * Crea una nueva unidad vecinal.
 */
router.post('/', validar(esquemaCrearUnidad, 'body'), controlador.crear);

/**
 * PUT /api/v1/unidades/:id
 * Actualiza una unidad vecinal existente.
 */
router.put('/:id', validar(esquemaActualizarUnidad, 'body'), controlador.actualizar);

/**
 * DELETE /api/v1/unidades/:id
 * Desactiva una unidad vecinal (eliminación lógica).
 */
router.delete('/:id', controlador.desactivar);

export default router;
