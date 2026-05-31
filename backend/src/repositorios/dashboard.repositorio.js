// =============================================================================
// SUMA — Repositorio de Dashboard Financiero
// Consultas SQL optimizadas para el resumen ejecutivo del condominio.
// =============================================================================

import { consultar } from '../config/database.js';

export const obtenerResumenPeriodoActual = async (condominioId) => {
  const { rows } = await consultar(
    `SELECT g.mes_anio, g.total_gastos, g.estado,
      COALESCE(SUM(cu.total_a_pagar), 0) as total_cobrado,
      COALESCE(SUM(CASE WHEN cu.estado_pago = 'pagado' THEN cu.total_a_pagar ELSE 0 END), 0) as total_pagado,
      COALESCE(SUM(CASE WHEN cu.estado_pago IN ('pendiente', 'moroso') THEN cu.total_a_pagar ELSE 0 END), 0) as total_pendiente
     FROM Gastos_Comunes_Mes g
     LEFT JOIN Cobros_Unidad cu ON cu.gasto_comun_mes_id = g.id
     WHERE g.condominio_id = $1 AND g.estado = 'publicado'
     GROUP BY g.id
     ORDER BY g.mes_anio DESC
     LIMIT 1`,
    [condominioId]
  );
  return rows[0] || null;
};

export const obtenerEstadoCuenta = async (condominioId) => {
  const { rows } = await consultar(
    `SELECT
      COUNT(DISTINCT uv.id) as unidades_activas,
      COUNT(DISTINCT CASE WHEN cu.estado_pago = 'pagado' THEN cu.id END) as pagadas,
      COUNT(DISTINCT CASE WHEN cu.estado_pago = 'pendiente' THEN cu.id END) as pendientes,
      COUNT(DISTINCT CASE WHEN cu.estado_pago = 'moroso' THEN cu.id END) as morosas
     FROM Unidades_Vecinales uv
     LEFT JOIN Cobros_Unidad cu ON cu.unidad_id = uv.id
       AND cu.gasto_comun_mes_id = (
         SELECT id FROM Gastos_Comunes_Mes
         WHERE condominio_id = $1 AND estado = 'publicado'
         ORDER BY mes_anio DESC LIMIT 1
       )
     WHERE uv.condominio_id = $1 AND uv.activo = TRUE`,
    [condominioId]
  );
  return rows[0] || {
    unidades_activas: 0,
    pagadas: 0,
    pendientes: 0,
    morosas: 0
  };
};

export const obtenerDeudaHistorica = async (condominioId) => {
  const { rows } = await consultar(
    `SELECT
      COALESCE(SUM(cu.total_a_pagar), 0) as total_deuda_anterior
     FROM Cobros_Unidad cu
     INNER JOIN Gastos_Comunes_Mes g ON cu.gasto_comun_mes_id = g.id
     WHERE g.condominio_id = $1
       AND g.mes_anio < (
         SELECT mes_anio FROM Gastos_Comunes_Mes
         WHERE condominio_id = $1 AND estado = 'publicado'
         ORDER BY mes_anio DESC LIMIT 1
       )
       AND cu.estado_pago IN ('pendiente', 'moroso')`,
    [condominioId]
  );

  const { rows: rowsPagado } = await consultar(
    `SELECT COALESCE(SUM(pr.monto_pagado), 0) as total_pagado_mes_anterior
     FROM Pagos_Registrados pr
     INNER JOIN Cobros_Unidad cu ON pr.cobro_unidad_id = cu.id
     INNER JOIN Gastos_Comunes_Mes g ON cu.gasto_comun_mes_id = g.id
     WHERE g.condominio_id = $1
       AND g.mes_anio < (
         SELECT mes_anio FROM Gastos_Comunes_Mes
         WHERE condominio_id = $1 AND estado = 'publicado'
         ORDER BY mes_anio DESC LIMIT 1
       )`,
    [condominioId]
  );

  const { rows: rowsDeudaReciente } = await consultar(
    `SELECT COALESCE(SUM(cu.total_a_pagar), 0) as deuda_reciente
     FROM Cobros_Unidad cu
     INNER JOIN Gastos_Comunes_Mes g ON cu.gasto_comun_mes_id = g.id
     WHERE g.condominio_id = $1
       AND g.mes_anio = (
         SELECT mes_anio FROM Gastos_Comunes_Mes
         WHERE condominio_id = $1 AND estado = 'publicado'
         ORDER BY mes_anio DESC LIMIT 1
       )
       AND cu.estado_pago IN ('pendiente', 'moroso')`,
    [condominioId]
  );

  return {
    total_deuda_anterior: parseFloat(rows[0]?.total_deuda_anterior || 0),
    total_pagado_mes_anterior: parseFloat(rowsPagado[0]?.total_pagado_mes_anterior || 0),
    deuda_reciente: parseFloat(rowsDeudaReciente[0]?.deuda_reciente || 0)
  };
};

export const obtenerEgresosPorCategoria = async (gastoId) => {
  const { rows } = await consultar(
    `SELECT categoria, SUM(monto) as total
     FROM Egresos_Operativos
     WHERE gasto_comun_mes_id = $1
     GROUP BY categoria
     ORDER BY total DESC`,
    [gastoId]
  );
  return rows;
};

export const obtenerPasarelasActivas = async (condominioId) => {
  const { rows } = await consultar(
    `SELECT pasarela
     FROM Credenciales_Pago_Condominio
     WHERE condominio_id = $1 AND activo = TRUE`,
    [condominioId]
  );
  return rows.map(r => r.pasarela);
};
