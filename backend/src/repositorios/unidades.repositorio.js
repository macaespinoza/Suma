// =============================================================================
// SUMA — Repositorio de Unidades Vecinales
// Capa de acceso a datos: consultas SQL preparadas contra PostgreSQL.
// =============================================================================

import { consultar, obtenerCliente } from '../config/database.js';

/**
 * Lista las unidades vecinales de un condominio.
 * @param {string} condominioId - UUID del condominio.
 * @returns {Promise<Array>} Lista de unidades activas.
 */
export const listarPorCondominio = async (condominioId) => {
  const { rows } = await consultar(
    `SELECT uv.id, uv.condominio_id, uv.bloque_edificio, uv.numero, uv.alicuota,
            uv.activo, uv.created_at, uv.updated_at,
            c.nombre AS condominio_nombre
     FROM Unidades_Vecinales uv
     JOIN Condominios c ON c.id = uv.condominio_id
     WHERE uv.condominio_id = $1 AND uv.activo = TRUE
     ORDER BY uv.bloque_edificio ASC, uv.numero ASC`,
    [condominioId]
  );
  return rows;
};

/**
 * Obtiene una unidad vecinal por su ID.
 * @param {string} id - UUID de la unidad.
 * @returns {Promise<object|null>} Unidad encontrada o null.
 */
export const obtenerPorId = async (id) => {
  const { rows } = await consultar(
    `SELECT uv.id, uv.condominio_id, uv.bloque_edificio, uv.numero, uv.alicuota,
            uv.activo, uv.created_at, uv.updated_at,
            c.nombre AS condominio_nombre
     FROM Unidades_Vecinales uv
     JOIN Condominios c ON c.id = uv.condominio_id
     WHERE uv.id = $1`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Crea una nueva unidad vecinal.
 * @param {object} datos - Datos de la unidad.
 * @param {string} datos.condominio_id
 * @param {string} datos.bloque_edificio
 * @param {string} datos.numero
 * @param {number} datos.alicuota
 * @returns {Promise<object>} Unidad creada.
 */
export const crear = async ({ condominio_id, bloque_edificio, numero, alicuota }) => {
  const { rows } = await consultar(
    `INSERT INTO Unidades_Vecinales (condominio_id, bloque_edificio, numero, alicuota)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [condominio_id, bloque_edificio, numero, alicuota]
  );
  return rows[0];
};

/**
 * Actualiza una unidad vecinal existente.
 * @param {string} id - UUID de la unidad.
 * @param {object} datos - Campos a actualizar.
 * @returns {Promise<object|null>} Unidad actualizada o null.
 */
export const actualizar = async (id, { bloque_edificio, numero, alicuota }) => {
  const { rows } = await consultar(
    `UPDATE Unidades_Vecinales
     SET bloque_edificio = COALESCE($2, bloque_edificio),
         numero = COALESCE($3, numero),
         alicuota = COALESCE($4, alicuota)
     WHERE id = $1 AND activo = TRUE
     RETURNING *`,
    [id, bloque_edificio, numero, alicuota]
  );
  return rows[0] || null;
};

/**
 * Desactiva una unidad vecinal (eliminación lógica).
 * @param {string} id - UUID de la unidad.
 * @returns {Promise<boolean>} true si se desactivó.
 */
export const desactivar = async (id) => {
  const { rowCount } = await consultar(
    `UPDATE Unidades_Vecinales SET activo = FALSE WHERE id = $1 AND activo = TRUE`,
    [id]
  );
  return rowCount > 0;
};

/**
 * Obtiene los residentes (usuarios) de una unidad vecinal.
 * @param {string} unidadId - UUID de la unidad.
 * @returns {Promise<Array>} Lista de usuarios vinculados.
 */
export const obtenerResidentes = async (unidadId) => {
  const { rows } = await consultar(
    `SELECT u.id, u.nombre_completo, u.email, u.telefono, u.rol,
            uu.es_residente
     FROM Usuarios_Unidades uu
     JOIN Usuarios u ON u.id = uu.usuario_id
     WHERE uu.unidad_id = $1 AND u.deleted_at IS NULL
     ORDER BY u.nombre_completo ASC`,
    [unidadId]
  );
  return rows;
};

/**
 * Crea múltiples unidades vecinales en lote usando una transacción.
 * @param {string} condominioId - UUID del condominio.
 * @param {Array} unidades - Lista de unidades a crear.
 * @returns {Promise<Array>} Lista de unidades creadas.
 */
export const crearLote = async (condominioId, unidades) => {
  const cliente = await obtenerCliente();
  try {
    await cliente.query('BEGIN');
    const creadas = [];
    for (const unidad of unidades) {
      const { rows } = await cliente.query(
        `INSERT INTO Unidades_Vecinales (condominio_id, bloque_edificio, numero, alicuota)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          condominioId,
          unidad.bloque_edificio ? unidad.bloque_edificio.trim() : null,
          unidad.numero.trim(),
          unidad.alicuota
        ]
      );
      creadas.push(rows[0]);
    }
    await cliente.query('COMMIT');
    return creadas;
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
};
