// =============================================================================
// SUMA — Repositorio de Credenciales de Pasarela
// Capa de acceso a datos: gestión de credenciales de pago por condominio.
// =============================================================================

import { consultar } from '../config/database.js';

export const listarPorCondominio = async (condominioId) => {
  const { rows } = await consultar(
    `SELECT id, condominio_id, pasarela, activo, created_at, updated_at
     FROM Credenciales_Pago_Condominio
     WHERE condominio_id = $1
     ORDER BY pasarela ASC`,
    [condominioId]
  );
  return rows;
};

export const obtenerPorId = async (id) => {
  const { rows } = await consultar(
    `SELECT id, condominio_id, pasarela, activo, created_at, updated_at
     FROM Credenciales_Pago_Condominio
     WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const obtenerPorCondominioYPasarela = async (condominioId, pasarela) => {
  const { rows } = await consultar(
    `SELECT id, condominio_id, pasarela, activo, created_at, updated_at
     FROM Credenciales_Pago_Condominio
     WHERE condominio_id = $1 AND pasarela = $2`,
    [condominioId, pasarela]
  );
  return rows[0] || null;
};

export const crear = async ({ condominioId, pasarela, apiKey, secretKey }) => {
  const { rows } = await consultar(
    `INSERT INTO Credenciales_Pago_Condominio (condominio_id, pasarela, api_key, secret_key)
     VALUES ($1, $2, $3, $4)
     RETURNING id, condominio_id, pasarela, activo, created_at, updated_at`,
    [condominioId, pasarela, apiKey, secretKey]
  );
  return rows[0];
};

export const actualizarActivo = async (id, activo) => {
  const { rows } = await consultar(
    `UPDATE Credenciales_Pago_Condominio
     SET activo = $2
     WHERE id = $1
     RETURNING id, condominio_id, pasarela, activo, created_at, updated_at`,
    [id, activo]
  );
  return rows[0] || null;
};

export const eliminar = async (id) => {
  const { rowCount } = await consultar(
    `DELETE FROM Credenciales_Pago_Condominio WHERE id = $1`,
    [id]
  );
  return rowCount > 0;
};
