// =============================================================================
// SUMA — Hook useUsuarios
// Encapsula la lógica de consumo de la API para usuarios.
// =============================================================================

'use client';

import { useState, useCallback } from 'react';
import api from '../api.js';

/**
 * Hook personalizado para gestionar usuarios.
 * Provee funciones CRUD y estados de carga/error.
 *
 * @returns {object} Estado y funciones para usuarios.
 */
export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Lista todos los usuarios activos.
   */
  const listar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.get('/usuarios');
      setUsuarios(respuesta.datos);
      return respuesta.datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Obtiene un usuario por ID.
   */
  const obtenerPorId = useCallback(async (id) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.get(`/usuarios/${id}`);
      setUsuario(respuesta.datos);
      return respuesta.datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Registra un nuevo usuario.
   */
  const crear = useCallback(async (datos) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.post('/usuarios', datos);
      setUsuarios((prev) => [...prev, respuesta.datos]);
      return respuesta.datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Actualiza los datos de un usuario.
   */
  const actualizar = useCallback(async (id, datos) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.put(`/usuarios/${id}`, datos);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? respuesta.datos : u))
      );
      setUsuario(respuesta.datos);
      return respuesta.datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Elimina lógicamente un usuario.
   */
  const eliminar = useCallback(async (id) => {
    setCargando(true);
    setError(null);
    try {
      await api.delete(`/usuarios/${id}`);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Verifica un usuario por Firebase UID.
   */
  const verificar = useCallback(async (firebaseUid) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await api.post('/usuarios/verificar', {
        firebase_uid: firebaseUid,
      });
      return respuesta.datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  return {
    usuarios,
    usuario,
    cargando,
    error,
    listar,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
    verificar,
  };
}
