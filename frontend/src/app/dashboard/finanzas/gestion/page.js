'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../../../lib/api';
import { ArrowLeft, Plus, Clock, CalendarBlank } from '@phosphor-icons/react';
import styles from './page.module.css';

const formatearCLP = (monto) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(monto || 0);

const formatearMes = (fecha) => {
  if (!fecha) return '—';
  const str = String(fecha).substring(0, 10);
  const [anio, mes] = str.split('-');
  const d = new Date(Date.UTC(parseInt(anio), parseInt(mes) - 1, 1));
  const nombre = d.toLocaleDateString('es-CL', { month: 'long', timeZone: 'UTC' });
  return `${nombre.charAt(0).toUpperCase() + nombre.slice(1)} ${anio}`;
};

export default function GestionFinanciera() {
  const [condominios, setCondominios] = useState([]);
  const [condominioId, setCondominioId] = useState('');
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Modal Nuevo Período
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoMes, setNuevoMes] = useState('');
  const [errorForm, setErrorForm] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/condominios');
        const lista = res.datos || [];
        setCondominios(lista);
        if (lista.length > 0) {
          setCondominioId(lista[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    cargar();
  }, []);

  const cargarGastos = async (id) => {
    setCargando(true);
    try {
      const res = await api.get(`/condominios/${id}/gastos?por_pagina=100`);
      setGastos(res.datos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (condominioId) {
      cargarGastos(condominioId);
    }
  }, [condominioId]);

  const manejarCrearPeriodo = async (e) => {
    e.preventDefault();
    setErrorForm('');
    try {
      // mes_anio debe ser YYYY-MM-DD
      const fechaIso = `${nuevoMes}-01`;
      await api.post(`/condominios/${condominioId}/gastos`, {
        mes_anio: fechaIso,
        total_gastos: 0
      });
      setMostrarModal(false);
      setNuevoMes('');
      cargarGastos(condominioId);
    } catch (err) {
      setErrorForm('Error al crear el período. Quizás ya existe.');
    }
  };

  return (
    <div className={styles.pagina}>
      <Link href="/dashboard/finanzas" className={styles.botonVolver}>
        <><ArrowLeft size={16} weight="bold" /> Volver al Dashboard Ejecutivo</>
      </Link>
      
      <div className={styles.cabecera}>
        <div className={styles.tituloGrupo}>
          <h1 className={styles.titulo}>Gestión Financiera</h1>
          <p className={styles.subtitulo}>Administra los períodos de gastos comunes y cobros.</p>
        </div>
        <button
          className={styles.botonPrimario}
          onClick={() => setMostrarModal(true)}
          disabled={!condominioId}
        >
          <><Plus size={16} weight="bold" /> Nuevo Período</>
        </button>
      </div>

      <div className={styles.filtros}>
        <div className={styles.selectorGrupo}>
          <label className={styles.selectorEtiqueta}>Condominio</label>
          <select 
            className={styles.selector}
            value={condominioId}
            onChange={(e) => setCondominioId(e.target.value)}
          >
            {condominios.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.tarjeta}>
        {cargando ? (
          <div className={styles.estadoCargando}>
            <span className={styles.estadoCargandoIcono}><Clock size={24} weight="fill" /></span>
            <p className={styles.estadoCargandoTexto}>Cargando períodos financieros...</p>
          </div>
        ) : gastos.length === 0 ? (
          <div className={styles.estadoVacio}>
            <span className={styles.estadoVacioIcono}><CalendarBlank size={32} weight="fill" /></span>
            <h3 className={styles.estadoVacioTitulo}>Sin períodos registrados</h3>
            <p className={styles.estadoVacioTexto}>
              Aún no hay períodos de gastos comunes creados para este condominio. Puedes comenzar creando el primero.
            </p>
          </div>
        ) : (
          <div className={styles.tablaScroll}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Gastos</th>
                  <th>Cobrado</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {gastos.map(g => (
                  <tr key={g.id}>
                    <td><strong>{formatearMes(g.mes_anio)}</strong></td>
                    <td>{formatearCLP(g.total_gastos)}</td>
                    <td>{formatearCLP(g.total_cobrado)}</td>
                    <td>
                      <span className={`${styles.estadoBadge} ${g.estado === 'publicado' ? styles.estadoPublicado : styles.estadoBorrador}`}>
                        {g.estado}
                      </span>
                    </td>
                    <td>
                      <Link 
                        href={`/dashboard/finanzas/gestion/${g.id}?condominio=${condominioId}`}
                        className={styles.botonAccion}
                      >
                        Ver Detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mostrarModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitulo}>Nuevo Período</h3>
            {errorForm && <p className={styles.error}>{errorForm}</p>}
            <form onSubmit={manejarCrearPeriodo}>
              <div className={styles.formGrupo}>
                <label className={styles.formLabel}>Mes y Año</label>
                <input 
                  type="month" 
                  className={styles.formInput} 
                  value={nuevoMes}
                  onChange={(e) => setNuevoMes(e.target.value)}
                  required
                />
              </div>
              <div className={styles.modalAcciones}>
                <button type="button" className={styles.botonSecundario} onClick={() => setMostrarModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className={styles.botonPrimario}>
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
