// =============================================================================
// SUMA — Repositorio de Mascotas
// Capa de acceso a datos para Mascotas vinculadas a una unidad.
// =============================================================================

import { consultar } from '../config/database.js';

export const listarPorUnidad = async (unidadId) => {
  const { rows } = await consultar(
    `SELECT id, unidad_id, nombre, especie, raza, foto_url, activo, created_at, updated_at
     FROM Mascotas
     WHERE unidad_id = $1 AND activo = TRUE
     ORDER BY nombre ASC`,
    [unidadId]
  );
  return rows;
};

export const obtenerPorId = async (id) => {
  const { rows } = await consultar(
    `SELECT id, unidad_id, nombre, especie, raza, foto_url, activo, created_at, updated_at
     FROM Mascotas
     WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const crear = async ({ unidad_id, nombre, especie, raza }) => {
  const { rows } = await consultar(
    `INSERT INTO Mascotas (unidad_id, nombre, especie, raza)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [unidad_id, nombre, especie, raza]
  );
  return rows[0];
};

export const eliminar = async (id) => {
  const { rowCount } = await consultar(
    `DELETE FROM Mascotas WHERE id = $1`,
    [id]
  );
  return rowCount > 0;
};
