// =============================================================================
// SUMA — Servicio de Condominios
// Capa de lógica de negocio. Orquesta repositorios y validaciones.
// =============================================================================

import * as repositorio from '../repositorios/condominios.repositorio.js';
import { ErrorApp } from '../middlewares/errores.js';

/**
 * Lista todos los condominios activos.
 * @returns {Promise<Array>}
 */
export const listarTodos = async () => {
  return await repositorio.obtenerTodos();
};

/**
 * Obtiene un condominio por ID.
 * Lanza ErrorApp 404 si no se encuentra.
 * @param {string} id - UUID del condominio.
 * @returns {Promise<object>}
 */
export const obtenerPorId = async (id) => {
  const condominio = await repositorio.obtenerPorId(id);
  if (!condominio) {
    throw new ErrorApp('Condominio no encontrado.', 404);
  }
  return condominio;
};

/**
 * Crea un nuevo condominio.
 * TODO (Open Code): Agregar validaciones de negocio adicionales.
 * @param {object} datos - Datos del condominio.
 * @returns {Promise<object>} Condominio creado.
 */
export const crear = async (datos) => {
  return await repositorio.crear(datos);
};

/**
 * Actualiza un condominio existente.
 * @param {string} id - UUID del condominio.
 * @param {object} datos - Campos a actualizar.
 * @returns {Promise<object>} Condominio actualizado.
 */
export const actualizar = async (id, datos) => {
  const condominio = await repositorio.actualizar(id, datos);
  if (!condominio) {
    throw new ErrorApp('Condominio no encontrado o ya está desactivado.', 404);
  }
  return condominio;
};

/**
 * Desactiva un condominio (eliminación lógica).
 * @param {string} id - UUID del condominio.
 * @returns {Promise<void>}
 */
export const desactivar = async (id) => {
  const resultado = await repositorio.desactivar(id);
  if (!resultado) {
    throw new ErrorApp('Condominio no encontrado o ya está desactivado.', 404);
  }
};

/**
 * Lista las unidades vecinales de un condominio.
 * Verifica primero que el condominio existe.
 * @param {string} condominioId - UUID del condominio.
 * @returns {Promise<Array>}
 */
export const listarUnidades = async (condominioId) => {
  // Verificar que el condominio existe.
  await obtenerPorId(condominioId);
  return await repositorio.obtenerUnidades(condominioId);
};
