// =============================================================================
// SUMA — Repositorio de Usuarios
// Capa de acceso a datos: consultas SQL preparadas contra PostgreSQL.
// =============================================================================

import { consultar } from '../config/database.js';

/**
 * Obtiene todos los usuarios activos (sin soft delete).
 * @returns {Promise<Array>} Lista de usuarios.
 */
export const obtenerTodos = async () => {
  const { rows } = await consultar(
    `SELECT id, firebase_uid, rut, nombre_completo, email, telefono, rol, created_at, updated_at
     FROM Usuarios
     WHERE deleted_at IS NULL
     ORDER BY nombre_completo ASC`
  );
  return rows;
};

/**
 * Obtiene un usuario por su ID.
 * @param {string} id - UUID del usuario.
 * @returns {Promise<object|null>} Usuario encontrado o null.
 */
export const obtenerPorId = async (id) => {
  const { rows } = await consultar(
    `SELECT id, firebase_uid, rut, nombre_completo, email, telefono, rol, created_at, updated_at
     FROM Usuarios
     WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Busca un usuario por su Firebase UID.
 * Usado en el flujo de login para vincular Firebase Auth con PostgreSQL.
 * @param {string} firebaseUid - UID de Firebase Authentication.
 * @returns {Promise<object|null>} Usuario encontrado o null.
 */
export const obtenerPorFirebaseUid = async (firebaseUid) => {
  const { rows } = await consultar(
    `SELECT id, firebase_uid, rut, nombre_completo, email, telefono, rol, created_at, updated_at
     FROM Usuarios
     WHERE firebase_uid = $1 AND deleted_at IS NULL`,
    [firebaseUid]
  );
  return rows[0] || null;
};

/**
 * Crea un nuevo usuario.
 * @param {object} datos - Datos del usuario.
 * @param {string} datos.firebase_uid
 * @param {string} datos.rut - RUT validado y formateado.
 * @param {string} datos.nombre_completo
 * @param {string} datos.email
 * @param {string} [datos.telefono]
 * @param {string} [datos.rol] - Default 'arrendatario' si no se especifica.
 * @returns {Promise<object>} Usuario creado.
 */
export const crear = async ({ firebase_uid, rut, nombre_completo, email, telefono, rol }) => {
  const { rows } = await consultar(
    `INSERT INTO Usuarios (firebase_uid, rut, nombre_completo, email, telefono, rol)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'arrendatario'))
     RETURNING id, firebase_uid, rut, nombre_completo, email, telefono, rol, created_at`,
    [firebase_uid, rut, nombre_completo, email, telefono, rol]
  );
  return rows[0];
};

/**
 * Actualiza los datos de un usuario.
 * @param {string} id - UUID del usuario.
 * @param {object} datos - Campos a actualizar.
 * @returns {Promise<object|null>} Usuario actualizado o null.
 */
export const actualizar = async (id, { nombre_completo, email, telefono, rol }) => {
  const { rows } = await consultar(
    `UPDATE Usuarios
     SET nombre_completo = COALESCE($2, nombre_completo),
         email = COALESCE($3, email),
         telefono = COALESCE($4, telefono),
         rol = COALESCE($5, rol)
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING id, firebase_uid, rut, nombre_completo, email, telefono, rol, updated_at`,
    [id, nombre_completo, email, telefono, rol]
  );
  return rows[0] || null;
};

/**
 * Eliminación lógica de un usuario (soft delete con timestamp).
 * @param {string} id - UUID del usuario.
 * @returns {Promise<boolean>} true si se eliminó lógicamente.
 */
export const eliminarLogico = async (id) => {
  const { rowCount } = await consultar(
    `UPDATE Usuarios SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return rowCount > 0;
};
