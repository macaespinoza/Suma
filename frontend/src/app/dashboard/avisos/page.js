'use client';
import { useState, useEffect } from 'react';
import { Megaphone, Warning, ArrowLeft, Plus, PushPin } from '@phosphor-icons/react';
import api from '../../../lib/api';
import styles from './page.module.css';

export default function PaginaAvisos() {
  const [avisos, setAvisos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/condominios/condo-chimchorro/avisos').then(d => { setAvisos(d.datos || []); setCargando(false); }).catch(() => setCargando(false));
  }, []);

  const prioridadColor = { alta: '#ef4444', media: '#f59e0b', baja: '#3b82f6' };
  const tipoIcono = { urgente: <Warning size={18} weight="fill" />, mantencio: <Megaphone size={18} weight="fill" />, informativo: <Megaphone size={18} weight="fill" />, evento: <Megaphone size={18} weight="fill" /> };

  const formatearFecha = (f) => new Date(f).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

  return (
    <div className={styles.pagina}>
      <a href="/dashboard" className={styles.botonVolver}><ArrowLeft size={16} /> Volver</a>
      <header className={styles.cabecera}>
        <div>
          <h1 className={styles.titulo}>Avisos de Utilidad Pública</h1>
          <p className={styles.subtitulo}>Comunicaciones oficiales de la administración</p>
        </div>
        <button className={styles.botonPrimario}><Plus size={16} weight="bold" /> Publicar Aviso</button>
      </header>

      {cargando ? <p className={styles.cargando}>Cargando avisos...</p> : (
        <div className={styles.lista}>
          {avisos.map(a => (
            <article key={a.id} className={styles.avisosCard} style={{ borderLeft: `4px solid ${prioridadColor[a.prioridad]}` }}>
              {a.fijo && <div className={styles.fijo}><Pin size={14} weight="fill" /> Fijado</div>}
              <div className={styles.header}>
                <div className={styles.icono} style={{ color: prioridadColor[a.prioridad] }}>{tipoIcono[a.tipo] || <Megaphone size={18} weight="fill" />}</div>
                <div className={styles.info}>
                  <h3 className={styles.avisosTitulo}>{a.titulo}</h3>
                  <p className={styles.meta}>{formatearFecha(a.fecha_publicacion)} · {a.bloque_edificio} · Por {a.autor.nombre}</p>
                </div>
                <span className={styles.badge} style={{ background: prioridadColor[a.prioridad] }}>{a.prioridad}</span>
              </div>
              <p className={styles.contenido}>{a.contenido}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
