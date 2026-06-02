// =============================================================================
// SUMA — Servicio de Unidades Vecinales
// Capa de lógica de negocio.
// =============================================================================

import * as repositorio from '../repositorios/unidades.repositorio.js';
import * as condominiosRepositorio from '../repositorios/condominios.repositorio.js';
import * as titularesRepositorio from '../repositorios/titulares.repositorio.js';
import * as vehiculosRepositorio from '../repositorios/vehiculos.repositorio.js';
import * as mascotasRepositorio from '../repositorios/mascotas.repositorio.js';
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

/**
 * Obtiene el detalle completo de una unidad: datos base + titulares + vehículos + mascotas.
 * @param {string} unidadId - UUID de la unidad.
 * @returns {Promise<object>}
 */
export const obtenerDetalleCompleto = async (unidadId) => {
  const unidad = await repositorio.obtenerDetalleCompleto(unidadId);
  if (!unidad) {
    throw new ErrorApp('Unidad vecinal no encontrada.', 404);
  }
  return unidad;
};

/**
 * Actualiza los datos base de una unidad (estacionamiento, bodega).
 * @param {string} unidadId - UUID de la unidad.
 * @param {object} datos - { tiene_estacionamiento, numero_estacionamiento, tiene_bodega, numero_bodega }
 * @returns {Promise<object>}
 */
export const actualizarDatosBase = async (unidadId, datos) => {
  const unidad = await repositorio.actualizarDatosBase(unidadId, datos);
  if (!unidad) {
    throw new ErrorApp('Unidad vecinal no encontrada o ya está desactivada.', 404);
  }
  return unidad;
};

/**
 * Añade o reemplaza un titular (propietario o arrendatario) en una unidad.
 * Si ya existe un titular activo de ese tipo, se actualiza (upsert).
 * @param {string} unidadId - UUID de la unidad.
 * @param {object} datos - { tipo, nombre, rut, email, telefono }
 * @returns {Promise<object>}
 */
export const agregarTitular = async (unidadId, datos) => {
  const unidad = await repositorio.obtenerPorId(unidadId);
  if (!unidad) {
    throw new ErrorApp('Unidad vecinal no encontrada.', 404);
  }
  return await titularesRepositorio.upsertPorUnidadYTipo({
    unidad_id: unidadId,
    tipo: datos.tipo,
    nombre: datos.nombre,
    rut: datos.rut || null,
    email: datos.email || null,
    telefono: datos.telefono || null,
  });
};

/**
 * Elimina administrativamente a un titular de la unidad.
 * @param {string} unidadId - UUID de la unidad.
 * @param {string} titularId - UUID del titular.
 * @returns {Promise<void>}
 */
export const eliminarTitular = async (unidadId, titularId) => {
  const titular = await titularesRepositorio.obtenerPorId(titularId);
  if (!titular || titular.unidad_id !== unidadId) {
    throw new ErrorApp('Titular no encontrado en esta unidad.', 404);
  }
  const resultado = await titularesRepositorio.eliminar(titularId);
  if (!resultado) {
    throw new ErrorApp('No se pudo eliminar el titular.', 500);
  }
};

/**
 * Añade un vehículo a la unidad.
 * @param {string} unidadId - UUID de la unidad.
 * @param {object} datos - { tipo_vehiculo, patente }
 * @returns {Promise<object>}
 */
export const agregarVehiculo = async (unidadId, datos) => {
  const unidad = await repositorio.obtenerPorId(unidadId);
  if (!unidad) {
    throw new ErrorApp('Unidad vecinal no encontrada.', 404);
  }
  return await vehiculosRepositorio.crear({
    unidad_id: unidadId,
    tipo_vehiculo: datos.tipo_vehiculo,
    patente: datos.patente,
  });
};

/**
 * Elimina un vehículo de la unidad.
 * @param {string} unidadId - UUID de la unidad.
 * @param {string} vehiculoId - UUID del vehículo.
 * @returns {Promise<void>}
 */
export const eliminarVehiculo = async (unidadId, vehiculoId) => {
  const vehiculo = await vehiculosRepositorio.obtenerPorId(vehiculoId);
  if (!vehiculo || vehiculo.unidad_id !== unidadId) {
    throw new ErrorApp('Vehículo no encontrado en esta unidad.', 404);
  }
  const resultado = await vehiculosRepositorio.eliminar(vehiculoId);
  if (!resultado) {
    throw new ErrorApp('No se pudo eliminar el vehículo.', 500);
  }
};

/**
 * Añade una mascota a la unidad.
 * @param {string} unidadId - UUID de la unidad.
 * @param {object} datos - { nombre, especie, raza }
 * @returns {Promise<object>}
 */
export const agregarMascota = async (unidadId, datos) => {
  const unidad = await repositorio.obtenerPorId(unidadId);
  if (!unidad) {
    throw new ErrorApp('Unidad vecinal no encontrada.', 404);
  }
  return await mascotasRepositorio.crear({
    unidad_id: unidadId,
    nombre: datos.nombre,
    especie: datos.especie,
    raza: datos.raza || null,
  });
};

/**
 * Elimina una mascota de la unidad.
 * @param {string} unidadId - UUID de la unidad.
 * @param {string} mascotaId - UUID de la mascota.
 * @returns {Promise<void>}
 */
export const eliminarMascota = async (unidadId, mascotaId) => {
  const mascota = await mascotasRepositorio.obtenerPorId(mascotaId);
  if (!mascota || mascota.unidad_id !== unidadId) {
    throw new ErrorApp('Mascota no encontrada en esta unidad.', 404);
  }
  const resultado = await mascotasRepositorio.eliminar(mascotaId);
  if (!resultado) {
    throw new ErrorApp('No se pudo eliminar la mascota.', 500);
  }
};
