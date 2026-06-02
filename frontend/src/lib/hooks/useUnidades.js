// =============================================================================
// SUMA — Hook useUnidades
// Encapsula la lógica de consumo de la API para unidades vecinales.
// =============================================================================

'use client';

import { useState, useCallback } from 'react';
import api from '../api.js';

/**
 * Hook personalizado para gestionar unidades vecinales.
 * Provee funciones CRUD y estados de carga/error.
 *
 * @returns {object} Estado y funciones para unidades.
 */
export function useUnidades() {
  const [unidad, setUnidad] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Obtiene una unidad por ID.
   */
  const obtenerPorId = useCallback(async (id) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.get(`/unidades/${id}`);
      setUnidad(respuesta.datos);
      return respuesta.datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Crea una nueva unidad vecinal.
   */
  const crear = useCallback(async (datos) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.post('/unidades', datos);
      return respuesta.datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Crea unidades vecinales en lote.
   */
  const crearLote = useCallback(async (datos) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.post('/unidades/lote', datos);
      return respuesta.datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Actualiza una unidad vecinal.
   */
  const actualizar = useCallback(async (id, datos) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.put(`/unidades/${id}`, datos);
      setUnidad(respuesta.datos);
      return respuesta.datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Desactiva una unidad vecinal (soft delete).
   */
  const desactivar = useCallback(async (id) => {
    setCargando(true);
    setError(null);
    try {
      await api.delete(`/unidades/${id}`);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Obtiene el detalle completo de una unidad sin necesitar condominioId.
   */
  const obtenerDetalleStandalone = useCallback(async (unidadId) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.get(`/unidades/${unidadId}/detalle`);
      setUnidad(respuesta.datos);
      return respuesta.datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Obtiene el detalle completo de una unidad (datos base + titulares + vehículos + mascotas).
   */
  const obtenerDetalleCompleto = useCallback(async (condominioId, unidadId) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.get(`/condominios/${condominioId}/unidades/${unidadId}`);
      setUnidad(respuesta.datos);
      return respuesta.datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Actualiza los datos base de una unidad (estacionamiento, bodega).
   */
  const actualizarDatosBase = useCallback(async (condominioId, unidadId, datos) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.put(`/condominios/${condominioId}/unidades/${unidadId}`, datos);
      setUnidad(respuesta.datos);
      return respuesta.datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Añade o reemplaza un titular (propietario o arrendatario).
   */
  const agregarTitular = useCallback(async (condominioId, unidadId, datos) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.post(`/condominios/${condominioId}/unidades/${unidadId}/titulares`, datos);
      return respuesta.datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Elimina un titular de la unidad.
   */
  const eliminarTitular = useCallback(async (condominioId, unidadId, titularId) => {
    setCargando(true);
    setError(null);
    try {
      await api.delete(`/condominios/${condominioId}/unidades/${unidadId}/titulares/${titularId}`);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Añade un vehículo a la unidad.
   */
  const agregarVehiculo = useCallback(async (condominioId, unidadId, datos) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.post(`/condominios/${condominioId}/unidades/${unidadId}/vehiculos`, datos);
      return respuesta.datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Elimina un vehículo de la unidad.
   */
  const eliminarVehiculo = useCallback(async (condominioId, unidadId, vehiculoId) => {
    setCargando(true);
    setError(null);
    try {
      await api.delete(`/condominios/${condominioId}/unidades/${unidadId}/vehiculos/${vehiculoId}`);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Añade una mascota a la unidad.
   */
  const agregarMascota = useCallback(async (condominioId, unidadId, datos) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.post(`/condominios/${condominioId}/unidades/${unidadId}/mascotas`, datos);
      return respuesta.datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Elimina una mascota de la unidad.
   */
  const eliminarMascota = useCallback(async (condominioId, unidadId, mascotaId) => {
    setCargando(true);
    setError(null);
    try {
      await api.delete(`/condominios/${condominioId}/unidades/${unidadId}/mascotas/${mascotaId}`);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  return {
    unidad,
    cargando,
    error,
    obtenerPorId,
    crear,
    crearLote,
    actualizar,
    desactivar,
    obtenerDetalleStandalone,
    obtenerDetalleCompleto,
    actualizarDatosBase,
    agregarTitular,
    eliminarTitular,
    agregarVehiculo,
    eliminarVehiculo,
    agregarMascota,
    eliminarMascota,
  };
}
