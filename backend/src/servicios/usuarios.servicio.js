// =============================================================================
// SUMA — Servicio de Usuarios
// Capa de lógica de negocio.
// =============================================================================

import * as repositorio from '../repositorios/usuarios.repositorio.js';
import { ErrorApp } from '../middlewares/errores.js';
import { validarRut, formatearRut } from '../utilidades/rut.js';

/**
 * Lista todos los usuarios activos.
 * @returns {Promise<Array>}
 */
export const listarTodos = async () => {
  return await repositorio.obtenerTodos();
};

/**
 * Obtiene un usuario por ID.
 * @param {string} id - UUID del usuario.
 * @returns {Promise<object>}
 */
export const obtenerPorId = async (id) => {
  const usuario = await repositorio.obtenerPorId(id);
  if (!usuario) {
    throw new ErrorApp('Usuario no encontrado.', 404);
  }
  return usuario;
};

/**
 * Crea un nuevo usuario con validación de RUT.
 * @param {object} datos - Datos del usuario.
 * @returns {Promise<object>} Usuario creado.
 */
export const crear = async (datos) => {
  // Validar RUT con Módulo 11 antes de enviar a la BD.
  if (!validarRut(datos.rut)) {
    throw new ErrorApp('El RUT proporcionado no es válido (Módulo 11).', 400);
  }

  // Normalizar RUT al formato canónico (sin puntos, con guión, DV mayúscula).
  datos.rut = formatearRut(datos.rut);

  return await repositorio.crear(datos);
};

/**
 * Actualiza los datos de un usuario.
 * @param {string} id
 * @param {object} datos
 * @returns {Promise<object>}
 */
export const actualizar = async (id, datos) => {
  const usuario = await repositorio.actualizar(id, datos);
  if (!usuario) {
    throw new ErrorApp('Usuario no encontrado.', 404);
  }
  return usuario;
};

/**
 * Elimina lógicamente un usuario (soft delete).
 * @param {string} id - UUID del usuario.
 * @returns {Promise<void>}
 */
export const eliminar = async (id) => {
  const resultado = await repositorio.eliminarLogico(id);
  if (!resultado) {
    throw new ErrorApp('Usuario no encontrado.', 404);
  }
};

/**
 * Verifica un token de Firebase y retorna el usuario de PostgreSQL.
 * Si el usuario no existe en la BD, retorna null para que el frontend
 * solicite completar el registro (nombre, RUT, etc.).
 *
 * TODO (Open Code): Implementar la lógica completa de verificación + auto-registro.
 *
 * @param {string} firebaseUid - UID de Firebase Authentication.
 * @returns {Promise<object|null>} Usuario de la BD o null.
 */
export const verificarPorFirebaseUid = async (firebaseUid) => {
  return await repositorio.obtenerPorFirebaseUid(firebaseUid);
};
