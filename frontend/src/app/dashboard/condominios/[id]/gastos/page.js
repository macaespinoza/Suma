// =============================================================================
// SUMA — Lista de Gastos Comunes del Condominio
// Vista de todos los períodos de gastos con su estado y acciones.
// =============================================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../../../../lib/api.js';
import TarjetaFormulario from '../../../../../componentes/ui/TarjetaFormulario.jsx';
import Boton from '../../../../../componentes/ui/Boton.jsx';
import styles from './gastos.module.css';

const formatoMoneda = (valor) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(valor || 0);

const formatearMes = (fecha) => {
  if (!fecha) return '—';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-CL', {
    month: 'long',
    year: 'numeric',
  });
};

const ESTADO_COLORES = {
  borrador: styles.estadoBorrador,
  publicado: styles.estadoPublicado,
};

export default function PaginaListaGastos() {
  const router = useRouter();
  const params = useParams();
  const condominioId = params.id;

  const [gastos, setGastos] = useState([]);
  const [condominio, setCondominio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resGastos, resCondominio] = await Promise.all([
          api.get(`/condominios/${condominioId}/gastos`),
          api.get(`/condominios/${condominioId}`),
        ]);
        setGastos(resGastos.datos || []);
        setCondominio(resCondominio.datos);
      } catch (err) {
        setError(err.message || 'Error al cargar los gastos.');
      } finally {
        setCargando(false);
      }
    };

    if (condominioId) {
      cargarDatos();
    }
  }, [condominioId]);

  const gastosFiltrados = filtroEstado
    ? gastos.filter((g) => g.estado === filtroEstado)
    : gastos;

  const handleCrearGasto = async () => {
    const mesAnio = new Date().toISOString().slice(0, 7) + '-01';
    setCreando(true);
    try {
      const nuevo = await api.post(`/condominios/${condominioId}/gastos`, {
        mes_anio: mesAnio,
        total_gastos: 0,
      });
      router.push(`/dashboard/condominios/${condominioId}/gastos/${nuevo.datos.id}`);
    } catch {
      setError('No se pudo crear el nuevo gasto.');
    } finally {
      setCreando(false);
    }
  };

  if (cargando) {
    return (
      <div className={styles.cargando}>
        <div className={styles.cargandoSpinner} />
        <p>Cargando gastos comunes...</p>
      </div>
    );
  }

  return (
    <div className={styles.pagina}>
      {/* Cabecera */}
      <div className={styles.cabecera}>
        <div className={styles.cabeceraNavegacion}>
          <Link href="/dashboard/condominios" className={styles.vinculoBreadcrumb}>
            Condominios
          </Link>
          <span className={styles.separadorBreadcrumb}>/</span>
          <span className={styles.textoBreadcrumb}>{condominio?.nombre}</span>
          <span className={styles.separadorBreadcrumb}>/</span>
          <span className={styles.paginaActual}>Gastos Comunes</span>
        </div>
        <div className={styles.cabeceraAcciones}>
          <Boton
            variante="primario"
            onClick={handleCrearGasto}
            cargando={creando}
          >
            + Nuevo Período
          </Boton>
        </div>
      </div>

      {/* Título */}
      <div className={styles.tituloSeccion}>
        <h1 className={styles.titulo}>Gastos Comunes</h1>
        <p className={styles.subtitulo}>
          {condominio?.nombre} — {gastos.length} período(s) registrado(s)
        </p>
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        <div className={styles.filtroGrupo}>
          <label className={styles.filtroLabel}>Estado:</label>
          <select
            className={styles.filtroSelect}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="borrador">Borrador</option>
            <option value="publicado">Publicado</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Lista de gastos */}
      {gastosFiltrados.length === 0 ? (
        <div className={styles.vacio}>
          <span className={styles.vacioIcono}>📋</span>
          <h3>No hay gastos registrados</h3>
          <p>Crea un nuevo período de gasto común para comenzar.</p>
          <Boton variante="primario" onClick={handleCrearGasto}>
            + Crear Primer Período
          </Boton>
        </div>
      ) : (
        <div className={styles.listaGastos}>
          {gastosFiltrados.map((gasto) => (
            <div key={gasto.id} className={styles.gastoCard}>
              <div className={styles.gastoCardMain}>
                <div className={styles.gastoCardInfo}>
                  <div className={styles.gastoCardHeader}>
                    <h3 className={styles.gastoCardTitulo}>
                      {formatearMes(gasto.mes_anio)}
                    </h3>
                    <span className={`${styles.estadoBadge} ${ESTADO_COLORES[gasto.estado]}`}>
                      {gasto.estado === 'publicado' ? '✓Publicado' : '⏳Borrador'}
                    </span>
                  </div>
                  <div className={styles.gastoCardMeta}>
                    <span className={styles.gastoCardFecha}>
                      Creado: {new Date(gasto.created_at).toLocaleDateString('es-CL')}
                    </span>
                  </div>
                </div>

                <div className={styles.gastoCardMetricas}>
                  <div className={styles.metricaItem}>
                    <span className={styles.metricaItemLabel}>Total Egresos</span>
                    <span className={styles.metricaItemValor}>
                      {formatoMoneda(gasto.total_gastos)}
                    </span>
                  </div>
                  <div className={styles.metricaItem}>
                    <span className={styles.metricaItemLabel}>Cobrado</span>
                    <span className={styles.metricaItemValor}>
                      {formatoMoneda(gasto.total_cobrado)}
                    </span>
                  </div>
                  <div className={`${styles.metricaItem} ${styles.metricaItemExito}`}>
                    <span className={styles.metricaItemLabel}>Recaudado</span>
                    <span className={styles.metricaItemValor}>
                      {formatoMoneda(gasto.total_pagado)}
                    </span>
                  </div>
                  <div className={`${styles.metricaItem} ${styles.metricaItemAdvertencia}`}>
                    <span className={styles.metricaItemLabel}>Pendiente</span>
                    <span className={styles.metricaItemValor}>
                      {formatoMoneda(gasto.total_pendiente)}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.gastoCardAcciones}>
                <Boton
                  variante="outline"
                  tamano="sm"
                  onClick={() => router.push(`/dashboard/condominios/${condominioId}/gastos/${gasto.id}`)}
                >
                  Ver Detalle
                </Boton>
                {gasto.estado === 'publicado' && (
                  <Boton
                    variante="fantasma"
                    tamano="sm"
                    onClick={() => {
                      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';
                      window.open(`${apiBaseUrl}/condominios/${condominioId}/gastos/${gasto.id}/liquidacion`, '_blank');
                    }}
                  >
                    📄 Liquidación PDF
                  </Boton>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}