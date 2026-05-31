// =============================================================================
// SUMA — Repositorio de Transacciones de Pasarela
// Capa de acceso a datos: consultas SQL preparadas contra PostgreSQL.
// =============================================================================

import { consultar } from '../config/database.js';

export const crear = async ({ cobroUnidadId, pasarela, tokenTransaccion, montoTransaccion }) => {
  const { rows } = await consultar(
    `INSERT INTO Transacciones_Pasarela (cobro_unidad_id, pasarela, token_transaccion, monto_transaccion)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [cobroUnidadId, pasarela, tokenTransaccion, montoTransaccion]
  );
  return rows[0];
};

export const obtenerPorToken = async (token) => {
  const { rows } = await consultar(
    `SELECT t.id, t.cobro_unidad_id, t.pasarela, t.token_transaccion, t.monto_transaccion,
      t.estado_transaccion, t.created_at, t.updated_at,
      cu.unidad_id, cu.gasto_comun_mes_id
     FROM Transacciones_Pasarela t
     INNER JOIN Cobros_Unidad cu ON t.cobro_unidad_id = cu.id
     WHERE t.token_transaccion = $1`,
    [token]
  );
  return rows[0] || null;
};

export const obtenerPorId = async (id) => {
  const { rows } = await consultar(
    `SELECT t.id, t.cobro_unidad_id, t.pasarela, t.token_transaccion, t.monto_transaccion,
      t.estado_transaccion, t.created_at, t.updated_at,
      cu.unidad_id, cu.gasto_comun_mes_id,
      g.condominio_id
     FROM Transacciones_Pasarela t
     INNER JOIN Cobros_Unidad cu ON t.cobro_unidad_id = cu.id
     INNER JOIN Gastos_Comunes_Mes g ON cu.gasto_comun_mes_id = g.id
     WHERE t.id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const actualizarEstado = async (id, estado) => {
  const { rows } = await consultar(
    `UPDATE Transacciones_Pasarela
     SET estado_transaccion = $2
     WHERE id = $1
     RETURNING *`,
    [id, estado]
  );
  return rows[0] || null;
};

export const marcarExitosa = async (id) => {
  return actualizarEstado(id, 'exitosa');
};

export const marcarFallida = async (id) => {
  return actualizarEstado(id, 'fallida');
};

export const marcarReembolsada = async (id) => {
  return actualizarEstado(id, 'reembolsada');
};
