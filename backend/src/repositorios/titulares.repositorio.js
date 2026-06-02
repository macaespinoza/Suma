// =============================================================================
// SUMA — Repositorio de Titulares de Unidad
// Capa de acceso a datos para Titulares_Unidad (propietarios y arrendatarios).
// =============================================================================

import { consultar } from '../config/database.js';

export const listarPorUnidad = async (unidadId) => {
  const { rows } = await consultar(
    `SELECT id, unidad_id, tipo, nombre, rut, email, telefono, usuario_id, created_at, updated_at
     FROM Titulares_Unidad
     WHERE unidad_id = $1
     ORDER BY tipo ASC`,
    [unidadId]
  );
  return rows;
};

export const obtenerPorId = async (id) => {
  const { rows } = await consultar(
    `SELECT id, unidad_id, tipo, nombre, rut, email, telefono, usuario_id, created_at, updated_at
     FROM Titulares_Unidad
     WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const upsertPorUnidadYTipo = async ({ unidad_id, tipo, nombre, rut, email, telefono }) => {
  const { rows } = await consultar(
    `INSERT INTO Titulares_Unidad (unidad_id, tipo, nombre, rut, email, telefono)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (unidad_id, tipo) DO UPDATE
     SET nombre = EXCLUDED.nombre,
         rut = EXCLUDED.rut,
         email = EXCLUDED.email,
         telefono = EXCLUDED.telefono,
         updated_at = NOW()
     RETURNING *`,
    [unidad_id, tipo, nombre, rut, email, telefono]
  );
  return rows[0];
};

export const eliminar = async (id) => {
  const { rowCount } = await consultar(
    `DELETE FROM Titulares_Unidad WHERE id = $1`,
    [id]
  );
  return rowCount > 0;
};
