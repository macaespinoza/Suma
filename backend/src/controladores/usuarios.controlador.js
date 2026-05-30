// =============================================================================
// SUMA — Controlador de Usuarios
// Capa HTTP: recibe request, llama al servicio, devuelve response.
// =============================================================================

import * as servicio from '../servicios/usuarios.servicio.js';
import { respuestaExitosa, respuestaCreado, respuestaSinContenido } from '../utilidades/respuesta.js';

/**
 * GET /api/v1/usuarios
 * Lista todos los usuarios activos.
 */
export const listar = async (req, res, next) => {
  try {
    const usuarios = await servicio.listarTodos();
    return respuestaExitosa(res, usuarios);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/usuarios/:id
 * Obtiene un usuario por ID.
 */
export const obtenerPorId = async (req, res, next) => {
  try {
    const usuario = await servicio.obtenerPorId(req.params.id);
    return respuestaExitosa(res, usuario);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/usuarios
 * Registra un nuevo usuario.
 */
export const crear = async (req, res, next) => {
  try {
    const usuario = await servicio.crear(req.body);
    return respuestaCreado(res, usuario);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/usuarios/:id
 * Actualiza datos de un usuario.
 */
export const actualizar = async (req, res, next) => {
  try {
    const usuario = await servicio.actualizar(req.params.id, req.body);
    return respuestaExitosa(res, usuario);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/usuarios/:id
 * Eliminación lógica de un usuario.
 */
export const eliminar = async (req, res, next) => {
  try {
    await servicio.eliminar(req.params.id);
    return respuestaSinContenido(res);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/usuarios/verificar
 * Verifica token Firebase y retorna usuario de PostgreSQL.
 * Si no existe, retorna null (el frontend debe redirigir al formulario de registro).
 */
export const verificar = async (req, res, next) => {
  try {
    const { firebase_uid } = req.body;
    const usuario = await servicio.verificarPorFirebaseUid(firebase_uid);
    return respuestaExitosa(res, {
      registrado: !!usuario,
      usuario,
    });
  } catch (error) {
    next(error);
  }
};
