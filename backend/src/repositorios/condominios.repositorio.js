// =============================================================================
// SUMA — Repositorio de Condominios
// Capa de acceso a datos: consultas SQL preparadas contra PostgreSQL.
// =============================================================================

import { consultar } from '../config/database.js';

/**
 * Obtiene todos los condominios activos.
 * @returns {Promise<Array>} Lista de condominios.
 */
export const obtenerTodos = async () => {
  const { rows } = await consultar(
    `SELECT id, nombre, direccion, rut_comunidad, cantidad_unidades, porcentaje_fondo_reserva, saldo_fondo_reserva, activo, created_at, updated_at
     FROM Condominios
     WHERE activo = TRUE
     ORDER BY nombre ASC`
  );
  return rows;
};

/**
 * Obtiene un condominio por su ID.
 * @param {string} id - UUID del condominio.
 * @returns {Promise<object|null>} Condominio encontrado o null.
 */
export const obtenerPorId = async (id) => {
  const { rows } = await consultar(
    `SELECT id, nombre, direccion, rut_comunidad, cantidad_unidades, porcentaje_fondo_reserva, saldo_fondo_reserva, activo, created_at, updated_at
     FROM Condominios
     WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Crea un nuevo condominio.
 * @param {object} datos - Datos del condominio.
 * @param {string} datos.nombre
 * @param {string} datos.direccion
 * @param {string} datos.rut_comunidad - RUT validado.
 * @param {number} datos.cantidad_unidades
 * @returns {Promise<object>} Condominio creado con su ID generado.
 */
export const crear = async ({ nombre, direccion, rut_comunidad, cantidad_unidades, porcentaje_fondo_reserva = 0.0000 }) => {
  const { rows } = await consultar(
    `INSERT INTO Condominios (nombre, direccion, rut_comunidad, cantidad_unidades, porcentaje_fondo_reserva)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [nombre, direccion, rut_comunidad, cantidad_unidades, porcentaje_fondo_reserva]
  );
  return rows[0];
};

/**
 * Actualiza un condominio existente.
 * @param {string} id - UUID del condominio.
 * @param {object} datos - Campos a actualizar.
 * @returns {Promise<object|null>} Condominio actualizado o null si no existe.
 */
export const actualizar = async (id, { nombre, direccion, rut_comunidad, cantidad_unidades, porcentaje_fondo_reserva }) => {
  const { rows } = await consultar(
    `UPDATE Condominios
     SET nombre = COALESCE($2, nombre),
         direccion = COALESCE($3, direccion),
         rut_comunidad = COALESCE($4, rut_comunidad),
         cantidad_unidades = COALESCE($5, cantidad_unidades),
         porcentaje_fondo_reserva = COALESCE($6, porcentaje_fondo_reserva)
     WHERE id = $1 AND activo = TRUE
     RETURNING *`,
    [id, nombre, direccion, rut_comunidad, cantidad_unidades, porcentaje_fondo_reserva]
  );
  return rows[0] || null;
};

/**
 * Desactiva un condominio (eliminación lógica).
 * @param {string} id - UUID del condominio.
 * @returns {Promise<boolean>} true si se desactivó, false si no existía.
 */
export const desactivar = async (id) => {
  const { rowCount } = await consultar(
    `UPDATE Condominios SET activo = FALSE WHERE id = $1 AND activo = TRUE`,
    [id]
  );
  return rowCount > 0;
};

/**
 * Lista las unidades vecinales de un condominio.
 * @param {string} condominioId - UUID del condominio.
 * @returns {Promise<Array>} Lista de unidades vecinales.
 */
export const obtenerUnidades = async (condominioId) => {
  const { rows } = await consultar(
    `SELECT id, condominio_id, bloque_edificio, numero, alicuota, activo, created_at, updated_at
     FROM Unidades_Vecinales
     WHERE condominio_id = $1 AND activo = TRUE
     ORDER BY bloque_edificio ASC, numero ASC`,
    [condominioId]
  );
  return rows;
};

/**
 * Actualiza el saldo histórico del fondo de reserva de un condominio.
 * @param {string} id - UUID del condominio.
 * @param {number} montoAAgregar - Monto a sumar (puede ser negativo para restar).
 * @returns {Promise<boolean>} true si se actualizó.
 */
export const actualizarFondoReserva = async (id, montoAAgregar) => {
  const { rowCount } = await consultar(
    `UPDATE Condominios
     SET saldo_fondo_reserva = saldo_fondo_reserva + $2
     WHERE id = $1`,
    [id, montoAAgregar]
  );
  return rowCount > 0;
};
