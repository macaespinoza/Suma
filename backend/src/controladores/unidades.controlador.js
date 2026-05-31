// =============================================================================
// SUMA — Controlador de Unidades Vecinales
// Capa HTTP: recibe request, llama al servicio, devuelve response.
// =============================================================================

import * as servicio from '../servicios/unidades.servicio.js';
import { respuestaExitosa, respuestaCreado, respuestaSinContenido } from '../utilidades/respuesta.js';

/**
 * GET /api/v1/condominios/:condominioId/unidades
 * Lista todas las unidades activas de un condominio.
 */
export const listarPorCondominio = async (req, res, next) => {
  try {
    const unidades = await servicio.listarPorCondominio(req.params.condominioId);
    return respuestaExitosa(res, unidades);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/unidades/:id
 * Obtiene una unidad vecinal por ID.
 */
export const obtenerPorId = async (req, res, next) => {
  try {
    const unidad = await servicio.obtenerPorId(req.params.id);
    return respuestaExitosa(res, unidad);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/unidades
 * Crea una nueva unidad vecinal.
 */
export const crear = async (req, res, next) => {
  try {
    const unidad = await servicio.crear(req.body);
    return respuestaCreado(res, unidad);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/unidades/:id
 * Actualiza una unidad vecinal.
 */
export const actualizar = async (req, res, next) => {
  try {
    const unidad = await servicio.actualizar(req.params.id, req.body);
    return respuestaExitosa(res, unidad);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/unidades/:id
 * Desactiva una unidad vecinal.
 */
export const desactivar = async (req, res, next) => {
  try {
    await servicio.desactivar(req.params.id);
    return respuestaSinContenido(res);
  } catch (error) {
    next(error);
  }
};
