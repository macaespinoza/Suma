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

  return {
    unidad,
    cargando,
    error,
    obtenerPorId,
    crear,
    crearLote,
    actualizar,
    desactivar,
  };
}
