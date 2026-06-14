'use client';
import { useState, useEffect } from 'react';
import { FileText, Download, ArrowLeft, CalendarBlank, User } from '@phosphor-icons/react';
import api from '../../../lib/api';
import styles from './page.module.css';

export default function PaginaDocumentos() {
  const [documentos, setDocumentos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/condominios/condo-chimchorro/documentos').then(d => { setDocumentos(d.datos || []); setCargando(false); }).catch(() => setCargando(false));
  }, []);

  const tipoIcono = { reglamento: '📋', acta: '📄', presupuesto: '💰', manual: '📚' };
  const tipoColor = { reglamento: '#6366f1', acta: '#10b981', presupuesto: '#f59e0b', manual: '#ec4899' };

  const filtrados = filtro === 'todos' ? documentos : documentos.filter(d => d.tipo === filtro);

  return (
    <div className={styles.pagina}>
      <a href="/dashboard" className={styles.botonVolver}><ArrowLeft size={16} /> Volver</a>
      <header className={styles.cabecera}>
        <div>
          <h1 className={styles.titulo}>Documentos y Repositorio</h1>
          <p className={styles.subtitulo}>Reglamentos, actas, presupuestos y manuales</p>
        </div>
      </header>

      <div className={styles.filtros}>
        {[{k: 'todos', l: 'Todos'}, {k: 'reglamento', l: 'Reglamentos'}, {k: 'acta', l: 'Actas'}, {k: 'presupuesto', l: 'Presupuestos'}, {k: 'manual', l: 'Manuales'}].map(f => (
          <button key={f.k} className={`${styles.filtro} ${filtro === f.k ? styles.filtroActivo : ''}`} onClick={() => setFiltro(f.k)}>{f.l}</button>
        ))}
      </div>

      {cargando ? <p>Cargando...</p> : (
        <div className={styles.grid}>
          {filtrados.map(d => (
            <article key={d.id} className={styles.docCard} style={{ borderTop: `4px solid ${tipoColor[d.tipo]}` }}>
              <div className={styles.docIcono} style={{ background: tipoColor[d.tipo] + '20', color: tipoColor[d.tipo] }}>
                <span style={{ fontSize: '2rem' }}>{tipoIcono[d.tipo]}</span>
              </div>
              <div className={styles.docInfo}>
                <h3>{d.titulo}</h3>
                <p className={styles.docDesc}>{d.descripcion}</p>
                <div className={styles.docMeta}>
                  <span><CalendarBlank size={12} /> {new Date(d.fecha_subida).toLocaleDateString('es-CL')}</span>
                  <span><User size={12} /> {d.subido_por}</span>
                  <span>📦 {d.tamano}</span>
                  <span>⬇️ {d.descargas} descargas</span>
                </div>
              </div>
              <button className={styles.botonDescargar}><Download size={14} weight="bold" /> Descargar</button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
