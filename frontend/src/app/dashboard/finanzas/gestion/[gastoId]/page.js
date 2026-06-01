'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../../../../../lib/api';
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

export default function DetalleGasto({ params, searchParams }) {
  const router = useRouter();
  const { gastoId } = params;
  const condominioId = searchParams.condominio;

  const [periodo, setPeriodo] = useState(null);
  const [egresos, setEgresos] = useState([]);
  const [cobros, setCobros] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modales
  const [modalEgreso, setModalEgreso] = useState(false);
  const [nuevoEgreso, setNuevoEgreso] = useState({ categoria: 'Otro', descripcion: '', monto: '' });
  const [errorEgreso, setErrorEgreso] = useState('');

  const [modalPago, setModalPago] = useState(false);
  const [cobroSel, setCobroSel] = useState(null);
  const [nuevoPago, setNuevoPago] = useState({ monto_pagado: '', fecha_pago: new Date().toISOString().substring(0,10) });
  const [errorPago, setErrorPago] = useState('');

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // Cargar periodo
      const resPeriodo = await api.get(`/condominios/${condominioId}/gastos/${gastoId}`);
      setPeriodo(resPeriodo.datos);

      // Cargar egresos
      const resEgresos = await api.get(`/condominios/${condominioId}/gastos/${gastoId}/egresos`);
      setEgresos(resEgresos.datos || []);

      // Si está publicado, cargar cobros
      if (resPeriodo.datos.estado === 'publicado') {
        const resCobros = await api.get(`/condominios/${condominioId}/gastos/${gastoId}/cobros`);
        setCobros(resCobros.datos || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (condominioId && gastoId) {
      cargarDatos();
    }
  }, [condominioId, gastoId]);

  const manejarAgregarEgreso = async (e) => {
    e.preventDefault();
    setErrorEgreso('');
    try {
      await api.post(`/condominios/${condominioId}/gastos/${gastoId}/egresos`, {
        categoria: nuevoEgreso.categoria,
        descripcion: nuevoEgreso.descripcion,
        monto: parseFloat(nuevoEgreso.monto)
      });
      setModalEgreso(false);
      setNuevoEgreso({ categoria: 'Otro', descripcion: '', monto: '' });
      cargarDatos();
    } catch (err) {
      setErrorEgreso('Error al agregar el egreso.');
    }
  };

  const manejarPublicar = async () => {
    if (!confirm('¿Estás seguro de publicar este período? Esto generará los cobros para todas las unidades y no se podrán agregar más egresos.')) return;
    try {
      await api.post(`/condominios/${condominioId}/gastos/${gastoId}/publicar`);
      alert('Período publicado exitosamente.');
      cargarDatos();
    } catch (err) {
      alert('Error al publicar el período.');
    }
  };

  const abrirModalPago = (cobro) => {
    setCobroSel(cobro);
    setNuevoPago({ monto_pagado: cobro.monto_total, fecha_pago: new Date().toISOString().substring(0,10) });
    setModalPago(true);
  };

  const manejarRegistrarPago = async (e) => {
    e.preventDefault();
    setErrorPago('');
    try {
      await api.post(`/condominios/${condominioId}/cobros/${cobroSel.id}/pagos`, {
        monto_pagado: parseFloat(nuevoPago.monto_pagado),
        fecha_pago: new Date(nuevoPago.fecha_pago).toISOString()
      });
      setModalPago(false);
      cargarDatos();
    } catch (err) {
      setErrorPago('Error al registrar el pago.');
    }
  };

  if (cargando) {
    return (
      <div className={styles.pagina}>
        <Link href="/dashboard/finanzas/gestion" className={styles.botonVolver}>
          ← Volver a la Lista de Períodos
        </Link>
        <div className={styles.tarjeta}>
          <div className={styles.estadoCargando}>
            <span className={styles.estadoCargandoIcono}>⏳</span>
            <p className={styles.estadoCargandoTexto}>Cargando detalle del período...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!periodo) {
    return (
      <div className={styles.pagina}>
        <Link href="/dashboard/finanzas/gestion" className={styles.botonVolver}>
          ← Volver a la Lista de Períodos
        </Link>
        <div className={styles.tarjeta}>
          <div className={styles.estadoVacio}>
            <span className={styles.estadoVacioIcono}>⚠️</span>
            <p className={styles.estadoVacioTexto}>Período financiero no encontrado.</p>
          </div>
        </div>
      </div>
    );
  }

  const estaPublicado = periodo.estado === 'publicado';

  return (
    <div className={styles.pagina}>
      <Link href="/dashboard/finanzas/gestion" className={styles.botonVolver}>
        ← Volver a la Lista de Períodos
      </Link>

      <div className={styles.cabecera}>
        <div className={styles.tituloGrupo}>
          <h1 className={styles.titulo}>Detalle: {formatearMes(periodo.mes_anio)}</h1>
          <p className={styles.subtitulo}>
            Total Gastos: {formatearCLP(periodo.total_gastos)}
            <span className={`${styles.estadoBadge} ${estaPublicado ? styles.estadoPublicado : styles.estadoBorrador}`}>
              {periodo.estado}
            </span>
          </p>
        </div>
        {!estaPublicado && (
          <button className={styles.botonPrimario} onClick={manejarPublicar}>
            🚀 Publicar Período
          </button>
        )}
      </div>

      <div className={styles.gridContenido}>
        {/* Lado Izquierdo: Egresos */}
        <div className={styles.tarjeta}>
          <div className={styles.tarjetaHeader}>
            <h3 className={styles.tarjetaTitulo}>📋 Egresos (Gastos)</h3>
            {!estaPublicado && (
              <button className={styles.botonSecundario} onClick={() => setModalEgreso(true)}>
                + Agregar
              </button>
            )}
          </div>
          
          {egresos.length === 0 ? (
            <div className={styles.estadoVacio}>
              <span className={styles.estadoVacioIcono}>💸</span>
              <p className={styles.estadoVacioTexto}>No hay egresos registrados para este período.</p>
            </div>
          ) : (
            <div className={styles.listaScroll}>
              {egresos.map(e => (
                <div key={e.id} className={styles.itemLista}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemPrincipal}>{e.categoria}</span>
                    {e.descripcion && <span className={styles.itemSecundario}>{e.descripcion}</span>}
                  </div>
                  <span className={styles.itemValor}>{formatearCLP(e.monto)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lado Derecho: Cobros y Pagos */}
        <div className={styles.tarjeta}>
          <div className={styles.tarjetaHeader}>
            <h3 className={styles.tarjetaTitulo}>🏠 Cobros a Unidades</h3>
          </div>

          {!estaPublicado ? (
            <div className={styles.infoBox}>
              Debes publicar el período para generar los cobros a las unidades en base a la alícuota y deuda anterior.
            </div>
          ) : cobros.length === 0 ? (
            <div className={styles.estadoVacio}>
              <span className={styles.estadoVacioIcono}>🏠</span>
              <p className={styles.estadoVacioTexto}>No hay cobros generados.</p>
            </div>
          ) : (
            <div className={styles.listaScroll}>
              {cobros.map(c => (
                <div key={c.id} className={styles.itemLista}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemPrincipal}>Unidad {c.unidad_id.slice(0,4)}...</span>
                    <span className={styles.itemSecundario}>Estado: {c.estado_pago}</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 'var(--espacio-3)'}}>
                    <span className={`${styles.itemValor} ${c.estado_pago === 'pagado' ? styles.valorExito : styles.valorPendiente}`}>
                      {formatearCLP(c.monto_total)}
                    </span>
                    {c.estado_pago !== 'pagado' && (
                      <button className={styles.botonExito} onClick={() => abrirModalPago(c)}>
                        $ Pagar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Agregar Egreso */}
      {modalEgreso && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitulo}>Agregar Egreso</h3>
            {errorEgreso && <p className={styles.error}>{errorEgreso}</p>}
            <form onSubmit={manejarAgregarEgreso}>
              <div className={styles.formGrupo}>
                <label className={styles.formLabel}>Categoría</label>
                <select 
                  className={styles.formInput}
                  value={nuevoEgreso.categoria}
                  onChange={e => setNuevoEgreso({...nuevoEgreso, categoria: e.target.value})}
                >
                  {['Agua', 'Electricidad', 'Gas', 'Portería', 'Mantención', 'Aseo', 'Seguridad', 'Administración', 'Seguros', 'Otro'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGrupo}>
                <label className={styles.formLabel}>Descripción (Opcional)</label>
                <input 
                  type="text" 
                  className={styles.formInput}
                  value={nuevoEgreso.descripcion}
                  onChange={e => setNuevoEgreso({...nuevoEgreso, descripcion: e.target.value})}
                />
              </div>
              <div className={styles.formGrupo}>
                <label className={styles.formLabel}>Monto ($)</label>
                <input 
                  type="number" 
                  className={styles.formInput}
                  value={nuevoEgreso.monto}
                  onChange={e => setNuevoEgreso({...nuevoEgreso, monto: e.target.value})}
                  required
                  min="1"
                />
              </div>
              <div className={styles.modalAcciones}>
                <button type="button" className={styles.botonCancelar} onClick={() => setModalEgreso(false)}>Cancelar</button>
                <button type="submit" className={styles.botonPrimario}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Pago */}
      {modalPago && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitulo}>Registrar Pago Manual</h3>
            {errorPago && <p className={styles.error}>{errorPago}</p>}
            <form onSubmit={manejarRegistrarPago}>
              <div className={styles.formGrupo}>
                <label className={styles.formLabel}>Monto Pagado ($)</label>
                <input 
                  type="number" 
                  className={styles.formInput}
                  value={nuevoPago.monto_pagado}
                  onChange={e => setNuevoPago({...nuevoPago, monto_pagado: e.target.value})}
                  required
                  min="1"
                />
              </div>
              <div className={styles.formGrupo}>
                <label className={styles.formLabel}>Fecha de Pago</label>
                <input 
                  type="date" 
                  className={styles.formInput}
                  value={nuevoPago.fecha_pago}
                  onChange={e => setNuevoPago({...nuevoPago, fecha_pago: e.target.value})}
                  required
                />
              </div>
              <div className={styles.modalAcciones}>
                <button type="button" className={styles.botonCancelar} onClick={() => setModalPago(false)}>Cancelar</button>
                <button type="submit" className={styles.botonExito}>Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
