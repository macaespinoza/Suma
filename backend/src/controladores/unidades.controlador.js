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

/**
 * POST /api/v1/unidades/lote
 * Crea múltiples unidades vecinales en lote.
 */
export const crearLote = async (req, res, next) => {
  try {
    const { condominio_id, unidades } = req.body;
    const creadas = await servicio.crearLote(condominio_id, unidades);
    return respuestaCreado(res, creadas);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/condominios/:condominioId/unidades/:unidadId
 * Obtiene el detalle completo de una unidad: datos base + titulares + vehículos + mascotas.
 */
export const obtenerDetalleCompleto = async (req, res, next) => {
  try {
    const unidad = await servicio.obtenerDetalleCompleto(req.params.unidadId);
    return respuestaExitosa(res, unidad);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/condominios/:condominioId/unidades/:unidadId
 * Actualiza los datos base de una unidad (estacionamiento, bodega).
 */
export const actualizarDatosBase = async (req, res, next) => {
  try {
    const unidad = await servicio.actualizarDatosBase(req.params.unidadId, req.body);
    return respuestaExitosa(res, unidad);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/condominios/:condominioId/unidades/:unidadId/titulares
 * Añade o reemplaza un titular (propietario o arrendatario).
 */
export const agregarTitular = async (req, res, next) => {
  try {
    const titular = await servicio.agregarTitular(req.params.unidadId, req.body);
    return respuestaCreado(res, titular);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/condominios/:condominioId/unidades/:unidadId/titulares/:titularId
 * Elimina administrativamente a un titular de la unidad.
 */
export const eliminarTitular = async (req, res, next) => {
  try {
    await servicio.eliminarTitular(req.params.unidadId, req.params.titularId);
    return respuestaSinContenido(res);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/condominios/:condominioId/unidades/:unidadId/vehiculos
 * Añade un vehículo a la unidad.
 */
export const agregarVehiculo = async (req, res, next) => {
  try {
    const vehiculo = await servicio.agregarVehiculo(req.params.unidadId, req.body);
    return respuestaCreado(res, vehiculo);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/condominios/:condominioId/unidades/:unidadId/vehiculos/:vehiculoId
 * Elimina un vehículo de la unidad.
 */
export const eliminarVehiculo = async (req, res, next) => {
  try {
    await servicio.eliminarVehiculo(req.params.unidadId, req.params.vehiculoId);
    return respuestaSinContenido(res);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/condominios/:condominioId/unidades/:unidadId/mascotas
 * Añade una mascota a la unidad.
 */
export const agregarMascota = async (req, res, next) => {
  try {
    const mascota = await servicio.agregarMascota(req.params.unidadId, req.body);
    return respuestaCreado(res, mascota);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/condominios/:condominioId/unidades/:unidadId/mascotas/:mascotaId
 * Elimina una mascota de la unidad.
 */
export const eliminarMascota = async (req, res, next) => {
  try {
    await servicio.eliminarMascota(req.params.unidadId, req.params.mascotaId);
    return respuestaSinContenido(res);
  } catch (error) {
    next(error);
  }
};

