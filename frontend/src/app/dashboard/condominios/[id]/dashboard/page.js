// =============================================================================
// SUMA — Dashboard Financiero del Condominio
// Vista del resumen ejecutivo financiero: gastos, cobros, estado de cuenta.
// =============================================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../../../../lib/api.js';
import TarjetaFormulario from '../../../../../componentes/ui/TarjetaFormulario.jsx';
import Boton from '../../../../../componentes/ui/Boton.jsx';
import styles from './dashboard.module.css';

const formatoMoneda = (valor) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);

const formatoPorcentaje = (valor) => `${valor.toFixed(1)}%`;

const formatearMes = (fecha) => {
  if (!fecha) return '—';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-CL', {
    month: 'long',
    year: 'numeric',
  });
};

export default function PaginaDashboardFinanciero() {
  const router = useRouter();
  const params = useParams();
  const condominioId = params.id;

  const [datos, setDatos] = useState(null);
  const [condominio, setCondominio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resDashboard, resCondominio] = await Promise.all([
          api.get(`/condominios/${condominioId}/dashboard/financiero`),
          api.get(`/condominios/${condominioId}`),
        ]);
        setDatos(resDashboard.datos);
        setCondominio(resCondominio.datos);
      } catch (err) {
        setError(err.message || 'Error al cargar los datos.');
      } finally {
        setCargando(false);
      }
    };

    if (condominioId) {
      cargarDatos();
    }
  }, [condominioId]);

  if (cargando) {
    return (
      <div className={styles.cargando}>
        <div className={styles.cargandoSpinner} />
        <p>Cargando dashboard financiero...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <div className={styles.errorIcono}>⚠️</div>
        <h3>Error al cargar</h3>
        <p>{error}</p>
        <Boton variante="fantasma" onClick={() => router.push('/dashboard/condominios')}>
          Volver a Condominios
        </Boton>
      </div>
    );
  }

  const { periodo_actual, estado_cuenta, deuda_historica, egresos_mes, pasarelas_activas } = datos;

  const categoriasEgresos = Object.entries(egresos_mes.por_categoria || {});
  const maxEgreso = Math.max(...categoriasEgresos.map(([, v]) => v), 1);

  return (
    <div className={styles.dashboard}>
      {/* Cabecera */}
      <div className={styles.cabecera}>
        <div className={styles.cabeceraNavegacion}>
          <Link href="/dashboard/condominios" className={styles.vinculoBreadcrumb}>
            Condominios
          </Link>
          <span className={styles.separadorBreadcrumb}>/</span>
          <span className={styles.textoBreadcrumb}>{condominio?.nombre}</span>
          <span className={styles.separadorBreadcrumb}>/</span>
          <span className={styles.paginaActual}>Dashboard Financiero</span>
        </div>
        <div className={styles.cabeceraAcciones}>
          <Boton
            variante="outline"
            tamano="sm"
            onClick={() => router.push(`/dashboard/condominios/${condominioId}`)}
          >
            ✏️ Editar Condominio
          </Boton>
        </div>
      </div>

      {/* Título */}
      <div className={styles.tituloSeccion}>
        <h1 className={styles.titulo}>
          {condominio?.nombre}
        </h1>
        <p className={styles.subtitulo}>
          Resumen financiero · {formatearMes(periodo_actual?.mes_anio)}
        </p>
      </div>

      {/* Grid principal de métricas */}
      <div className={styles.gridMetricas}>
        {/* Total Gastado */}
        <div className={`${styles.metricaCard} ${styles.metricaGastos}`}>
          <div className={styles.metricaHeader}>
            <span className={styles.metricaIcono}>💸</span>
            <span className={styles.metricaEtiqueta}>Total Gastado</span>
          </div>
          <div className={styles.metricaValor}>
            {formatoMoneda(periodo_actual?.total_gastos || 0)}
          </div>
          <div className={styles.metricaSubvalor}>
            {formatearMes(periodo_actual?.mes_anio)}
          </div>
        </div>

        {/* Total Cobrado */}
        <div className={`${styles.metricaCard} ${styles.metricaCobrado}`}>
          <div className={styles.metricaHeader}>
            <span className={styles.metricaIcono}>📋</span>
            <span className={styles.metricaEtiqueta}>Total Cobrado</span>
          </div>
          <div className={styles.metricaValor}>
            {formatoMoneda(periodo_actual?.total_cobrado || 0)}
          </div>
          <div className={styles.metricaSubvalor}>
            {estado_cuenta?.unidades_activas || 0} unidades
          </div>
        </div>

        {/* Total Recaudado */}
        <div className={`${styles.metricaCard} ${styles.metricaRecaudado}`}>
          <div className={styles.metricaHeader}>
            <span className={styles.metricaIcono}>💰</span>
            <span className={styles.metricaEtiqueta}>Total Recaudado</span>
          </div>
          <div className={styles.metricaValor}>
            {formatoMoneda(periodo_actual?.total_pagado || 0)}
          </div>
          <div className={`${styles.metricaSubvalor} ${styles.metricaSubvalorExito}`}>
            {formatoPorcentaje(periodo_actual?.tasa_recaudacion || 0)} de recaudación
          </div>
        </div>

        {/* Pendiente de Cobro */}
        <div className={`${styles.metricaCard} ${styles.metricaPendiente}`}>
          <div className={styles.metricaHeader}>
            <span className={styles.metricaIcono}>⏳</span>
            <span className={styles.metricaEtiqueta}>Por Cobrar</span>
          </div>
          <div className={styles.metricaValor}>
            {formatoMoneda(periodo_actual?.total_pendiente || 0)}
          </div>
          <div className={styles.metricaSubvalor}>
            {estado_cuenta?.pendientes || 0} pendientes · {estado_cuenta?.morosas || 0} morosas
          </div>
        </div>
      </div>

      {/* Grid secundario */}
      <div className={styles.gridSecundario}>
        {/* Estado de Cuenta */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitulo}>🏦 Estado de Cuenta</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.estadoCuentasGrid}>
              <div className={`${styles.estadoItem} ${styles.estadoItemExito}`}>
                <span className={styles.estadoNumero}>{estado_cuenta?.pagadas || 0}</span>
                <span className={styles.estadoEtiqueta}>Pagadas</span>
              </div>
              <div className={`${styles.estadoItem} ${styles.estadoItemAdvertencia}`}>
                <span className={styles.estadoNumero}>{estado_cuenta?.pendientes || 0}</span>
                <span className={styles.estadoEtiqueta}>Pendientes</span>
              </div>
              <div className={`${styles.estadoItem} ${styles.estadoItemError}`}>
                <span className={styles.estadoNumero}>{estado_cuenta?.morosas || 0}</span>
                <span className={styles.estadoEtiqueta}>Morosas</span>
              </div>
              <div className={`${styles.estadoItem} ${styles.estadoItemTotal}`}>
                <span className={styles.estadoNumero}>{estado_cuenta?.unidades_activas || 0}</span>
                <span className={styles.estadoEtiqueta}>Total</span>
              </div>
            </div>
            {/* Barra de progreso */}
            <div className={styles.barraProgreso}>
              {estado_cuenta?.unidades_activas > 0 && (
                <>
                  <div
                    className={`${styles.barraSegmento} ${styles.barraExito}`}
                    style={{ width: `${(estado_cuenta.pagadas / estado_cuenta.unidades_activas) * 100}%` }}
                  />
                  <div
                    className={`${styles.barraSegmento} ${styles.barraAdvertencia}`}
                    style={{ width: `${(estado_cuenta.pendientes / estado_cuenta.unidades_activas) * 100}%` }}
                  />
                  <div
                    className={`${styles.barraSegmento} ${styles.barraError}`}
                    style={{ width: `${(estado_cuenta.morosas / estado_cuenta.unidades_activas) * 100}%` }}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Deuda Histórica */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitulo}>📊 Historial de Deuda</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.deudaLista}>
              <div className={styles.deudaItem}>
                <div className={styles.deudaItemInfo}>
                  <span className={styles.deudaItemIcono}>📉</span>
                  <span className={styles.deudaItemLabel}>Deuda Anterior</span>
                </div>
                <span className={styles.deudaItemValor}>
                  {formatoMoneda(deuda_historica?.total_deuda_anterior || 0)}
                </span>
              </div>
              <div className={styles.deudaItem}>
                <div className={styles.deudaItemInfo}>
                  <span className={styles.deudaItemIcono}>✅</span>
                  <span className={styles.deudaItemLabel}>Recuperado</span>
                </div>
                <span className={`${styles.deudaItemValor} ${styles.deudaItemValorExito}`}>
                  {formatoMoneda(deuda_historica?.total_pagado_mes_anterior || 0)}
                </span>
              </div>
              <div className={styles.deudaItem}>
                <div className={styles.deudaItemInfo}>
                  <span className={styles.deudaItemIcono}>⚠️</span>
                  <span className={styles.deudaItemLabel}>Deuda Reciente</span>
                </div>
                <span className={`${styles.deudaItemValor} ${styles.deudaItemValorError}`}>
                  {formatoMoneda(deuda_historica?.deuda_reciente || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Egresos por Categoría */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitulo}>📑 Egresos del Mes</h3>
          <span className={styles.cardTotal}>{formatoMoneda(egresos_mes?.total || 0)}</span>
        </div>
        <div className={styles.cardBody}>
          {categoriasEgresos.length > 0 ? (
            <div className={styles.categoriasGrid}>
              {categoriasEgresos.map(([categoria, monto]) => (
                <div key={categoria} className={styles.categoriaItem}>
                  <div className={styles.categoriaHeader}>
                    <span className={styles.categoriaNombre}>{categoria}</span>
                    <span className={styles.categoriaMonto}>{formatoMoneda(monto)}</span>
                  </div>
                  <div className={styles.categoriaBarra}>
                    <div
                      className={styles.categoriaBarraRelleno}
                      style={{ width: `${(monto / maxEgreso) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.vacio}>
              <span>📭</span>
              <p>No hay egresos registrados este mes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pasarelas Activas */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitulo}>💳 Pasarelas de Pago</h3>
        </div>
        <div className={styles.cardBody}>
          {pasarelas_activas?.length > 0 ? (
            <div className={styles.pasarelasGrid}>
              {pasarelas_activas.map((pasarela) => (
                <div key={pasarela} className={styles.pasarelaItem}>
                  <span className={styles.pasarelaIcono}>
                    {pasarela === 'flow' && '🌊'}
                    {pasarela === 'fintoc' && '🔗'}
                    {pasarela === 'mercado_pago' && '🛒'}
                    {pasarela === 'webpay' && '🌐'}
                    {pasarela === 'transferencia_manual' && '🏦'}
                  </span>
                  <span className={styles.pasarelaNombre}>
                    {pasarela.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                  <span className={`${styles.pasarelaBadge} ${styles.pasarelaBadgeActiva}`}>
                    Activa
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.vacio}>
              <span>🔒</span>
              <p>No hay pasarelas de pago configuradas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}