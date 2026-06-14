'use client';
import { useState, useEffect } from 'react';
import { CalendarBlank, MapPin, Users, Clock, ArrowLeft, CheckCircle } from '@phosphor-icons/react';
import api from '../../../lib/api';
import styles from './page.module.css';

export default function PaginaReservas() {
  const [areas, setAreas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [areaSel, setAreaSel] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/condominios/condo-chimchorro/areas-comunes'),
      api.get('/condominios/condo-chimchorro/reservas'),
    ]).then(([a, r]) => { setAreas(a.datos || []); setReservas(r.datos || []); setCargando(false); }).catch(() => setCargando(false));
  }, []);

  return (
    <div className={styles.pagina}>
      <a href="/dashboard" className={styles.botonVolver}><ArrowLeft size={16} /> Volver</a>
      <header className={styles.cabecera}>
        <div>
          <h1 className={styles.titulo}>Reservas de Áreas Comunes</h1>
          <p className={styles.subtitulo}>Quincho, sala multiuso, piscina, gimnasio y más</p>
        </div>
      </header>

      <h2 className={styles.seccionTitulo}>Áreas Disponibles</h2>
      {cargando ? <p>Cargando...</p> : (
        <div className={styles.areasGrid}>
          {areas.map(a => (
            <article key={a.id} className={styles.areaCard}>
              <div className={styles.areaHeader}>
                <MapPin size={24} weight="fill" />
                <h3>{a.nombre}</h3>
              </div>
              <p className={styles.areaDesc}>{a.descripcion}</p>
              <div className={styles.areaInfo}>
                <div><Users size={14} /> Capacidad: {a.capacidad}</div>
                <div><Clock size={14} /> {a.horario}</div>
                <div className={styles.costo}>{a.costo === 0 ? 'Gratis' : `$${a.costo.toLocaleString('es-CL')}`}</div>
              </div>
              <button className={styles.botonReservar} onClick={() => setAreaSel(a)}>Reservar</button>
            </article>
          ))}
        </div>
      )}

      <h2 className={styles.seccionTitulo}>Reservas Activas</h2>
      <div className={styles.reservasLista}>
        {reservas.map(r => (
          <div key={r.id} className={styles.reservaItem}>
            <div className={styles.reservaFecha}>
              <span className={styles.diaNum}>{new Date(r.fecha).getDate()}</span>
              <span className={styles.mesCorto}>{new Date(r.fecha).toLocaleDateString('es-CL', { month: 'short' })}</span>
            </div>
            <div className={styles.reservaInfo}>
              <h4>{r.area_nombre}</h4>
              <p>{r.usuario} · {r.unidad}</p>
              <p className={styles.horario}><Clock size={12} /> {r.hora_inicio} - {r.hora_fin}</p>
            </div>
            <span className={`${styles.estado} ${r.estado === 'confirmada' ? styles.estadoOk : styles.estadoPend}`}>
              {r.estado === 'confirmada' ? <><CheckCircle size={14} /> Confirmada</> : 'Pendiente'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
