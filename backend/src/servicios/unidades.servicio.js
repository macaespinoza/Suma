// =============================================================================
// SUMA — Servicio de Unidades Vecinales
// Capa de lógica de negocio.
// =============================================================================

import * as repositorio from '../repositorios/unidades.repositorio.js';
import { ErrorApp } from '../middlewares/errores.js';

/**
 * Obtiene una unidad vecinal por ID.
 * @param {string} id - UUID de la unidad.
 * @returns {Promise<object>}
 */
export const obtenerPorId = async (id) => {
  const unidad = await repositorio.obtenerPorId(id);
  if (!unidad) {
    throw new ErrorApp('Unidad vecinal no encontrada.', 404);
  }
  return unidad;
};

/**
 * Crea una nueva unidad vecinal.
 * TODO (Open Code): Validar que la suma de alícuotas del condominio no supere 1.0000.
 * @param {object} datos
 * @returns {Promise<object>}
 */
export const crear = async (datos) => {
  return await repositorio.crear(datos);
};

/**
 * Actualiza una unidad vecinal.
 * @param {string} id
 * @param {object} datos
 * @returns {Promise<object>}
 */
export const actualizar = async (id, datos) => {
  const unidad = await repositorio.actualizar(id, datos);
  if (!unidad) {
    throw new ErrorApp('Unidad vecinal no encontrada o ya está desactivada.', 404);
  }
  return unidad;
};

/**
 * Desactiva una unidad vecinal.
 * TODO (Open Code): Verificar que no existan cobros pendientes antes de desactivar.
 * @param {string} id
 * @returns {Promise<void>}
 */
export const desactivar = async (id) => {
  const resultado = await repositorio.desactivar(id);
  if (!resultado) {
    throw new ErrorApp('Unidad vecinal no encontrada o ya está desactivada.', 404);
  }
};
