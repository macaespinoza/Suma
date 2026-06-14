'use client';
import { useState, useEffect } from 'react';
import { CalendarBlank, MapPin, ListChecks, ArrowLeft, CheckCircle } from '@phosphor-icons/react';
import api from '../../../lib/api';
import styles from './page.module.css';

export default function PaginaAsambleas() {
  const [asambleas, setAsambleas] = useState([]);
  const [sel, setSel] = useState(null);
  const [votaciones, setVotaciones] = useState([]);

  useEffect(() => {
    api.get('/condominios/condo-chimchorro/asambleas').then(d => { setAsambleas(d.datos || []); });
  }, []);

  const abrirAsamblea = async (a) => {
    setSel(a);
    const d = await api.get(`/asambleas/${a.id}`);
    setVotaciones(d.datos?.votaciones || []);
  };

  return (
    <div className={styles.pagina}>
      <a href="/dashboard" className={styles.botonVolver}><ArrowLeft size={16} /> Volver</a>
      <header className={styles.cabecera}>
        <div>
          <h1 className={styles.titulo}>Asambleas y Votaciones</h1>
          <p className={styles.subtitulo}>Participa en las decisiones de tu comunidad</p>
        </div>
      </header>

      <div className={styles.grid}>
        <div>
          <h2 className={styles.seccionTitulo}>Próximas Asambleas</h2>
          {asambleas.map(a => (
            <article key={a.id} className={`${styles.asamCard} ${sel?.id === a.id ? styles.asamSel : ''}`} onClick={() => abrirAsamblea(a)}>
              <div className={styles.asamHeader}>
                <div>
                  <h3>{a.titulo}</h3>
                  <p className={styles.asamDesc}>{a.descripcion}</p>
                </div>
                <span className={`${styles.estado} ${a.estado === 'convocada' ? styles.estadoPend : styles.estadoOk}`}>{a.estado}</span>
              </div>
              <div className={styles.asamInfo}>
                <span><CalendarBlank size={14} /> {new Date(a.fecha).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                <span>{a.hora} hrs</span>
                <span><MapPin size={14} /> {a.lugar}</span>
              </div>
              <div className={styles.quorum}>
                <div className={styles.quorumInfo}>
                  <span>Quórum: {a.quorum_actual}/{a.quorum_requerido}%</span>
                  <span className={styles.quorumPct}>{Math.round((a.quorum_actual/a.quorum_requerido)*100)}%</span>
                </div>
                <div className={styles.quorumBarra}>
                  <div className={styles.quorumRelleno} style={{ width: `${Math.min(100, (a.quorum_actual/a.quorum_requerido)*100)}%` }} />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div>
          {sel && (
            <>
              <h2 className={styles.seccionTitulo}>Tabla de la Asamblea</h2>
              <div className={styles.tablaCard}>
                <h3>{sel.titulo}</h3>
                <ul className={styles.tabla}>
                  {sel.tabla.map((t, i) => (
                    <li key={i}><ListChecks size={16} /> {t}</li>
                  ))}
                </ul>
              </div>

              <h2 className={styles.seccionTitulo}>Votaciones</h2>
              {votaciones.map(v => {
                const totalVotos = v.opciones.reduce((s, o) => s + o.votos, 0);
                return (
                  <div key={v.id} className={styles.votacionCard}>
                    <div className={styles.votHeader}>
                      <h3>{v.pregunta}</h3>
                      <span className={`${styles.votEstado} ${v.estado === 'abierta' ? styles.votAbierta : styles.votCerrada}`}>{v.estado}</span>
                    </div>
                    {v.opciones.map(o => {
                      const pct = totalVotos > 0 ? (o.votos/totalVotos)*100 : 0;
                      return (
                        <div key={o.texto} className={styles.opcion}>
                          <div className={styles.opcionHeader}>
                            <span>{o.texto}</span>
                            <span>{o.votos} votos ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className={styles.opcionBarra}>
                            <div className={styles.opcionRelleno} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {v.estado === 'abierta' && (
                      <button className={styles.botonVotar}>Votar ahora</button>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
