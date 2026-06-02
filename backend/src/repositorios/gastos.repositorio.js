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
    SELECT g.id, g.mes_anio, g.total_gastos, g.monto_fondo_reserva, g.estado, g.created_at, g.updated_at,
      COALESCE((SELECT SUM(cu.total_a_pagar) FROM Cobros_Unidad cu WHERE cu.gasto_comun_mes_id = g.id), 0) as total_cobrado,
      COALESCE((SELECT SUM(cu.total_a_pagar) FROM Cobros_Unidad cu WHERE cu.gasto_comun_mes_id = g.id AND cu.estado_pago = 'pagado'), 0) as total_pagado,
      COALESCE((SELECT SUM(cu.total_a_pagar) FROM Cobros_Unidad cu WHERE cu.gasto_comun_mes_id = g.id AND cu.estado_pago IN ('pendiente', 'moroso')), 0) as total_pendiente
    FROM Gastos_Comunes_Mes g
    ${whereClause}
    ORDER BY g.mes_anio DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  params.push(porPagina, offset);
  const { rows } = await consultar(query, params);

  return { rows, total };
};

export const obtenerPorId = async (id) => {
  const { rows } = await consultar(
    `SELECT id, condominio_id, mes_anio, total_gastos, monto_fondo_reserva, estado, created_at, updated_at
     FROM Gastos_Comunes_Mes
     WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const obtenerDetalleCompleto = async (id) => {
  const { rows } = await consultar(
    `SELECT g.id, g.condominio_id, g.mes_anio, g.total_gastos, g.monto_fondo_reserva, g.estado, g.created_at, g.updated_at,
      COALESCE((SELECT SUM(monto) FROM Egresos_Operativos WHERE gasto_comun_mes_id = g.id), 0) as suma_egresos,
      (SELECT COUNT(*) FROM Cobros_Unidad WHERE gasto_comun_mes_id = g.id) as unidades_cobradas,
      COALESCE((SELECT SUM(total_a_pagar) FROM Cobros_Unidad WHERE gasto_comun_mes_id = g.id), 0) as total_cobrado,
      COALESCE((SELECT SUM(total_a_pagar) FROM Cobros_Unidad WHERE gasto_comun_mes_id = g.id AND estado_pago = 'pagado'), 0) as total_pagado,
      COALESCE((SELECT SUM(total_a_pagar) FROM Cobros_Unidad WHERE gasto_comun_mes_id = g.id AND estado_pago IN ('pendiente', 'moroso')), 0) as total_pendiente,
      (SELECT COUNT(*) FROM Unidades_Vecinales uv WHERE uv.condominio_id = g.condominio_id AND uv.activo = TRUE) as total_unidades
     FROM Gastos_Comunes_Mes g
     WHERE g.id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const crear = async ({ condominioId, mesAnio, totalGastos, montoFondoReserva = 0 }) => {
  const { rows } = await consultar(
    `INSERT INTO Gastos_Comunes_Mes (condominio_id, mes_anio, total_gastos, monto_fondo_reserva)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [condominioId, mesAnio, totalGastos, montoFondoReserva]
  );
  return rows[0];
};

export const actualizar = async (id, { totalGastos, montoFondoReserva }) => {
  const { rows } = await consultar(
    `UPDATE Gastos_Comunes_Mes
     SET total_gastos = COALESCE($2, total_gastos),
         monto_fondo_reserva = COALESCE($3, monto_fondo_reserva)
     WHERE id = $1 AND estado = 'borrador'
     RETURNING *`,
    [id, totalGastos, montoFondoReserva]
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

export const crearEgreso = async ({ gastoComunMesId, categoria, descripcion, monto, archivo_respaldo_url }) => {
  const { rows } = await consultar(
    `INSERT INTO Egresos_Operativos (gasto_comun_mes_id, categoria, descripcion, monto, archivo_respaldo_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [gastoComunMesId, categoria, descripcion, monto, archivo_respaldo_url]
  );
  return rows[0];
};

export const actualizarTotalConSumaEgresos = async (gastoId) => {
  const { rows } = await consultar(
    `UPDATE Gastos_Comunes_Mes g
     SET total_gastos = COALESCE((SELECT SUM(monto) FROM Egresos_Operativos WHERE gasto_comun_mes_id = $1), 0),
         monto_fondo_reserva = ROUND(COALESCE((SELECT SUM(monto) FROM Egresos_Operativos WHERE gasto_comun_mes_id = $1), 0) * (SELECT porcentaje_fondo_reserva FROM Condominios WHERE id = g.condominio_id))
     WHERE g.id = $1
     RETURNING total_gastos, monto_fondo_reserva`,
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

export const despublicarGasto = async (id) => {
  const { rows } = await consultar(
    `UPDATE Gastos_Comunes_Mes
     SET estado = 'borrador'
     WHERE id = $1 AND estado = 'publicado'
     RETURNING *`,
    [id]
  );
  return rows[0] || null;
};

export const obtenerEgresoPorId = async (id) => {
  const { rows } = await consultar(
    `SELECT id, gasto_comun_mes_id, categoria, descripcion, monto, archivo_respaldo_url, created_at, updated_at
     FROM Egresos_Operativos
     WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const actualizarEgreso = async (id, { categoria, descripcion, monto, archivo_respaldo_url }) => {
  const { rows } = await consultar(
    `UPDATE Egresos_Operativos
     SET categoria = COALESCE($2, categoria),
         descripcion = COALESCE($3, descripcion),
         monto = COALESCE($4, monto),
         archivo_respaldo_url = COALESCE($5, archivo_respaldo_url)
     WHERE id = $1
     RETURNING *`,
    [id, categoria, descripcion, monto, archivo_respaldo_url]
  );
  return rows[0] || null;
};

export const eliminarEgreso = async (id) => {
  const { rowCount } = await consultar(
    `DELETE FROM Egresos_Operativos WHERE id = $1`,
    [id]
  );
  return rowCount > 0;
};

