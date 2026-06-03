// =============================================================================
// SUMA — Dashboard Financiero
// Vista ejecutiva de la situación financiera del condominio.
// Consume el endpoint GET /condominios/:id/dashboard/financiero
// y permite navegar entre períodos históricos.
// =============================================================================

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import api from '../../../lib/api.js';
import {
  Gear,
  Buildings,
  Warning,
  ChartBar,
  CalendarBlank,
  Coins,
  Check,
  Clock,
  House,
  TrendUp,
  Info,
  CreditCard,
  Link as LinkIcon,
  Bank,
} from '@phosphor-icons/react';
import styles from './page.module.css';

// Paleta de colores para barras de categorías de egresos.
const COLORES_CATEGORIAS = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1',
];

// Iconos decorativos para las pasarelas de pago.
const ICONOS_PASARELA = {
  flow: <LinkIcon size={16} weight="fill" />,
  fintoc: <LinkIcon size={16} weight="fill" />,
  mercado_pago: <LinkIcon size={16} weight="fill" />,
  webpay: <LinkIcon size={16} weight="fill" />,
  transferencia_manual: <Bank size={16} weight="fill" />,
};

/**
 * Formatea un monto numérico a pesos chilenos (CLP).
 * Ejemplo: 1500000 → "$1.500.000"
 */
const formatearCLP = (monto) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(monto || 0);

/**
 * Formatea una fecha de período (YYYY-MM-DD) a nombre de mes + año.
 * Ejemplo: "2025-06-01" → "Junio 2025"
 */
const formatearMes = (fecha) => {
  if (!fecha) return '—';
  const str = String(fecha).substring(0, 10);
  const [anio, mes] = str.split('-');
  const d = new Date(Date.UTC(parseInt(anio), parseInt(mes) - 1, 1));
  const nombre = d.toLocaleDateString('es-CL', { month: 'long', timeZone: 'UTC' });
  return `${nombre.charAt(0).toUpperCase() + nombre.slice(1)} ${anio}`;
};

/**
 * Retorna la clase CSS correspondiente a la tasa de recaudación.
 */
const obtenerClaseTasa = (tasa) => {
  if (tasa >= 80) return styles.tasaAlta;
  if (tasa >= 50) return styles.tasaMedia;
  return styles.tasaBaja;
};

/**
 * Página principal del Dashboard Financiero.
 * Muestra KPIs, egresos por categoría, estado de cuenta y tabla histórica.
 */
