// =============================================================================
// SUMA — Servicio de Dashboard Financiero
// Lógica de negocio: resumen ejecutivo de la situación financiera.
// =============================================================================

import * as dashboardRepo from '../repositorios/dashboard.repositorio.js';
import * as unidadesRepo from '../repositorios/condominios.repositorio.js';
import { ErrorApp } from '../middlewares/errores.js';

export const obtenerResumenFinanciero = async (condominioId) => {
  const condominio = await unidadesRepo.obtenerPorId(condominioId);
  if (!condominio) {
    throw new ErrorApp('CONDOMINIO_NO_ENCONTRADO', 'El condominio no existe.', 404);
  }

  const periodoActual = await dashboardRepo.obtenerResumenPeriodoActual(condominioId);
  const estadoCuenta = await dashboardRepo.obtenerEstadoCuenta(condominioId);
  const deudaHistorica = await dashboardRepo.obtenerDeudaHistorica(condominioId);

  let egresosMes = { total: 0, por_categoria: {} };
  if (periodoActual) {
    const egresos = await dashboardRepo.obtenerEgresosPorCategoria(periodoActual.id);
    egresosMes = {
      total: parseFloat(periodoActual.total_gastos),
      por_categoria: egresos.reduce((acc, e) => {
        acc[e.categoria] = parseFloat(e.total);
        return acc;
      }, {})
    };
  }

  const pasarelasActivas = await dashboardRepo.obtenerPasarelasActivas(condominioId);

  let tasaRecaudacion = 0;
  if (periodoActual && parseFloat(periodoActual.total_cobrado) > 0) {
    tasaRecaudacion = Math.round(
      (parseFloat(periodoActual.total_pagado) / parseFloat(periodoActual.total_cobrado)) * 100 * 100
    ) / 100;
  }

  return {
    periodo_actual: {
      mes_anio: periodoActual?.mes_anio || null,
      total_gastos: parseFloat(periodoActual?.total_gastos || 0),
      total_cobrado: parseFloat(periodoActual?.total_cobrado || 0),
      total_pagado: parseFloat(periodoActual?.total_pagado || 0),
      total_pendiente: parseFloat(periodoActual?.total_pendiente || 0),
      tasa_recaudacion: tasaRecaudacion
    },
    estado_cuenta: {
      unidades_activas: parseInt(estadoCuenta.unidades_activas),
      pagadas: parseInt(estadoCuenta.pagadas),
      pendientes: parseInt(estadoCuenta.pendientes),
      morosas: parseInt(estadoCuenta.morosas)
    },
    deuda_historica: {
      total_deuda_anterior: deudaHistorica.total_deuda_anterior,
      total_pagado_mes_anterior: deudaHistorica.total_pagado_mes_anterior,
      deuda_reciente: deudaHistorica.deuda_reciente
    },
    egresos_mes: egresosMes,
    pasarelas_activas: pasarelasActivas
  };
};
