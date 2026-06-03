// =============================================================================
// SUMA — Lista de Cobros por Gasto
// Vista de todos los cobros generados para un período de gasto.
// =============================================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../../../../../../lib/api.js';
import TarjetaFormulario from '../../../../../../../componentes/ui/TarjetaFormulario.jsx';
import Boton from '../../../../../../../componentes/ui/Boton.jsx';
import Input from '../../../../../../../componentes/ui/Input.jsx';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  WarningOctagon,
  Coins,
  Warning,
  X,
  Tray,
  User,
  ArrowCounterClockwise,
} from '@phosphor-icons/react';
import styles from './cobros.module.css';

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
  pendiente: styles.estadoPendiente,
  pagado: styles.estadoPagado,
  moroso: styles.estadoMoroso,
};

const ESTADO_ICONOS = {
  pendiente: <Clock size={16} weight="fill" />,
  pagado: <CheckCircle size={16} weight="fill" />,
  moroso: <WarningOctagon size={16} weight="fill" />,
};

export default function PaginaListaCobros() {
  const router = useRouter();
  const params = useParams();
  const condominioId = params.id;
  const gastoId = params.gastoId;

  const [cobros, setCobros] = useState([]);
  const [gasto, setGasto] = useState(null);
  const [condominio, setCondominio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroBloque, setFiltroBloque] = useState('');
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const paramsFetch = new URLSearchParams();
        if (filtroEstado) paramsFetch.append('estado', filtroEstado);
        if (filtroBloque) paramsFetch.append('bloque', filtroBloque);

        const [resCobros, resGasto, resCondominio] = await Promise.all([
          api.get(`/condominios/${condominioId}/gastos/${gastoId}/cobros?${paramsFetch.toString()}`),
          api.get(`/condominios/${condominioId}/gastos/${gastoId}`),
          api.get(`/condominios/${condominioId}`),
        ]);

        setCobros(resCobros.datos || []);
        setGasto(resGasto.datos);
        setCondominio(resCondominio.datos);
        setResumen(resCobros.metadata?.resumen);
      } catch (err) {
        setError(err.message || 'Error al cargar los cobros.');
      } finally {
        setCargando(false);
      }
    };

    if (condominioId && gastoId) {
      cargarDatos();
    }
  }, [condominioId, gastoId, filtroEstado, filtroBloque]);

  const handleCambiarEstado = async (cobroId, nuevoEstado) => {
    if (!confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) return;

    try {
      await api.patch(`/condominios/${condominioId}/cobros/${cobroId}/estado`, {
        estado_pago: nuevoEstado,
      });
      const res = await api.get(`/condominios/${condominioId}/gastos/${gastoId}/cobros`);
      setCobros(res.datos || []);
      setResumen(res.metadata?.resumen);
    } catch (err) {
      alert(err.message || 'No se pudo cambiar el estado.');
    }
  };

  if (cargando) {
    return (
      <div className={styles.cargando}>
        <div className={styles.cargandoSpinner} />
        <p>Cargando cobros...</p>
      </div>
    );
  }

  return (
    <div className={styles.pagina}>
      {/* Cabecera */}
      <div className={styles.cabecera}>
        <div className={styles.cabeceraNavegacion}>
          <Link href="/dashboard/condominios" className={styles.vinculoBreadcrumb}>Condominios</Link>
          <span className={styles.separadorBreadcrumb}>/</span>
          <Link href={`/dashboard/condominios/${condominioId}/gastos`} className={styles.vinculoBreadcrumb}>Gastos</Link>
          <span className={styles.separadorBreadcrumb}>/</span>
          <span className={styles.textoBreadcrumb}>{gasto ? formatearMes(gasto.mes_anio) : '...'}</span>
          <span className={styles.separadorBreadcrumb}>/</span>
          <span className={styles.paginaActual}>Cobros</span>
        </div>
        <div className={styles.cabeceraAcciones}>
          <Boton variante="outline" onClick={() => router.push(`/dashboard/condominios/${condominioId}/gastos/${gastoId}`)}>
            <><ArrowLeft size={16} weight="bold" /> Volver al Gasto</>
          </Boton>
        </div>
      </div>

      {/* Título */}
      <div className={styles.tituloSeccion}>
        <h1 className={styles.titulo}>Cobros por Unidad</h1>
        <p className={styles.subtitulo}>
          {condominio?.nombre} — {formatearMes(gasto?.mes_anio)} — {cobros.length} unidad(es)
        </p>
      </div>

      {/* Resumen */}
      {resumen && (
        <div className={styles.resumenGrid}>
          <div className={styles.resumenCard}>
            <span className={styles.resumenIcono}><Coins size={24} weight="fill" /></span>
            <div className={styles.resumenInfo}>
              <span className={styles.resumenLabel}>Total a Cobrar</span>
              <span className={styles.resumenValor}>{formatoMoneda(resumen.total_cobrado)}</span>
            </div>
          </div>
          <div className={`${styles.resumenCard} ${styles.resumenCardExito}`}>
            <span className={styles.resumenIcono}><CheckCircle size={24} weight="fill" /></span>
            <div className={styles.resumenInfo}>
              <span className={styles.resumenLabel}>Recaudado</span>
              <span className={styles.resumenValor}>{formatoMoneda(resumen.total_pagado)}</span>
            </div>
          </div>
          <div className={`${styles.resumenCard} ${styles.resumenCardAdvertencia}`}>
            <span className={styles.resumenIcono}><Clock size={24} weight="fill" /></span>
            <div className={styles.resumenInfo}>
              <span className={styles.resumenLabel}>Pendiente</span>
              <span className={styles.resumenValor}>{formatoMoneda(resumen.total_pendiente)}</span>
            </div>
          </div>
          <div className={styles.resumenCard}>
            <div className={styles.resumenBarra}>
              <div className={styles.barraItem}>
                <span className={styles.barraNumero}>{resumen.unidades_pagadas || 0}</span>
                <span className={styles.barraLabel}>Pagadas</span>
              </div>
              <div className={styles.barraItem}>
                <span className={styles.barraNumero}>{resumen.unidades_pendientes || 0}</span>
                <span className={styles.barraLabel}>Pendientes</span>
              </div>
              <div className={styles.barraItem}>
                <span className={styles.barraNumero}>{resumen.unidades_morosas || 0}</span>
                <span className={styles.barraLabel}>Morosas</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="moroso">Moroso</option>
          </select>
        </div>
        <div className={styles.filtroGrupo}>
          <Input
            nombre="bloque"
            etiqueta="Bloque/Torre"
            valor={filtroBloque}
            onChange={(e) => setFiltroBloque(e.target.value)}
            placeholder="Ej: Torre A"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.errorBanner}>
          <span><Warning size={20} weight="fill" /></span>
          <p>{error}</p>
          <button onClick={() => setError(null)}><X size={16} weight="bold" /></button>
        </div>
      )}

      {/* Lista de cobros */}
      {cobros.length === 0 ? (
        <div className={styles.vacio}>
          <span className={styles.vacioIcono}><Tray size={32} weight="fill" /></span>
          <h3>No hay cobros registrados</h3>
          <p>Los cobros se generan automáticamente al publicar el gasto.</p>
        </div>
      ) : (
        <div className={styles.listaCobros}>
          {cobros.map((cobro) => (
            <div key={cobro.id} className={styles.cobroCard}>
              <div className={styles.cobroCardMain}>
                <div className={styles.cobroCardInfo}>
                  <div className={styles.cobroCardHeader}>
                    <h3 className={styles.cobroCardTitulo}>
                      {cobro.bloque_edificio ? `${cobro.bloque_edificio} - ` : ''}Unidad {cobro.numero}
                    </h3>
                    <span className={`${styles.estadoBadge} ${ESTADO_COLORES[cobro.estado_pago]}`}>
                      {ESTADO_ICONOS[cobro.estado_pago]} {cobro.estado_pago}
                    </span>
                  </div>
                  <div className={styles.cobroCardMeta}>
                    <span className={styles.cobroCardAlicuota}>
                      Alícuota: {(parseFloat(cobro.alicuota) * 100).toFixed(2)}%
                    </span>
                    {cobro.residente_principal && (
                      <span className={styles.cobroCardResidente}>
                        <><User size={16} weight="fill" /> {cobro.residente_principal.nombre_completo}</>
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.cobroCardMontos}>
                  <div className={styles.montoItem}>
                    <span className={styles.montoLabel}>Monto Mes</span>
                    <span className={styles.montoValor}>{formatoMoneda(cobro.monto_cobrado)}</span>
                  </div>
                  {parseFloat(cobro.saldo_anterior) > 0 && (
                    <div className={styles.montoItem}>
                      <span className={styles.montoLabel}>Saldo Anterior</span>
                      <span className={`${styles.montoValor} ${styles.montoValorDeuda}`}>
                        +{formatoMoneda(cobro.saldo_anterior)}
                      </span>
                    </div>
                  )}
                  <div className={`${styles.montoItem} ${styles.montoItemTotal}`}>
                    <span className={styles.montoLabel}>Total a Pagar</span>
                    <span className={styles.montoValor}>{formatoMoneda(cobro.total_a_pagar)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.cobroCardAcciones}>
                {cobro.estado_pago === 'pendiente' && (
                  <>
                    <Boton
                      variante="primario"
                      tamano="sm"
                      onClick={() => handleCambiarEstado(cobro.id, 'pagado')}
                    >
                      <><CheckCircle size={16} weight="bold" /> Marcar Pagado</>
                    </Boton>
                    <Boton
                      variante="outline"
                      tamano="sm"
                      onClick={() => handleCambiarEstado(cobro.id, 'moroso')}
                    >
                      <><WarningOctagon size={16} weight="bold" /> Marcar Moroso</>
                    </Boton>
                  </>
                )}
                {cobro.estado_pago === 'moroso' && (
                  <>
                    <Boton
                      variante="primario"
                      tamano="sm"
                      onClick={() => handleCambiarEstado(cobro.id, 'pagado')}
                    >
                      <><CheckCircle size={16} weight="bold" /> Marcar Pagado</>
                    </Boton>
                    <Boton
                      variante="outline"
                      tamano="sm"
                      onClick={() => handleCambiarEstado(cobro.id, 'pendiente')}
                    >
                      <><Clock size={16} weight="bold" /> Volver a Pendiente</>
                    </Boton>
                  </>
                )}
                {cobro.estado_pago === 'pagado' && (
                  <Boton
                    variante="fantasma"
                    tamano="sm"
                    onClick={() => handleCambiarEstado(cobro.id, 'pendiente')}
                  >
                    <><ArrowCounterClockwise size={16} weight="bold" /> Deshacer Pago</>
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