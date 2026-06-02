// =============================================================================
// SUMA — Repositorio de Vehículos
// Capa de acceso a datos para Vehiculos vinculados a una unidad.
// =============================================================================

import { consultar } from '../config/database.js';

export const listarPorUnidad = async (unidadId) => {
  const { rows } = await consultar(
    `SELECT id, unidad_id, tipo_vehiculo, patente, created_at, updated_at
     FROM Vehiculos
     WHERE unidad_id = $1
     ORDER BY created_at ASC`,
    [unidadId]
  );
  return rows;
};

export const obtenerPorId = async (id) => {
  const { rows } = await consultar(
    `SELECT id, unidad_id, tipo_vehiculo, patente, created_at, updated_at
     FROM Vehiculos
     WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const crear = async ({ unidad_id, tipo_vehiculo, patente }) => {
  const { rows } = await consultar(
    `INSERT INTO Vehiculos (unidad_id, tipo_vehiculo, patente)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [unidad_id, tipo_vehiculo, patente]
  );
  return rows[0];
};

export const eliminar = async (id) => {
  const { rowCount } = await consultar(
    `DELETE FROM Vehiculos WHERE id = $1`,
    [id]
  );
  return rowCount > 0;
};
