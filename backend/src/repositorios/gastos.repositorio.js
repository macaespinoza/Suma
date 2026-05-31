// =============================================================================
// SUMA — Repositorio de Gastos Comunes
// Capa de acceso a datos: consultas SQL preparadas contra PostgreSQL.
// =============================================================================

import { consultar, obtenerCliente } from '../config/database.js';

export const obtenerPorCondominio = async (condominioId, { pagina = 1, porPagina = 12, estado } = {}) => {
  const offset = (pagina - 1) * porPagina;
  const params = [condominioId];
  let whereClause = 'WHERE g.condominio_id = $1';

  if (estado) {
    params.push(estado);
    whereClause += ` AND g.estado = $${params.length}`;
  }

  const countQuery = `
    SELECT COUNT(*) as total
    FROM Gastos_Comunes_Mes g
    ${whereClause}
  `;
  const { rows: countRows } = await consultar(countQuery, params);
  const total = parseInt(countRows[0].total, 10);

  const query = `
    SELECT g.id, g.mes_anio, g.total_gastos, g.estado, g.created_at, g.updated_at,
      COALESCE(SUM(cu.total_a_pagar), 0) as total_cobrado,
      COALESCE(SUM(CASE WHEN cu.estado_pago = 'pagado' THEN cu.total_a_pagar ELSE 0 END), 0) as total_pagado,
      COALESCE(SUM(CASE WHEN cu.estado_pago IN ('pendiente', 'moroso') THEN cu.total_a_pagar ELSE 0 END), 0) as total_pendiente
    FROM Gastos_Comunes_Mes g
    LEFT JOIN Cobros_Unidad cu ON cu.gasto_comun_mes_id = g.id
    ${whereClause}
    GROUP BY g.id
    ORDER BY g.mes_anio DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  params.push(porPagina, offset);
  const { rows } = await consultar(query, params);

  return { rows, total };
};

export const obtenerPorId = async (id) => {
  const { rows } = await consultar(
    `SELECT id, condominio_id, mes_anio, total_gastos, estado, created_at, updated_at
     FROM Gastos_Comunes_Mes
     WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const obtenerDetalleCompleto = async (id) => {
  const { rows } = await consultar(
    `SELECT g.id, g.condominio_id, g.mes_anio, g.total_gastos, g.estado, g.created_at, g.updated_at,
      COALESCE(SUM(eo.monto), 0) as suma_egresos,
      COUNT(DISTINCT cu.id) as unidades_cobradas,
      COALESCE(SUM(cu.total_a_pagar), 0) as total_cobrado,
      COALESCE(SUM(CASE WHEN cu.estado_pago = 'pagado' THEN cu.total_a_pagar ELSE 0 END), 0) as total_pagado,
      COALESCE(SUM(CASE WHEN cu.estado_pago IN ('pendiente', 'moroso') THEN cu.total_a_pagar ELSE 0 END), 0) as total_pendiente,
      (SELECT COUNT(*) FROM Unidades_Vecinales uv WHERE uv.condominio_id = g.condominio_id AND uv.activo = TRUE) as total_unidades
     FROM Gastos_Comunes_Mes g
     LEFT JOIN Egresos_Operativos eo ON eo.gasto_comun_mes_id = g.id
     LEFT JOIN Cobros_Unidad cu ON cu.gasto_comun_mes_id = g.id
     WHERE g.id = $1
     GROUP BY g.id`,
    [id]
  );
  return rows[0] || null;
};

export const crear = async ({ condominioId, mesAnio, totalGastos }) => {
  const { rows } = await consultar(
    `INSERT INTO Gastos_Comunes_Mes (condominio_id, mes_anio, total_gastos)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [condominioId, mesAnio, totalGastos]
  );
  return rows[0];
};

export const actualizar = async (id, { totalGastos }) => {
  const { rows } = await consultar(
    `UPDATE Gastos_Comunes_Mes
     SET total_gastos = COALESCE($2, total_gastos)
     WHERE id = $1 AND estado = 'borrador'
     RETURNING *`,
    [id, totalGastos]
  );
  return rows[0] || null;
};

export const marcarPublicado = async (id) => {
  const { rows } = await consultar(
    `UPDATE Gastos_Comunes_Mes
     SET estado = 'publicado'
     WHERE id = $1 AND estado = 'borrador'
     RETURNING *`,
    [id]
  );
  return rows[0] || null;
};

export const eliminar = async (id) => {
  const { rowCount } = await consultar(
    `DELETE FROM Gastos_Comunes_Mes WHERE id = $1 AND estado = 'borrador'`,
    [id]
  );
  return rowCount > 0;
};

export const existeMesDuplicado = async (condominioId, mesAnio, excludeId = null) => {
  const params = [condominioId, mesAnio];
  let query = `SELECT COUNT(*) as total FROM Gastos_Comunes_Mes WHERE condominio_id = $1 AND mes_anio = $2`;

  if (excludeId) {
    params.push(excludeId);
    query += ` AND id != $3`;
  }

  const { rows } = await consultar(query, params);
  return parseInt(rows[0].total, 10) > 0;
};

export const obtenerEgresosPorGasto = async (gastoId) => {
  const { rows } = await consultar(
    `SELECT id, gasto_comun_mes_id, categoria, descripcion, monto, archivo_respaldo_url, created_at, updated_at
     FROM Egresos_Operativos
     WHERE gasto_comun_mes_id = $1
     ORDER BY created_at ASC`,
    [gastoId]
  );
  return rows;
};

export const crearEgreso = async ({ gastoComunMesId, categoria, descripcion, monto }) => {
  const { rows } = await consultar(
    `INSERT INTO Egresos_Operativos (gasto_comun_mes_id, categoria, descripcion, monto)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [gastoComunMesId, categoria, descripcion, monto]
  );
  return rows[0];
};

export const actualizarTotalConSumaEgresos = async (gastoId) => {
  const { rows } = await consultar(
    `UPDATE Gastos_Comunes_Mes
     SET total_gastos = (
       SELECT COALESCE(SUM(monto), 0) FROM Egresos_Operativos WHERE gasto_comun_mes_id = $1
     )
     WHERE id = $1
     RETURNING total_gastos`,
    [gastoId]
  );
  return parseFloat(rows[0]?.total_gastos || 0);
};

export const obtenerSumaEgresos = async (gastoId) => {
  const { rows } = await consultar(
    `SELECT COALESCE(SUM(monto), 0) as suma
     FROM Egresos_Operativos
     WHERE gasto_comun_mes_id = $1`,
    [gastoId]
  );
  return parseFloat(rows[0].suma);
};

export const eliminarEgresosPorGasto = async (gastoId) => {
  await consultar(`DELETE FROM Egresos_Operativos WHERE gasto_comun_mes_id = $1`, [gastoId]);
};
