'use client';
import { useState, useEffect } from 'react';
import { CalendarBlank, MapPin, Users, ArrowLeft, Plus } from '@phosphor-icons/react';
import api from '../../../lib/api';
import styles from './page.module.css';

export default function PaginaEventos() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    api.get('/condominios/condo-chimchorro/eventos').then(d => { setEventos(d.datos || []); setCargando(false); }).catch(() => setCargando(false));
  }, []);

  const tipoColor = { comunidad: '#10b981', educativo: '#3b82f6', asamblea: '#f59e0b', celebracion: '#ec4899', mascotas: '#8b5cf6' };

  return (
    <div className={styles.pagina}>
      <a href="/dashboard" className={styles.botonVolver}><ArrowLeft size={16} /> Volver</a>
      <header className={styles.cabecera}>
        <div>
          <h1 className={styles.titulo}>Eventos Vecinales</h1>
          <p className={styles.subtitulo}>Calendario comunitario del Condominio Chinchorro</p>
        </div>
        <button className={styles.botonPrimario} onClick={() => setModal(true)}><Plus size={16} weight="bold" /> Crear Evento</button>
      </header>

      {cargando ? <p className={styles.cargando}>Cargando eventos...</p> : (
        <div className={styles.grid}>
          {eventos.map(e => (
            <article key={e.id} className={styles.card} style={{ borderTop: `4px solid ${tipoColor[e.tipo] || '#6b7280'}` }}>
              <div className={styles.fechaBox}>
                <span className={styles.dia}>{new Date(e.fecha).getDate()}</span>
                <span className={styles.mes}>{new Date(e.fecha).toLocaleDateString('es-CL', { month: 'short' })}</span>
              </div>
              <div className={styles.contenido}>
                <span className={styles.tipoBadge} style={{ background: tipoColor[e.tipo] }}>{e.tipo}</span>
                <h3 className={styles.tituloEvento}>{e.titulo}</h3>
                <p className={styles.descripcion}>{e.descripcion}</p>
                <div className={styles.detalles}>
                  <span><CalendarBlank size={14} /> {e.hora} hrs</span>
                  <span><MapPin size={14} /> {e.lugar}</span>
                  <span><Users size={14} /> {e.asistentes}/{e.capacidad}</span>
                </div>
                <div className={styles.organizador}>Por: {e.organizador.nombre}</div>
                <div className={styles.barraProgreso}>
                  <div className={styles.barraRelleno} style={{ width: `${(e.asistentes/e.capacidad)*100}%`, background: tipoColor[e.tipo] }} />
                </div>
                <button className={styles.botonAsistir}>✓ Confirmar asistencia</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
