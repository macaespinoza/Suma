// =============================================================================
// SUMA — Dashboard Financiero (Mobile-First, 100% Mock Data)
// Condominio Chinchorro — Junio 2026
// Sin llamadas a API. Datos estáticos para el prototipo inversionista.
// WCAG 2.2 AA: role="region", aria-label en barras de progreso.
// =============================================================================

'use client';

import {
  Coins,
  Check,
  Clock,
  ChartBar,
  House,
  TrendUp,
  CalendarBlank,
} from '@phosphor-icons/react';
import styles from './page.module.css';

// ---------------------------------------------------------------------------
// Mock data — Condominio Chinchorro
// ---------------------------------------------------------------------------
const MOCK = {
  condominio: 'Condominio Chinchorro',
  periodoActual: {
    id: '1',
    mes_largo: 'Junio 2026',
    total_gastos: 1840000,
    total_cobrado: 1840000,
    total_pagado: 1472000,
    total_pendiente: 368000,
    tasa_recaudacion: 80.0,
  },
  egresos: [
    { categoria: 'Conserjería y Seguridad', monto: 480000 },
    { categoria: 'Agua Potable',            monto: 520000 },
    { categoria: 'Electricidad AA.CC.',     monto: 380000 },
    { categoria: 'Mantención Ascensor',     monto: 220000 },
    { categoria: 'Aseo y Limpieza',         monto: 180000 },
    { categoria: 'Varios',                  monto: 60000 },
  ],
  estado_unidades: {
    pagadas: 38,
    pendientes: 7,
    morosas: 3,
    total: 48,
  },
  historial: [
    { id: '1', mes: 'Junio 2026',  gastos: 1840000, pagado: 1472000, tasa: 80.0,  estado: 'publicado', actual: true },
    { id: '2', mes: 'Mayo 2026',   gastos: 1790000, pagado: 1612000, tasa: 90.1,  estado: 'publicado', actual: false },
    { id: '3', mes: 'Abril 2026',  gastos: 1820000, pagado: 1638000, tasa: 90.0,  estado: 'publicado', actual: false },
    { id: '4', mes: 'Marzo 2026',  gastos: 1750000, pagado: 1750000, tasa: 100.0, estado: 'publicado', actual: false },
  ],
};

// Paleta de colores oficial SUMA para las barras
const COLORES = ['#4ded97', '#ffc20b', '#f765ab', '#ff7300', '#3dd98a', '#e6af00'];

/** Formatea a pesos chilenos (CLP) */
const formatCLP = (n) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n ?? 0);

/** Retorna clase CSS según la tasa de recaudación */
const claseTasa = (t) => {
  if (t >= 80) return styles.tasaAlta;
  if (t >= 50) return styles.tasaMedia;
  return styles.tasaBaja;
};

/** Retorna etiqueta de salud según la tasa */
const etiquetaTasa = (t) => {
  if (t >= 80) return 'Saludable';
  if (t >= 50) return 'Regular';
  return 'Crítica';
};

