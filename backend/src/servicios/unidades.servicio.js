// =============================================================================
// SUMA — Servicio de Unidades Vecinales
// Capa de lógica de negocio.
// =============================================================================

import * as repositorio from '../repositorios/unidades.repositorio.js';
import * as condominiosRepositorio from '../repositorios/condominios.repositorio.js';
import { ErrorApp } from '../middlewares/errores.js';

/**
 * Lista las unidades vecinales activas de un condominio.
 * @param {string} condominioId - UUID del condominio.
 * @returns {Promise<Array>}
 */
export const listarPorCondominio = async (condominioId) => {
  return await repositorio.listarPorCondominio(condominioId);
};

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

/**
 * Crea múltiples unidades vecinales en lote para un condominio.
 * Valida que la suma de alícuotas totales no supere 1.0001 (100% aprox).
 * @param {string} condominioId - UUID del condominio.
 * @param {Array} unidades - Lista de unidades a crear.
 * @returns {Promise<Array>}
 */
export const crearLote = async (condominioId, unidades) => {
  // 1. Verificar existencia del condominio
  const condominio = await condominiosRepositorio.obtenerPorId(condominioId);
  if (!condominio) {
    throw new ErrorApp('Condominio no encontrado.', 404);
  }

  // 2. Calcular la suma de alícuotas a insertar
  const sumaNuevas = unidades.reduce((suma, u) => suma + parseFloat(u.alicuota), 0);

  // 3. Obtener alícuotas existentes
  const existentes = await repositorio.listarPorCondominio(condominioId);
  const sumaExistentes = existentes.reduce((suma, u) => suma + parseFloat(u.alicuota), 0);

  // Tolerancia de 1.0001 para mitigar redondeo de punto flotante en la UI
  if (sumaExistentes + sumaNuevas > 1.0001) {
    throw new ErrorApp('La suma de las alícuotas de las unidades del condominio no puede superar el 100% (1.0000).', 400);
  }

  // 4. Inserción en lote
  return await repositorio.crearLote(condominioId, unidades);
};