export default function PaginaDashboardFinanciero() {
  // --- Estado ---
  const [condominios, setCondominios] = useState([]);
  const [condominioId, setCondominioId] = useState('');
  const [datosVista, setDatosVista] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [periodoSelId, setPeriodoSelId] = useState('');
  const [esUltimoPeriodo, setEsUltimoPeriodo] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [error, setError] = useState(null);

  // Referencia al resumen original (último período publicado) para restaurar.
  const resumenOriginalRef = useRef(null);

  // --- Cargar condominios al montar ---
  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/condominios');
        const lista = res.datos || [];
        setCondominios(lista);
        if (lista.length > 0) {
          setCondominioId(lista[0].id);
        }
      } catch {
        setError('No se pudieron cargar los condominios.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  // --- Cargar datos financieros cuando cambia el condominio ---
  useEffect(() => {
    if (!condominioId) return;

    const cargarDatos = async () => {
      setCargandoDatos(true);
      setError(null);
      setDatosVista(null);

      try {
        const [resDashboard, resPeriodos] = await Promise.all([
          api.get(`/condominios/${condominioId}/dashboard/financiero`),
          api.get(`/condominios/${condominioId}/gastos?por_pagina=100`),
        ]);

        const dashboard = resDashboard.datos;
        resumenOriginalRef.current = dashboard;
        setDatosVista(dashboard);

        const listaPeriodos = resPeriodos.datos || [];
        setPeriodos(listaPeriodos);

        // Sincronizar el selector con el período actual del dashboard.
        if (dashboard?.periodo_actual?.mes_anio && listaPeriodos.length > 0) {
          const mesActual = String(dashboard.periodo_actual.mes_anio).substring(0, 10);
          const periodoActual = listaPeriodos.find(
            (p) => String(p.mes_anio).substring(0, 10) === mesActual
          );
          setPeriodoSelId(periodoActual?.id || listaPeriodos[0]?.id || '');
        } else if (listaPeriodos.length > 0) {
          setPeriodoSelId(listaPeriodos[0].id);
        }
        setEsUltimoPeriodo(true);
      } catch {
        setError('No se pudieron cargar los datos financieros.');
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarDatos();
  }, [condominioId]);

  // --- Handler: Cambiar período seleccionado ---
  const cambiarPeriodo = useCallback(
    async (gastoId) => {
      setPeriodoSelId(gastoId);

      const periodoSel = periodos.find((p) => p.id === gastoId);
      if (!periodoSel) return;

      const mesOriginal = String(
        resumenOriginalRef.current?.periodo_actual?.mes_anio || ''
      ).substring(0, 10);
      const mesSel = String(periodoSel.mes_anio).substring(0, 10);

      // Si es el período actual, restaurar los datos originales completos.
      if (mesOriginal === mesSel) {
        setDatosVista(resumenOriginalRef.current);
        setEsUltimoPeriodo(true);
        return;
      }

      // Período histórico: cargar egresos del período seleccionado.
      setCargandoDatos(true);
      setEsUltimoPeriodo(false);

      try {
        const resEgresos = await api.get(
          `/condominios/${condominioId}/gastos/${gastoId}/egresos`
        );

        const egresos = resEgresos.datos || [];
        const egresosMap = {};
        egresos.forEach((e) => {
          const cat = e.categoria || 'Otros';
          egresosMap[cat] = (egresosMap[cat] || 0) + parseFloat(e.monto || 0);
        });

        const totalCobrado = parseFloat(periodoSel.total_cobrado || 0);
        const totalPagado = parseFloat(periodoSel.total_pagado || 0);

        setDatosVista({
          periodo_actual: {
            mes_anio: periodoSel.mes_anio,
            total_gastos: parseFloat(periodoSel.total_gastos || 0),
            total_cobrado: totalCobrado,
            total_pagado: totalPagado,
            total_pendiente: parseFloat(periodoSel.total_pendiente || 0),
            tasa_recaudacion:
              totalCobrado > 0
                ? Math.round((totalPagado / totalCobrado) * 10000) / 100
                : 0,
          },
          egresos_mes: {
            total: parseFloat(periodoSel.total_gastos || 0),
            por_categoria: egresosMap,
          },
          estado_cuenta: null,
          deuda_historica: null,
          pasarelas_activas:
            resumenOriginalRef.current?.pasarelas_activas || [],
        });
      } catch {
        setError('Error al cargar el período histórico.');
      } finally {
        setCargandoDatos(false);
      }
    },
    [condominioId, periodos]
  );

  // --- Valores computados ---
  const categorias = datosVista?.egresos_mes?.por_categoria
    ? Object.entries(datosVista.egresos_mes.por_categoria).sort(
        ([, a], [, b]) => b - a
      )
    : [];
  const maxEgreso =
    categorias.length > 0 ? Math.max(...categorias.map(([, v]) => v)) : 0;

  const periodo = datosVista?.periodo_actual;
  const estado = datosVista?.estado_cuenta;
  const deuda = datosVista?.deuda_historica;
  const pasarelas = datosVista?.pasarelas_activas || [];
  const totalUnidades = estado
    ? parseInt(estado.pagadas) + parseInt(estado.pendientes) + parseInt(estado.morosas)
    : 0;

  const mesOriginalStr = String(
    resumenOriginalRef.current?.periodo_actual?.mes_anio || ''
  ).substring(0, 10);

  // =========================================================================
  // RENDER: Estado de carga inicial
  // =========================================================================
  if (cargando) {
    return (
      <div className={styles.pagina}>
        <div className={styles.cabecera}>
          <div className={styles.tituloGrupo}>
          <h1 className={styles.titulo}>Dashboard Financiero</h1>
          <p className={styles.subtitulo}>Cargando datos...</p>
        </div>
        <Link href="/dashboard/finanzas/gestion" className={styles.botonGestion}>
          <><Gear size={16} weight="bold" /> Gestionar Finanzas</>
        </Link>
      </div>
        <div className={styles.kpiGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`${styles.esqueleto} ${styles.esqueletoKpi}`} />
          ))}
        </div>
        <div className={styles.contenidoGrid}>
          <div className={`${styles.esqueleto} ${styles.esqueletoPanel}`} />
          <div className={`${styles.esqueleto} ${styles.esqueletoPanel}`} />
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: Sin condominios registrados
  // =========================================================================
  if (condominios.length === 0) {
    return (
      <div className={styles.pagina}>
        <div className={styles.cabecera}>
        <div className={styles.tituloGrupo}>
          <h1 className={styles.titulo}>Dashboard Financiero</h1>
        </div>
        <Link href="/dashboard/finanzas/gestion" className={styles.botonGestion}>
          <><Gear size={16} weight="bold" /> Gestionar Finanzas</>
        </Link>
      </div>
        <div className={styles.estadoVacio}>
          <span className={styles.estadoVacioIcono}><Buildings size={32} weight="fill" /></span>
          <h3 className={styles.estadoVacioTitulo}>Sin Condominios</h3>
          <p className={styles.estadoVacioTexto}>
            Registra tu primer condominio para comenzar a gestionar las
            finanzas del edificio.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: Dashboard completo
  // =========================================================================
  return (
    <div className={styles.pagina}>
      {/* --- Cabecera --- */}
      <div className={styles.cabecera}>
        <div className={styles.tituloGrupo}>
          <h1 className={styles.titulo}>Dashboard Financiero</h1>
          <p className={styles.subtitulo}>
            Resumen ejecutivo de la situación financiera del condominio.
          </p>
        </div>
        <Link href="/dashboard/finanzas/gestion" className={styles.botonGestion}>
          <><Gear size={16} weight="bold" /> Gestionar Finanzas</>
        </Link>
      </div>

      {/* --- Selectores: Condominio + Período --- */}
      <div className={styles.selectores}>
        <div className={styles.selectorGrupo}>
          <label htmlFor="selector-condominio" className={styles.selectorEtiqueta}>
            Condominio
          </label>
          <select
            id="selector-condominio"
            className={styles.selector}
            value={condominioId}
            onChange={(e) => setCondominioId(e.target.value)}
          >
            {condominios.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {periodos.length > 0 && (
          <div className={styles.selectorGrupo}>
            <label htmlFor="selector-periodo" className={styles.selectorEtiqueta}>
              Período
            </label>
            <select
              id="selector-periodo"
              className={styles.selector}
              value={periodoSelId}
              onChange={(e) => cambiarPeriodo(e.target.value)}
            >
              {periodos.map((p) => {
                const esActual =
                  String(p.mes_anio).substring(0, 10) === mesOriginalStr;
                return (
                  <option key={p.id} value={p.id}>
                    {formatearMes(p.mes_anio)}
                    {esActual ? ' (Actual)' : ''} — {p.estado}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* --- Error --- */}
      {error && (
        <div className={styles.error}>
          <span><Warning size={20} weight="fill" /></span> {error}
        </div>
      )}

      {/* --- Skeleton mientras carga datos --- */}
      {cargandoDatos && (
        <>
          <div className={styles.kpiGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`${styles.esqueleto} ${styles.esqueletoKpi}`} />
            ))}
          </div>
          <div className={styles.contenidoGrid}>
            <div className={`${styles.esqueleto} ${styles.esqueletoPanel}`} />
            <div className={`${styles.esqueleto} ${styles.esqueletoPanel}`} />
          </div>
        </>
      )}

      {/* --- Datos cargados --- */}
      {!cargandoDatos && datosVista && (
        <>
          {/* Sin períodos registrados */}
          {!periodo?.mes_anio && periodos.length === 0 && (
            <div className={styles.estadoVacio}>
              <span className={styles.estadoVacioIcono}><ChartBar size={32} weight="fill" /></span>
              <h3 className={styles.estadoVacioTitulo}>Sin Gastos Registrados</h3>
              <p className={styles.estadoVacioTexto}>
                Aún no hay períodos de gastos comunes creados para este
                condominio. Crea uno desde el módulo de Gastos Comunes.
              </p>
            </div>
          )}

          {/* Contenido financiero */}
          {(periodo?.mes_anio || periodos.length > 0) && (
            <>
              {/* Aviso de período histórico */}
              {!esUltimoPeriodo && (
                <div className={styles.infoBox}>
                  <><CalendarBlank size={16} weight="fill" /> Estás viendo datos del período{' '}</>
                  <strong>{formatearMes(periodo?.mes_anio)}</strong>. El detalle
                  de unidades y deuda histórica solo está disponible para el
                  período actual.
                </div>
              )}

              {/* ===== KPI Grid ===== */}
              <div className={styles.kpiGrid}>
                {/* KPI: Total Gastos */}
                <div className={`${styles.kpiTarjeta} ${styles.kpiGastos}`}>
                  <div className={styles.kpiIcono}><Coins size={24} weight="fill" /></div>
                  <div className={styles.kpiContenido}>
                    <span className={styles.kpiValor}>
                      {formatearCLP(periodo?.total_gastos)}
                    </span>
                    <span className={styles.kpiEtiqueta}>Gastos del Mes</span>
                    <span className={styles.kpiSubtexto}>
                      {formatearMes(periodo?.mes_anio)}
                    </span>
                  </div>
                </div>

                {/* KPI: Recaudado */}
                <div className={`${styles.kpiTarjeta} ${styles.kpiRecaudado}`}>
                  <div className={styles.kpiIcono}><Check size={24} weight="fill" /></div>
                  <div className={styles.kpiContenido}>
                    <span className={styles.kpiValor}>
                      {formatearCLP(periodo?.total_pagado)}
                    </span>
                    <span className={styles.kpiEtiqueta}>Recaudado</span>
                    <span className={styles.kpiSubtexto}>
                      de {formatearCLP(periodo?.total_cobrado)} cobrado
                    </span>
                  </div>
                </div>

                {/* KPI: Pendiente */}
                <div className={`${styles.kpiTarjeta} ${styles.kpiPendiente}`}>
                  <div className={styles.kpiIcono}><Clock size={24} weight="fill" /></div>
                  <div className={styles.kpiContenido}>
                    <span className={styles.kpiValor}>
                      {formatearCLP(periodo?.total_pendiente)}
                    </span>
                    <span className={styles.kpiEtiqueta}>Pendiente de Cobro</span>
                    <span className={styles.kpiSubtexto}>
                      {periodo?.total_cobrado > 0
                        ? `${(100 - (periodo?.tasa_recaudacion || 0)).toFixed(1)}% sin cobrar`
                        : 'Sin cobros generados'}
                    </span>
                  </div>
                </div>

                {/* KPI: Tasa de Recaudación */}
                <div className={`${styles.kpiTarjeta} ${styles.kpiTasa}`}>
                  <div className={styles.kpiIcono}><ChartBar size={24} weight="fill" /></div>
                  <div className={styles.kpiContenido}>
                    <span className={styles.kpiValor}>
                      {(periodo?.tasa_recaudacion || 0).toFixed(1)}%
                    </span>
                    <span className={styles.kpiEtiqueta}>
                      Tasa de Recaudación
                    </span>
                    <span
                      className={`${styles.tasaBadge} ${obtenerClaseTasa(periodo?.tasa_recaudacion || 0)}`}
                    >
                      {periodo?.tasa_recaudacion >= 80
                        ? 'Saludable'
                        : periodo?.tasa_recaudacion >= 50
                          ? 'Regular'
                          : 'Crítica'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ===== Grid de Contenido (2 columnas) ===== */}
              <div className={styles.contenidoGrid}>
                {/* --- Distribución de Egresos --- */}
                <div className={styles.tarjeta} style={{ animationDelay: '0.25s' }}>
                  <h3 className={styles.tarjetaTitulo}>
                    <ClipboardText size={20} weight="fill" /> Distribución de Egresos
                  </h3>
                  {categorias.length > 0 ? (
                    <div className={styles.egresosLista}>
                      {categorias.map(([cat, monto], idx) => {
                        const porcentaje =
                          maxEgreso > 0 ? (monto / maxEgreso) * 100 : 0;
                        const color =
                          COLORES_CATEGORIAS[idx % COLORES_CATEGORIAS.length];
                        return (
                          <div key={cat} className={styles.egresoFila}>
                            <div className={styles.egresoInfo}>
                              <span className={styles.egresoCategoria}>
                                <span
                                  className={styles.egresoColor}
                                  style={{ background: color }}
                                />
                                {cat}
                              </span>
                              <span className={styles.egresoMonto}>
                                {formatearCLP(monto)}
                              </span>
                            </div>
                            <div className={styles.egresoBarra}>
                              <div
                                className={styles.egresoBarraRelleno}
                                style={{
                                  '--ancho-barra': `${porcentaje}%`,
                                  background: `linear-gradient(90deg, ${color}, ${color}88)`,
                                  animationDelay: `${idx * 0.1}s`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className={styles.egresosVacio}>
                      Sin egresos registrados para este período.
                    </p>
                  )}
                </div>

                {/* --- Estado de Cuenta por Unidades --- */}
                <div className={styles.tarjeta} style={{ animationDelay: '0.3s' }}>
                  <h3 className={styles.tarjetaTitulo}>
                    <House size={20} weight="fill" /> Estado de Cuenta por Unidades
                  </h3>

                  {estado && esUltimoPeriodo ? (
                    <>
                      {/* Contadores */}
                      <div className={styles.estadoGrid}>
                        <div className={styles.estadoItem}>
                          <div className={`${styles.estadoNumero} ${styles.numExito}`}>
                            {estado.pagadas}
                          </div>
                          <div className={styles.estadoEtiqueta}>Pagadas</div>
                        </div>
                        <div className={styles.estadoItem}>
                          <div className={`${styles.estadoNumero} ${styles.numAdvertencia}`}>
                            {estado.pendientes}
                          </div>
                          <div className={styles.estadoEtiqueta}>Pendientes</div>
                        </div>
                        <div className={styles.estadoItem}>
                          <div className={`${styles.estadoNumero} ${styles.numError}`}>
                            {estado.morosas}
                          </div>
                          <div className={styles.estadoEtiqueta}>Morosas</div>
                        </div>
                      </div>

                      {/* Barra de progreso segmentada */}
                      {totalUnidades > 0 && (
                        <div className={styles.barraProgreso}>
                          <div
                            className={`${styles.barraSegmento} ${styles.segExito}`}
                            style={{
                              width: `${(estado.pagadas / totalUnidades) * 100}%`,
                            }}
                          />
                          <div
                            className={`${styles.barraSegmento} ${styles.segAdvertencia}`}
                            style={{
                              width: `${(estado.pendientes / totalUnidades) * 100}%`,
                            }}
                          />
                          <div
                            className={`${styles.barraSegmento} ${styles.segError}`}
                            style={{
                              width: `${(estado.morosas / totalUnidades) * 100}%`,
                            }}
                          />
                        </div>
                      )}

                      {/* Deuda histórica */}
                      {deuda && (
                        <div className={styles.deudaSeccion}>
                          <h4 className={styles.deudaSeccionTitulo}>
                            <TrendUp size={20} weight="fill" /> Deuda Histórica
                          </h4>
                          <div className={styles.deudaFila}>
                            <span className={styles.deudaEtiqueta}>
                              Deuda de meses anteriores
                            </span>
                            <span className={styles.deudaMonto}>
                              {formatearCLP(deuda.total_deuda_anterior)}
                            </span>
                          </div>
                          <div className={styles.deudaFila}>
                            <span className={styles.deudaEtiqueta}>
                              Pagado de meses anteriores
                            </span>
                            <span className={styles.deudaMonto}>
                              {formatearCLP(deuda.total_pagado_mes_anterior)}
                            </span>
                          </div>
                          <div className={styles.deudaFila}>
                            <span className={styles.deudaEtiqueta}>
                              Deuda del mes actual
                            </span>
                            <span className={styles.deudaMonto}>
                              {formatearCLP(deuda.deuda_reciente)}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={styles.infoBox}>
                      <><Info size={16} weight="fill" /> El detalle de unidades y deuda histórica está</>
                      disponible solo para el período más reciente publicado.
                    </div>
                  )}

                  {/* Pasarelas de pago activas */}
                  {pasarelas.length > 0 && esUltimoPeriodo && (
                    <div
                      className={styles.deudaSeccion}
                      style={{ marginTop: 'var(--espacio-4)' }}
                    >
                      <h4 className={styles.deudaSeccionTitulo}>
                        <CreditCard size={20} weight="fill" /> Pasarelas de Pago Activas
                      </h4>
                      <div className={styles.pasarelasContenedor}>
                        {pasarelas.map((p) => (
                          <span key={p} className={styles.pasarelaBadge}>
                            {ICONOS_PASARELA[p] || <LinkIcon size={16} weight="fill" />}{' '}
                            {p.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ===== Tabla Histórica de Períodos ===== */}
              {periodos.length > 0 && (
                <div className={`${styles.tarjeta} ${styles.tablaContenedor}`}>
                  <h3 className={styles.tarjetaTitulo}>
                    <CalendarBlank size={20} weight="fill" /> Historial de Períodos
                  </h3>
                  <div className={styles.tablaScroll}>
                    <table className={styles.tablaHistorico}>
                      <thead>
                        <tr>
                          <th>Período</th>
                          <th>Total Gastos</th>
                          <th>Cobrado</th>
                          <th>Pagado</th>
                          <th>Pendiente</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {periodos.map((p) => (
                          <tr
                            key={p.id}
                            className={
                              p.id === periodoSelId ? styles.filaActiva : ''
                            }
                            onClick={() => cambiarPeriodo(p.id)}
                          >
                            <td>{formatearMes(p.mes_anio)}</td>
                            <td>{formatearCLP(p.total_gastos)}</td>
                            <td>{formatearCLP(p.total_cobrado)}</td>
                            <td className={styles.tablaMontoPositivo}>
                              {formatearCLP(p.total_pagado)}
                            </td>
                            <td className={styles.tablaMontoPendiente}>
                              {formatearCLP(p.total_pendiente)}
                            </td>
                            <td>
                              <span
                                className={`${styles.estadoBadge} ${
                                  p.estado === 'publicado'
                                    ? styles.estadoPublicado
                                    : styles.estadoBorrador
                                }`}
                              >
                                {p.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