/** Página principal del Dashboard Financiero — Prototipo Estático */
export default function PaginaDashboardFinanciero() {
  const { periodoActual: p, egresos, estado_unidades: eu, historial } = MOCK;

  // Calcular máximo de egresos para normalizar barras
  const maxEgreso = Math.max(...egresos.map((e) => e.monto));
  const { pagadas, pendientes, morosas, total } = eu;

  return (
    <div className={styles.pagina}>

      {/* ===== Chip de período ===== */}
      <div className={styles.periodoChip} aria-label={`Período actual: ${p.mes_largo}`}>
        <CalendarBlank size={15} weight="fill" aria-hidden="true" />
        <span>{p.mes_largo}</span>
        <span className={styles.chipBadge}>Actual</span>
      </div>

      {/* ===== KPI Grid 2×2 ===== */}
      <section
        className={styles.kpiGrid}
        aria-label="Indicadores financieros del período"
      >
        {/* Gastos del mes */}
        <div className={`${styles.kpi} ${styles.kpiAmarillo}`}>
          <span className={styles.kpiIcono} aria-hidden="true">
            <Coins size={22} weight="fill" />
          </span>
          <span className={styles.kpiValor}>{formatCLP(p.total_gastos)}</span>
          <span className={styles.kpiLabel}>Gastos del Mes</span>
        </div>

        {/* Recaudado */}
        <div className={`${styles.kpi} ${styles.kpiVerde}`}>
          <span className={styles.kpiIcono} aria-hidden="true">
            <Check size={22} weight="bold" />
          </span>
          <span className={styles.kpiValor}>{formatCLP(p.total_pagado)}</span>
          <span className={styles.kpiLabel}>Recaudado</span>
          <span className={styles.kpiSub}>de {formatCLP(p.total_cobrado)}</span>
        </div>

        {/* Pendiente */}
        <div className={`${styles.kpi} ${styles.kpiNaranja}`}>
          <span className={styles.kpiIcono} aria-hidden="true">
            <Clock size={22} weight="fill" />
          </span>
          <span className={styles.kpiValor}>{formatCLP(p.total_pendiente)}</span>
          <span className={styles.kpiLabel}>Pendiente</span>
        </div>

        {/* Tasa de recaudación */}
        <div className={`${styles.kpi} ${styles.kpiRosa}`}>
          <span className={styles.kpiIcono} aria-hidden="true">
            <ChartBar size={22} weight="fill" />
          </span>
          <span className={styles.kpiValor}>{p.tasa_recaudacion.toFixed(1)}%</span>
          <span className={styles.kpiLabel}>Tasa Recaudación</span>
          <span
            className={`${styles.tasaBadge} ${claseTasa(p.tasa_recaudacion)}`}
            aria-label={`Tasa ${etiquetaTasa(p.tasa_recaudacion)}`}
          >
            {etiquetaTasa(p.tasa_recaudacion)}
          </span>
        </div>
      </section>

      {/* ===== Distribución de Egresos ===== */}
      <section
        className={styles.tarjeta}
        aria-label="Distribución de egresos por categoría"
      >
        <h2 className={styles.tarjetaTitulo}>
          <Coins size={18} weight="fill" aria-hidden="true" />
          Distribución de Egresos
        </h2>
        <div className={styles.egresosLista}>
          {egresos.map(({ categoria, monto }, idx) => {
            const color = COLORES[idx % COLORES.length];
            const pct = maxEgreso > 0 ? (monto / maxEgreso) * 100 : 0;
            return (
              <div key={categoria} className={styles.egresoFila}>
                <div className={styles.egresoInfo}>
                  <span className={styles.egresoCategoria}>
                    <span
                      className={styles.egresoColor}
                      style={{ background: color }}
                      aria-hidden="true"
                    />
                    {categoria}
                  </span>
                  <span className={styles.egresoMonto}>{formatCLP(monto)}</span>
                </div>
                <div className={styles.egresoBarra}>
                  <div
                    className={styles.egresoBarraRelleno}
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${color}, ${color}99)`,
                      animationDelay: `${idx * 0.07}s`,
                    }}
                    role="progressbar"
                    aria-valuenow={Math.round(pct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${categoria}: ${formatCLP(monto)}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== Estado de Unidades ===== */}
      <section
        className={styles.tarjeta}
        aria-label="Estado de pago de unidades del condominio"
      >
        <h2 className={styles.tarjetaTitulo}>
          <House size={18} weight="fill" aria-hidden="true" />
          Estado de Unidades
        </h2>

        {/* Contadores */}
        <div className={styles.estadoGrid} role="group" aria-label="Conteo de unidades por estado">
          <div className={styles.estadoItem}>
            <span className={`${styles.estadoNum} ${styles.numVerde}`}>{pagadas}</span>
            <span className={styles.estadoLabel}>Pagadas</span>
          </div>
          <div className={styles.estadoItem}>
            <span className={`${styles.estadoNum} ${styles.numAmarillo}`}>{pendientes}</span>
            <span className={styles.estadoLabel}>Pendientes</span>
          </div>
          <div className={styles.estadoItem}>
            <span className={`${styles.estadoNum} ${styles.numRojo}`}>{morosas}</span>
            <span className={styles.estadoLabel}>Morosas</span>
          </div>
        </div>

        {/* Barra de progreso segmentada */}
        <div
          className={styles.barraProgreso}
          role="group"
          aria-label={`Distribución: ${pagadas} pagadas, ${pendientes} pendientes, ${morosas} morosas de ${total} totales`}
        >
          <div
            className={`${styles.barraSegmento} ${styles.segVerde}`}
            style={{ width: `${(pagadas / total) * 100}%` }}
          />
          <div
            className={`${styles.barraSegmento} ${styles.segAmarillo}`}
            style={{ width: `${(pendientes / total) * 100}%` }}
          />
          <div
            className={`${styles.barraSegmento} ${styles.segRojo}`}
            style={{ width: `${(morosas / total) * 100}%` }}
          />
        </div>

        <p className={styles.estadoTexto}>
          <TrendUp size={14} weight="fill" aria-hidden="true" />
          {pagadas} de {total} unidades al día ({((pagadas / total) * 100).toFixed(0)}%)
        </p>
      </section>

      {/* ===== Historial de Períodos ===== */}
      <section
        className={styles.tarjeta}
        aria-label="Historial de períodos de gastos comunes"
      >
        <h2 className={styles.tarjetaTitulo}>
          <CalendarBlank size={18} weight="fill" aria-hidden="true" />
          Historial de Períodos
        </h2>
        <div className={styles.historialLista}>
          {historial.map((h, i) => (
            <div
              key={h.id}
              className={`${styles.historialItem} ${h.actual ? styles.historialActivo : ''}`}
              style={{ animationDelay: `${i * 0.06}s` }}
              aria-label={`${h.mes}: tasa ${h.tasa}%`}
            >
              <div className={styles.historialHeader}>
                <span className={styles.historialMes}>{h.mes}</span>
                <div className={styles.historialDerecha}>
                  {h.actual && (
                    <span className={styles.historialBadgeActual}>Actual</span>
                  )}
                  <span
                    className={`${styles.historialTasa} ${claseTasa(h.tasa)}`}
                  >
                    {h.tasa.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className={styles.historialDetalle}>
                <span className={styles.historialMonto}>{formatCLP(h.gastos)}</span>
              </div>
              {/* Barra de tasa */}
              <div className={styles.historialBarraBg} aria-hidden="true">
                <div
                  className={styles.historialBarraRelleno}
                  style={{ width: `${h.tasa}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
