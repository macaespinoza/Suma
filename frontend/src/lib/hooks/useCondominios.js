// =============================================================================
// SUMA — Hook useCondominios
// Encapsula la lógica de consumo de la API para condominios.
// =============================================================================

'use client';

import { useState, useCallback } from 'react';
import api from '../api.js';

/**
 * Hook personalizado para gestionar condominios.
 * Provee funciones CRUD y estados de carga/error.
 *
 * @returns {object} Estado y funciones para condominios.
 */
export function useCondominios() {
  const [condominios, setCondominios] = useState([]);
  const [condominio, setCondominio] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Lista todos los condominios activos.
   */
  const listar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.get('/condominios');
      setCondominios(respuesta.datos);
      return respuesta.datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Obtiene un condominio por ID.
   */
  const obtenerPorId = useCallback(async (id) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.get(`/condominios/${id}`);
      setCondominio(respuesta.datos);
      return respuesta.datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Crea un nuevo condominio.
   */
  const crear = useCallback(async (datos) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.post('/condominios', datos);
      setCondominios((prev) => [...prev, respuesta.datos]);
      return respuesta.datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Actualiza un condominio existente.
   */
  const actualizar = useCallback(async (id, datos) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.put(`/condominios/${id}`, datos);
      setCondominios((prev) =>
        prev.map((c) => (c.id === id ? respuesta.datos : c))
      );
      setCondominio(respuesta.datos);
      return respuesta.datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Desactiva un condominio (soft delete).
   */
  const desactivar = useCallback(async (id) => {
    setCargando(true);
    setError(null);
    try {
      await api.delete(`/condominios/${id}`);
      setCondominios((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Lista las unidades de un condominio.
   */
  const listarUnidades = useCallback(async (condominioId) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.get(`/condominios/${condominioId}/unidades`);
      return respuesta.datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  return {
    condominios,
    condominio,
    cargando,
    error,
    listar,
    obtenerPorId,
    crear,
    actualizar,
    desactivar,
    listarUnidades,
  };
}
