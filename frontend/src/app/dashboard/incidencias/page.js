'use client';
import { useState, useEffect } from 'react';
import { Wrench, MapPin, User, ArrowLeft, Plus, Warning, CheckCircle, Clock } from '@phosphor-icons/react';
import api from '../../../lib/api';
import styles from './page.module.css';

export default function PaginaIncidencias() {
  const [incidencias, setIncidencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    api.get('/condominios/condo-chimchorro/incidencias').then(d => { setIncidencias(d.datos || []); setCargando(false); }).catch(() => setCargando(false));
  }, []);

  const estadoColor = { nuevo: '#3b82f6', en_progreso: '#f59e0b', resuelto: '#10b981' };
  const prioridadColor = { alta: '#ef4444', media: '#f59e0b', baja: '#10b981' };
  const estadoLabel = { nuevo: 'Nuevo', en_progreso: 'En Progreso', resuelto: 'Resuelto' };
  const estadoIcono = { nuevo: <Warning size={14} />, en_progreso: <Clock size={14} />, resuelto: <CheckCircle size={14} /> };

  const filtradas = filtro === 'todas' ? incidencias : incidencias.filter(i => i.estado === filtro);

  return (
    <div className={styles.pagina}>
      <a href="/dashboard" className={styles.botonVolver}><ArrowLeft size={16} /> Volver</a>
      <header className={styles.cabecera}>
        <div>
          <h1 className={styles.titulo}>Incidencias y Mantenimiento</h1>
          <p className={styles.subtitulo}>Reporta y sigue el estado de problemas del condominio</p>
        </div>
        <button className={styles.botonPrimario}><Plus size={16} weight="bold" /> Reportar Incidencia</button>
      </header>

      <div className={styles.stats}>
        <div className={styles.statCard}><Warning size={20} /><div><span className={styles.statNum}>{incidencias.filter(i => i.estado === 'nuevo').length}</span><span className={styles.statLabel}>Nuevas</span></div></div>
        <div className={styles.statCard}><Clock size={20} /><div><span className={styles.statNum}>{incidencias.filter(i => i.estado === 'en_progreso').length}</span><span className={styles.statLabel}>En Progreso</span></div></div>
        <div className={styles.statCard}><CheckCircle size={20} /><div><span className={styles.statNum}>{incidencias.filter(i => i.estado === 'resuelto').length}</span><span className={styles.statLabel}>Resueltas</span></div></div>
      </div>

      <div className={styles.filtros}>
        {['todas', 'nuevo', 'en_progreso', 'resuelto'].map(f => (
          <button key={f} className={`${styles.filtro} ${filtro === f ? styles.filtroActivo : ''}`} onClick={() => setFiltro(f)}>
            {f === 'todas' ? 'Todas' : estadoLabel[f]}
          </button>
        ))}
      </div>

      {cargando ? <p>Cargando...</p> : (
        <div className={styles.lista}>
          {filtradas.map(i => (
            <article key={i.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.iconoBox} style={{ background: estadoColor[i.estado] + '20', color: estadoColor[i.estado] }}>
                  <Wrench size={22} weight="fill" />
                </div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardTitulo}>{i.titulo}</h3>
                  <p className={styles.cardMeta}><MapPin size={12} /> {i.ubicacion} · <User size={12} /> {i.reportado_por.nombre} ({i.reportado_por.unidad})</p>
                </div>
                <span className={styles.estadoBadge} style={{ background: estadoColor[i.estado] }}>{estadoIcono[i.estado]} {estadoLabel[i.estado]}</span>
              </div>
              <p className={styles.descripcion}>{i.descripcion}</p>
              <div className={styles.cardFooter}>
                <span className={styles.categoria}>{i.categoria}</span>
                <span className={styles.prioridad} style={{ color: prioridadColor[i.prioridad] }}>● Prioridad {i.prioridad}</span>
                {i.asignado_a && <span className={styles.asignado}>Asignado a: {i.asignado_a}</span>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
