// =============================================================================
// SUMA — Repositorio de Cobros y Pagos
// Capa de acceso a datos: consultas SQL preparadas contra PostgreSQL.
// =============================================================================

import { consultar, obtenerCliente } from '../config/database.js';

export const crearCobrosPorGasto = async (gastoId, unidades, totalGastos) => {
  const cliente = await obtenerCliente();
  try {
    await cliente.query('BEGIN');

    const cobros = [];
    for (const unidad of unidades) {
      const montoCobrado = parseFloat((totalGastos * unidad.alicuota).toFixed(2));
      const saldoAnterior = await obtenerSaldoAnterior(cliente, unidad.id);
      const totalAPagar = montoCobrado + saldoAnterior;

      const { rows } = await cliente.query(
        `INSERT INTO Cobros_Unidad (unidad_id, gasto_comun_mes_id, monto_cobrado, saldo_anterior, total_a_pagar)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [unidad.id, gastoId, montoCobrado, saldoAnterior, totalAPagar]
      );
      cobros.push({ ...rows[0], unidad });
    }

    await cliente.query('COMMIT');
    return cobros;
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
};

const obtenerSaldoAnterior = async (cliente, unidadId) => {
  const { rows } = await cliente.query(
    `SELECT COALESCE(SUM(total_a_pagar - (
       SELECT COALESCE(SUM(monto_pagado), 0)
       FROM Pagos_Registrados pr
       WHERE pr.cobro_unidad_id = cu.id
     )), 0) as saldo
     FROM Cobros_Unidad cu
     WHERE cu.unidad_id = $1
       AND cu.estado_pago IN ('pendiente', 'moroso')
       AND cu.id NOT IN (
         SELECT pr.cobro_unidad_id
         FROM Pagos_Registrados pr
         INNER JOIN Cobros_Unidad cu2 ON pr.cobro_unidad_id = cu2.id
         WHERE cu2.unidad_id = $1 AND cu2.estado_pago = 'pagado'
       )`,
    [unidadId]
  );
  return parseFloat(rows[0]?.saldo || 0);
};

export const obtenerCobrosPorGasto = async (gastoId, { pagina = 1, porPagina = 20, estado, bloque } = {}) => {
  const offset = (pagina - 1) * porPagina;
  const params = [gastoId];
  let whereClause = 'WHERE cu.gasto_comun_mes_id = $1';

  if (estado) {
    params.push(estado);
    whereClause += ` AND cu.estado_pago = $${params.length}`;
  }

  if (bloque) {
    params.push(`%${bloque}%`);
    whereClause += ` AND uv.bloque_edificio LIKE $${params.length}`;
  }

  const countQuery = `
    SELECT COUNT(*) as total
    FROM Cobros_Unidad cu
    INNER JOIN Unidades_Vecinales uv ON cu.unidad_id = uv.id
    ${whereClause}
  `;
  const { rows: countRows } = await consultar(countQuery, params);
  const total = parseInt(countRows[0].total, 10);

  const query = `
    SELECT cu.id, cu.unidad_id, uv.numero, uv.bloque_edificio, uv.alicuota,
      cu.monto_cobrado, cu.saldo_anterior, cu.total_a_pagar, cu.estado_pago,
      cu.created_at, cu.updated_at,
      row_to_json(uvr.*) as residente_principal,
      (
        SELECT row_to_json(p)
        FROM (
          SELECT pr.fecha_pago, pr.monto_pagado
          FROM Pagos_Registrados pr
          WHERE pr.cobro_unidad_id = cu.id
          ORDER BY pr.fecha_pago DESC
          LIMIT 1
        ) p
      ) as ultimo_pago
    FROM Cobros_Unidad cu
    INNER JOIN Unidades_Vecinales uv ON cu.unidad_id = uv.id
    LEFT JOIN LATERAL (
      SELECT u.id, u.nombre_completo, u.telefono
      FROM Usuarios_Unidades uu
      INNER JOIN Usuarios u ON uu.usuario_id = u.id
      WHERE uu.unidad_id = uv.id AND uu.es_residente = TRUE
      LIMIT 1
    ) uvr ON TRUE
    ${whereClause}
    ORDER BY uv.bloque_edificio ASC, uv.numero ASC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  params.push(porPagina, offset);
  const { rows } = await consultar(query, params);

  const resumenQuery = `
    SELECT
      COALESCE(SUM(cu.total_a_pagar), 0) as total_cobrado,
      COALESCE(SUM(CASE WHEN cu.estado_pago = 'pagado' THEN cu.total_a_pagar ELSE 0 END), 0) as total_pagado,
      COALESCE(SUM(CASE WHEN cu.estado_pago IN ('pendiente', 'moroso') THEN cu.total_a_pagar ELSE 0 END), 0) as total_pendiente,
      COUNT(CASE WHEN cu.estado_pago = 'pagado' THEN 1 END) as unidades_pagadas,
      COUNT(CASE WHEN cu.estado_pago = 'pendiente' THEN 1 END) as unidades_pendientes,
      COUNT(CASE WHEN cu.estado_pago = 'moroso' THEN 1 END) as unidades_morosas
    FROM Cobros_Unidad cu
    ${whereClause}
  `;
  const { rows: resumenRows } = await consultar(resumenQuery, params.slice(0, -2));

  return { rows, total, resumen: resumenRows[0] };
};

export const obtenerCobroPorId = async (id) => {
  const { rows } = await consultar(
    `SELECT cu.id, cu.unidad_id, cu.gasto_comun_mes_id, cu.monto_cobrado, cu.saldo_anterior,
      cu.total_a_pagar, cu.estado_pago, cu.created_at, cu.updated_at,
      row_to_json(uv.*) as unidad,
      row_to_json(gc.*) as gasto_comun
    FROM Cobros_Unidad cu
    INNER JOIN (
      SELECT uv.id, uv.numero, uv.bloque_edificio, uv.alicuota,
        (SELECT row_to_json(p) FROM (
          SELECT u.id, u.nombre_completo, u.email
          FROM Usuarios_Unidades uu
          INNER JOIN Usuarios u ON uu.usuario_id = u.id
          WHERE uu.unidad_id = uv.id AND uu.es_residente = FALSE
          LIMIT 1
        ) p) as propietario,
        (SELECT COALESCE(json_agg(row_to_json(r)), '[]')
         FROM (
          SELECT u.id, u.nombre_completo, u.telefono, uu.es_residente
          FROM Usuarios_Unidades uu
          INNER JOIN Usuarios u ON uu.usuario_id = u.id
          WHERE uu.unidad_id = uv.id
         ) r
        ) as residentes
      FROM Unidades_Vecinales uv
    ) uv ON cu.unidad_id = uv.id
    INNER JOIN (
      SELECT g.id, g.mes_anio, g.total_gastos
      FROM Gastos_Comunes_Mes g
    ) gc ON cu.gasto_comun_mes_id = gc.id
    WHERE cu.id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const obtenerCobroPorUnidadYGasto = async (unidadId, gastoId) => {
  const { rows } = await consultar(
    `SELECT * FROM Cobros_Unidad WHERE unidad_id = $1 AND gasto_comun_mes_id = $2`,
    [unidadId, gastoId]
  );
  return rows[0] || null;
};

export const actualizarEstadoCobro = async (id, estadoPago) => {
  const { rows } = await consultar(
    `UPDATE Cobros_Unidad
     SET estado_pago = $2
     WHERE id = $1
     RETURNING *`,
    [id, estadoPago]
  );
  return rows[0] || null;
};

export const registrarPago = async ({ cobroUnidadId, transaccionId, montoPagado, fechaPago, comprobanteUrl }) => {
  const { rows } = await consultar(
    `INSERT INTO Pagos_Registrados (cobro_unidad_id, transaccion_id, monto_pagado, fecha_pago, comprobante_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [cobroUnidadId, transaccionId, montoPagado, fechaPago, comprobanteUrl]
  );
  return rows[0];
};

export const obtenerPagosPorCobro = async (cobroUnidadId) => {
  const { rows } = await consultar(
    `SELECT pr.id, pr.cobro_unidad_id, pr.monto_pagado, pr.fecha_pago, pr.comprobante_url,
      pr.transaccion_id, pr.created_at,
      tp.pasarela
    FROM Pagos_Registrados pr
    LEFT JOIN Transacciones_Pasarela tp ON pr.transaccion_id = tp.id
    WHERE pr.cobro_unidad_id = $1
    ORDER BY pr.fecha_pago DESC`,
    [cobroUnidadId]
  );
  return rows;
};

export const obtenerPagosPorCondominio = async (condominioId, { pagina = 1, porPagina = 20, mesAnio, unidadId } = {}) => {
  const offset = (pagina - 1) * porPagina;
  const params = [condominioId];
  let whereClause = 'WHERE g.condominio_id = $1';

  if (mesAnio) {
    params.push(mesAnio);
    whereClause += ` AND g.mes_anio = $${params.length}`;
  }

  if (unidadId) {
    params.push(unidadId);
    whereClause += ` AND cu.unidad_id = $${params.length}`;
  }

  const countQuery = `
    SELECT COUNT(*) as total
    FROM Pagos_Registrados pr
    INNER JOIN Cobros_Unidad cu ON pr.cobro_unidad_id = cu.id
    INNER JOIN Gastos_Comunes_Mes g ON cu.gasto_comun_mes_id = g.id
    ${whereClause}
  `;
  const { rows: countRows } = await consultar(countQuery, params);
  const total = parseInt(countRows[0].total, 10);

  const query = `
    SELECT pr.id, pr.cobro_unidad_id, pr.monto_pagado, pr.fecha_pago, pr.comprobante_url,
      pr.transaccion_id, pr.created_at,
      tp.pasarela,
      row_to_json(uv.*) as unidad
    FROM Pagos_Registrados pr
    INNER JOIN Cobros_Unidad cu ON pr.cobro_unidad_id = cu.id
    INNER JOIN Gastos_Comunes_Mes g ON cu.gasto_comun_mes_id = g.id
    INNER JOIN (
      SELECT uv.id, uv.numero, uv.bloque_edificio
      FROM Unidades_Vecinales uv
    ) uv ON cu.unidad_id = uv.id
    LEFT JOIN Transacciones_Pasarela tp ON pr.transaccion_id = tp.id
    ${whereClause}
    ORDER BY pr.fecha_pago DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  params.push(porPagina, offset);
  const { rows } = await consultar(query, params);

  const totalQuery = `
    SELECT COALESCE(SUM(pr.monto_pagado), 0) as total_monto
    FROM Pagos_Registrados pr
    INNER JOIN Cobros_Unidad cu ON pr.cobro_unidad_id = cu.id
    INNER JOIN Gastos_Comunes_Mes g ON cu.gasto_comun_mes_id = g.id
    ${whereClause}
  `;
  const { rows: totalRows } = await consultar(totalQuery, params.slice(0, -2));

  return { rows, total, totalMonto: parseFloat(totalRows[0]?.total_monto || 0) };
};

export const marcarCobroComoPagado = async (id) => {
  const { rows } = await consultar(
    `UPDATE Cobros_Unidad
     SET estado_pago = 'pagado'
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return rows[0] || null;
};
