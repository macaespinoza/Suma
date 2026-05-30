// =============================================================================
// SUMA — Controlador de Condominios
// Capa HTTP: recibe request, llama al servicio, devuelve response.
// =============================================================================

import * as servicio from '../servicios/condominios.servicio.js';
import { respuestaExitosa, respuestaCreado, respuestaSinContenido } from '../utilidades/respuesta.js';

/**
 * GET /api/v1/condominios
 * Lista todos los condominios activos.
 */
export const listar = async (req, res, next) => {
  try {
    const condominios = await servicio.listarTodos();
    return respuestaExitosa(res, condominios);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/condominios/:id
 * Obtiene un condominio por ID.
 */
export const obtenerPorId = async (req, res, next) => {
  try {
    const condominio = await servicio.obtenerPorId(req.params.id);
    return respuestaExitosa(res, condominio);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/condominios
 * Crea un nuevo condominio.
 */
export const crear = async (req, res, next) => {
  try {
    const condominio = await servicio.crear(req.body);
    return respuestaCreado(res, condominio);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/condominios/:id
 * Actualiza un condominio existente.
 */
export const actualizar = async (req, res, next) => {
  try {
    const condominio = await servicio.actualizar(req.params.id, req.body);
    return respuestaExitosa(res, condominio);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/condominios/:id
 * Desactiva un condominio (eliminación lógica).
 */
export const desactivar = async (req, res, next) => {
  try {
    await servicio.desactivar(req.params.id);
    return respuestaSinContenido(res);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/condominios/:id/unidades
 * Lista las unidades de un condominio.
 */
export const listarUnidades = async (req, res, next) => {
  try {
    const unidades = await servicio.listarUnidades(req.params.id);
    return respuestaExitosa(res, unidades);
  } catch (error) {
    next(error);
  }
};
